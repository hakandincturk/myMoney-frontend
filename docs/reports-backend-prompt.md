# Backend Agent Prompt — Report (Rapor) Modülü

> Bu dosyanın **"PROMPT BAŞLANGICI"** ile **"PROMPT SONU"** arasındaki kısmını olduğu gibi
> kopyalayıp backend agent'ına verebilirsin.

---

## PROMPT BAŞLANGICI

myMoney backend projesine yeni bir **Report (Rapor)** modülü ekle. Frontend tarafında ay merkezli,
karşılaştırmalı bir rapor ekranı yapılacak ve aşağıdaki 5 endpoint'i tüketecek. Sözleşme (contract)
frontend tarafından **kesinleşmiş** durumda — alan adlarını, tiplerini ve JSON yapısını **birebir**
uygula, isim değiştirme.

### 0. Uyulacak mevcut proje kuralları

Yeni bir mimari icat etme, projedeki mevcut örüntüyü taklit et:

- Controller/Service ayrımı: mevcut `DashboardController` + `DashboardService` (ve `...Impl`)
  yapısının aynısı. Yeni sınıflar: `ReportController` / `ReportControllerImpl`,
  `ReportService` / `ReportServiceImpl`.
- Tüm response'lar mevcut `ApiResponse<T>` sarmalayıcısı ile dönmeli
  (`{ type: boolean, message: string, timestamp: string, data: T }`).
- Auth: mevcut JWT/SecurityContext üzerinden **oturum açmış kullanıcının** verisi filtrelenir.
  Endpoint'ler asla `userId` parametresi almaz.
- Soft delete: `is_removed = false` filtresi her sorguda uygulanır (mevcut repository örüntüsü ne ise).
- Swagger/OpenAPI annotation'ları mevcut controller'lardaki gibi eklenir
  (`@Tag(name = "Report", description = "Rapor işlemleri")`, `@Operation(summary=..., description=...)`).
- Para alanları `BigDecimal`, JSON'a `number` olarak serialize edilir.
- Tarih alanları `LocalDate` → `YYYY-MM-DD` string.
- DTO'lar mevcut `dto/request` ve `dto/response` paket düzenine uyar.

### 1. Domain — hesaplama kuralları (EN KRİTİK BÖLÜM)

Mevcut şema (özet):
- `transaction`: `type` ∈ `DEBT | CREDIT | PAYMENT | COLLECTION`, `total_amount`, `paid_amount`,
  `total_installment`, `status` ∈ `PENDING | PARTIAL | PAID`, `account_id`, `contact_id`, `user_id`
- `installment`: `transaction_id`, `amount`, `installment_number`, `debt_date`, `is_paid`,
  `paid_date`, `status` ∈ `ACTIVE | SKIPPED`
- `tag` + transaction–tag ilişki tablosu
- `monthly_summary` (backfill endpoint'leri mevcut: `/monthly-summery/backfill/*`)

Kurallar:

1. **Bir ayın gelir/gideri, o aya düşen `installment` satırlarından hesaplanır**
   (`installment.debt_date` ayın içinde), transaction'ın toplam tutarından değil.
   Böylece taksitli işlemler doğru aya dağılır ve gelecek aylar otomatik projekte edilir.
2. **`status = 'SKIPPED'` taksitler hiçbir toplama dahil edilmez.**
3. **Gelir / gider sınıflandırması:** Mevcut `DashboardService`'in `quick-view` ve `monthly-trend`
   uçlarında kullandığı sınıflandırma mantığının **aynısını** kullan. Yeni bir kural uydurma —
   varsa ortak bir helper'a çıkar ve her iki serviste de onu kullan. Rapor ekranındaki rakamlar
   dashboard'daki rakamlarla **tutarlı olmak zorunda**; aksi halde kullanıcı iki ekranda farklı
   sayı görür.
4. **`realized` vs `pending`:** `is_paid = true` → realized, `is_paid = false` → pending.
   `income = realizedIncome + pendingIncome`, `expense = realizedExpense + pendingExpense`,
   `net = income - expense`.
5. **`PeriodKind` hesabı** (dönemin kesinlik seviyesi):
   - Dönem bugünün ayından **önce** ise → `ACTUAL`
   - Dönem bugünün ayı ise → `PARTIAL`
   - Dönem bugünün ayından **sonra** ise → `PROJECTED`
6. **`changeRate` (yüzde değişim)** = `(current - previous) / previous * 100`.
   `previous == 0` ise **`null`** dön (frontend "—" gösterecek). Sonsuz/NaN dönme.
   Yuvarlama: 2 ondalık.
7. **`label`** alanı ayın İngilizce büyük harfli adı: `JANUARY`, `FEBRUARY`, … `DECEMBER`.
   Frontend bunu i18n `months.*` anahtarıyla çeviriyor — başka format gönderme.
8. **Performans:** Bu 5 endpoint frontend'de aynı anda paralel çağrılıyor. Ay bazlı toplamları
   her seferinde `installment` tablosunu full-scan ederek hesaplama. Mevcut `monthly_summary`
   tablosunu kullanabiliyorsan kullan; kullanamıyorsan `installment(debt_date)` ve
   `transaction(user_id)` üzerinde uygun index'lerin olduğundan emin ol ve tek sorguda
   `GROUP BY year, month` ile topla (N+1 sorgu yazma).

### 2. Endpoint'ler

Tümü `GET`, tümü `ApiResponse<T>` ile sarılı, tümü oturumdaki kullanıcıya scope'lu.

---

#### 2.1 `GET /report/summary`

Seçilen ayı önceki ve sonraki ayla karşılaştırır.

Query params:
| param | tip | zorunlu | not |
|---|---|---|---|
| `year` | int | evet | örn. 2026 |
| `month` | int | evet | 1-12 |

Response `data`:
```json
{
  "previous": { /* PeriodTotals | null */ },
  "current":  { /* PeriodTotals */ },
  "next":     { /* PeriodTotals | null */ },
  "deltaVsPrevious": {
    "incomeChangeRate": 6.24,
    "expenseChangeRate": -12.10,
    "netChangeAmount": 1000.00
  },
  "deltaVsNext": {
    "incomeChangeRate": -19.79,
    "expenseChangeRate": 4.32,
    "netChangeAmount": -11300.00
  },
  "savingRate": 18.97,
  "averageDailyExpense": 1310.00,
  "busiestDay": { "date": "2026-06-15", "amount": 12000.00 },
  "topTag": { "tagId": 3, "name": "Market", "amount": 8400.00, "share": 21.37 }
}
```

`PeriodTotals` şeması (bu doküman boyunca aynı):
```json
{
  "year": 2026,
  "month": 6,
  "label": "JUNE",
  "kind": "PARTIAL",
  "income": 48500.00,
  "expense": 39300.00,
  "net": 9200.00,
  "realizedIncome": 40000.00,
  "pendingIncome": 8500.00,
  "realizedExpense": 30000.00,
  "pendingExpense": 9300.00,
  "transactionCount": 42,
  "installmentCount": 57
}
```

Alan notları:
- `previous` / `next`: veri yoksa bile **sıfırlı bir `PeriodTotals` dön** (null yerine), sadece
  hiç kullanıcı geçmişi yoksa null olabilir. Frontend her iki durumu da karşılıyor.
- `savingRate` = `(income - expense) / income * 100`, `income == 0` ise `0`. 0-100 dışına taşabilir
  (negatif olabilir) — clamp etme, frontend clamp'liyor.
- `averageDailyExpense` = ayın gideri / ayın gün sayısı. `PARTIAL` ayda bugüne kadarki gün sayısına böl.
- `busiestDay` = ay içinde toplam giderin en yüksek olduğu tek gün. Gider yoksa `null`.
- `topTag` = ayın en çok harcanan etiketi, `share` = toplam gidere oranı (%). Etiket yoksa `null`.

---

#### 2.2 `GET /report/timeline`

Grafik için aylık seri. Geçmiş **ve** gelecek ayları içerir.

Query params:
| param | tip | zorunlu | default |
|---|---|---|---|
| `year` | int | evet | — |
| `month` | int | evet | — |
| `pastMonths` | int | hayır | 6 |
| `futureMonths` | int | hayır | 6 |

`pastMonths` ve `futureMonths` için üst sınır **24** (aşarsa 24'e clamp et, hata dönme).

Response `data`:
```json
{
  "points": [
    {
      "year": 2026, "month": 1, "label": "JANUARY", "kind": "ACTUAL",
      "income": 45000.00, "expense": 38000.00, "net": 7000.00,
      "realizedIncome": 45000.00, "pendingIncome": 0.00,
      "realizedExpense": 38000.00, "pendingExpense": 0.00,
      "transactionCount": 38, "installmentCount": 51,
      "cumulativeRemainingDebt": 84300.00
    }
  ]
}
```

- `points` **kronolojik sıralı** (eskiden yeniye), aralıktaki **her ay** dolu gelmeli —
  veri olmayan aylar için sıfırlı kayıt dön, atlama.
- `cumulativeRemainingDebt`: o ayın **sonu** itibarıyla ödenmemiş (ve `SKIPPED` olmayan)
  taksitlerin toplamı. Yani "o tarihten sonra hâlâ ödemem gereken toplam borç".

---

#### 2.3 `GET /report/tag-breakdown`

Etiket bazlı kırılım + önceki ay karşılaştırması.

Query params:
| param | tip | zorunlu | default |
|---|---|---|---|
| `year` | int | evet | — |
| `month` | int | evet | — |
| `type` | enum `EXPENSE`\|`INCOME` | hayır | `EXPENSE` |
| `sumMode` | enum `DISTRIBUTED`\|`DOUBLE_COUNT` | hayır | `DISTRIBUTED` |
| `limit` | int | hayır | 10 |

`sumMode` semantiği (mevcut `/dashboard/tag-summary` ile **aynı** olmalı):
- `DISTRIBUTED`: bir işlem N etikete sahipse tutar N'e bölünür → etiket toplamları = gerçek toplam
- `DOUBLE_COUNT`: her etikete tam tutar yazılır → etiket toplamları > gerçek toplam

Response `data`:
```json
{
  "items": [
    {
      "tagId": 3,
      "name": "Market",
      "amount": 8400.00,
      "percentage": 21.37,
      "previousAmount": 6270.00,
      "changeRate": 33.97,
      "transactionCount": 12
    },
    {
      "tagId": null,
      "name": "UNTAGGED",
      "amount": 3200.00,
      "percentage": 8.14,
      "previousAmount": 2800.00,
      "changeRate": 14.29,
      "transactionCount": 5
    }
  ],
  "total": 39300.00,
  "previousTotal": 37500.00,
  "untaggedAmount": 3200.00
}
```

- Etiketsiz işlemler için `tagId: null` ve `name: "UNTAGGED"` (sabit literal — frontend çeviriyor).
- `items` tutara göre **azalan** sıralı, `limit` kadar. `total` ve `untaggedAmount` limit'ten
  **etkilenmez**, ayın tamamını yansıtır.
- `previousAmount`: aynı etiketin bir önceki aydaki tutarı; önceki ayda yoksa `0`.

---

#### 2.4 `GET /report/top-expenses`

Seçilen ayın en büyük kalemleri.

Query params:
| param | tip | zorunlu | default |
|---|---|---|---|
| `year` | int | evet | — |
| `month` | int | evet | — |
| `type` | enum `EXPENSE`\|`INCOME` | hayır | `EXPENSE` |
| `limit` | int | hayır | 5 |

Response `data`:
```json
{
  "items": [
    {
      "transactionId": 128,
      "installmentId": 940,
      "name": "Buzdolabı",
      "description": "Arçelik 580 lt",
      "amount": 12000.00,
      "date": "2026-06-15",
      "accountName": "Garanti Bonus",
      "contactName": null,
      "tags": [ { "id": 7, "name": "Ev" } ],
      "installmentNumber": 3,
      "totalInstallment": 12,
      "paid": false
    }
  ],
  "periodTotal": 39300.00
}
```

- Sıralama: `amount` azalan. **Taksit satırı bazında** sırala (tek bir işlemin o aya düşen tutarı),
  işlemin toplam tutarına göre değil.
- Tek çekim (taksitsiz) işlemde de `installmentId` dolu gelir; `installmentNumber: 1`,
  `totalInstallment: 1`.
- `periodTotal`: o ayın toplam gideri (veya `type=INCOME` ise geliri) — frontend "bu kalem toplamın
  %X'i" hesabı için kullanıyor.

---

#### 2.5 `GET /report/recurring`

Tekrar eden harcamalar (abonelik benzeri + çok taksitli borçlar).

Query params:
| param | tip | zorunlu | default |
|---|---|---|---|
| `lookbackMonths` | int | hayır | 6 |
| `minOccurrence` | int | hayır | 3 |
| `limit` | int | hayır | 10 |

Tespit kuralı:
1. **`INSTALLMENT`**: `transaction.total_installment >= minOccurrence` olan işlemler. Bunlar zaten
   tanım gereği tekrar eden. `groupKey = "TX:" + transactionId`.
2. **`REPEATED`**: farklı transaction'lar ama **normalize edilmiş aynı isim**
   (trim + lowercase + ardışık boşlukları teke indir; Türkçe karakterler için `Locale("tr")` kullan)
   ve son `lookbackMonths` içinde **≥ `minOccurrence`** farklı ayda geçiyor.
   `groupKey = "NAME:" + normalizedName`.
3. Bir transaction her iki kurala da uyuyorsa **`INSTALLMENT`** kazanır, `REPEATED` grubuna
   tekrar dahil edilmez (çift sayım olmasın).
4. Pencere: `lookbackMonths` **geçmişe** doğru, içinde bulunulan ay dahil.
5. `SKIPPED` taksitler sayılmaz.

Response `data`:
```json
{
  "items": [
    {
      "groupKey": "NAME:netflix",
      "name": "Netflix",
      "kind": "REPEATED",
      "occurrenceCount": 6,
      "monthsSpan": 6,
      "averageAmount": 229.00,
      "totalAmount": 1374.00,
      "lastAmount": 229.00,
      "lastDate": "2026-06-05",
      "nextExpectedDate": "2026-07-05",
      "amountByMonth": [
        { "year": 2026, "month": 1, "amount": 199.00 },
        { "year": 2026, "month": 6, "amount": 229.00 }
      ],
      "tags": [ { "id": 11, "name": "Abonelik" } ],
      "active": true
    }
  ],
  "monthlyFixedCost": 11400.00,
  "fixedCostShareOfIncome": 23.50
}
```

- `items`: `averageAmount` azalan sıralı, `limit` kadar.
- `amountByMonth`: pencere içindeki **her ay** için kayıt (o ay tutar yoksa `amount: 0`),
  kronolojik sıralı — frontend sparkline çiziyor, delikli seri çizemez.
- `nextExpectedDate`:
  - `INSTALLMENT` için → bir sonraki ödenmemiş taksitin `debt_date`'i, yoksa `null`
  - `REPEATED` için → son geçiş tarihine ortalama periyot (gün) eklenerek tahmin, hesaplanamıyorsa `null`
- `active`: son 1 ay içinde geçiş varsa (veya gelecekte planlı taksiti varsa) `true`.
- `monthlyFixedCost`: `items` (limit uygulanmadan **tümü**) üzerinden aylık ortalamaların toplamı.
- `fixedCostShareOfIncome`: `monthlyFixedCost / (içinde bulunulan ayın geliri) * 100`.
  Gelir 0 ise `0`.

### 3. Validasyon ve hata davranışı

- `month` 1-12 dışındaysa veya `year` makul aralık dışındaysa (örn. < 2000 veya > 2100) →
  mevcut global exception handler üzerinden **400** ve açıklayıcı mesaj.
- Kullanıcının hiç verisi yoksa → **200** ve sıfırlı/boş yapı dön. 404 dönme.
- `limit`, `pastMonths`, `futureMonths`, `lookbackMonths`, `minOccurrence` negatif gelirse
  default'a düş, hata dönme.

### 4. Test

Mevcut test örüntüsüne uygun JUnit 5 testleri yaz. En az şunları kapsa:
- `PeriodKind` sınıflandırması (geçmiş / içinde bulunulan / gelecek ay)
- `changeRate` hesabı ve `previous == 0` → `null` davranışı
- `SKIPPED` taksitlerin toplamlara dahil edilmemesi
- `sumMode = DISTRIBUTED` ile etiket toplamlarının ay toplamına eşit çıkması
- `timeline` içinde veri olmayan ayların sıfırlı kayıtla doldurulması
- `recurring` içinde `INSTALLMENT`/`REPEATED` çift sayım yapılmaması
- Farklı kullanıcının verisinin sızmaması (izolasyon testi)

### 5. Teslim

İş bittiğinde:
1. Güncel OpenAPI/Swagger JSON dump'ını ver (frontend `endpoints.json`'ı bununla güncelleyecek).
2. Her endpoint için gerçek bir örnek response JSON'u ver.
3. `monthly_summary` tablosunu kullandıysan hangi alanları kullandığını, kullanmadıysan neden
   kullanmadığını kısaca açıkla.

## PROMPT SONU

---

## Frontend tarafında bu prompt'tan sonra yapılacaklar

- `docs/pages/Reports.md` § 8'deki 11 adımlık scaffold sırası uygulanır.
- Backend'den gelen gerçek OpenAPI dump ile `endpoints.json` güncellenir ve
  `src/types/report.ts` içindeki `ReportDTOs` sözleşmeyle karşılaştırılır (alan adı sapması var mı).
</content>
