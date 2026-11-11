# Backend Agent Prompt — Report Modülü, Revizyon 3 (A3 düzeltmesi)

> Küçük ve dar kapsamlı bir düzeltme turu. Revizyon 2 kabul edildi; yalnızca A3 (günlük ortalama /
> ay sonu tahmini) hatalı çıktı ve iki test fixture'ı eksik.
>
> **"PROMPT BAŞLANGICI"** ile **"PROMPT SONU"** arasını olduğu gibi kopyala.

---

## PROMPT BAŞLANGICI

Revizyon 2 kabul edildi — A1 (delta yönü), A2 (`projectedRemainingDebt`), A4 (pencere alanları),
A5 (nullable `topTag.tagId`) ve B grubundaki tüm fix'ler doğru çıktı, aritmetik seed veri üzerinde
doğrulandı. Ürettiğin frontend prompt'u da mimari kısıtlara uygun.

Tek bir hata var: **A3 yanlış tasarlanmıştı.** Aşağıdaki düzeltmeyi yap. Kapsam dar, başka bir
şeye dokunma.

---

## 1. Sorun

`GET /report/summary?year=2026&month=8` şunu dönüyor:

```json
"averageDailyExpense": 9609.67,
"daysInMonth": 31,
"daysElapsed": 3,
"projectedMonthEndExpense": 297899.77
```

Hesap talimatıma uygun (`28829 / 3 = 9609.67`, `9609.67 × 31 = 297899.77`) ama **talimat yanlıştı.**
İki ayrı kırık var:

### 1.1 `averageDailyExpense` boyut olarak tutarsız

Pay `expense = 28829.00`; bunun `pendingExpense = 17229.00` kadarı **ayın ilerisinde** vadesi gelen
taksitler (örn. 15 Ağustos'taki `12000.00`'lık buzdolabı taksiti). Payda ise yalnızca geçmiş 3 gün.

Yani tam ayı kapsayan bir tutar, kısmi aya ait bir güne bölünüyor. Sonuç boyutsal olarak anlamsız.

### 1.2 `projectedMonthEndExpense` bu domainde kavramsal olarak geçersiz

myMoney'de her gider bir `installment` satırından gelir ve her taksitin `debt_date`'i **baştan
bellidir**. Dolayısıyla içinde bulunulan ayın toplam gideri zaten tam olarak biliniyor:
`current.expense` **zaten** ay sonu rakamıdır.

Ekstrapole edilecek bir büyüklük yok; ekstrapolasyon, zaten bilinen planlı taksitleri defalarca
tekrar sayıyor. Ayın 3'ünde ₺297.899,77 çıkmasının sebebi bu.

---

## 2. Yapılacak değişiklik

### 2.1 `projectedMonthEndExpense` alanını tamamen kaldır

`ReportSummaryResponseDto`'dan sil. Hesabını yapan kodu, testlerini ve OpenAPI şemasındaki karşılığını
da kaldır. Yerine başka bir tahmin alanı **ekleme** — ay sonu gideri zaten `expense` alanında.

### 2.2 `averageDailyExpense` formülünü düzelt

```
averageDailyExpense = realizedExpense / daysElapsed
```

`expense` değil **`realizedExpense`** kullanılacak. Böylece pay ve payda aynı zaman aralığını
kapsıyor: "bugüne kadar fiilen harcanan / bugüne kadar geçen gün".

- `PARTIAL` ay → `daysElapsed` = ayın bugüne kadarki gün sayısı (bugün dahil)
- `ACTUAL` ay → `daysElapsed = daysInMonth`, `realizedExpense` zaten ayın tamamı
- `PROJECTED` ay → `realizedExpense = 0` olduğu için sonuç `0.00` olur; bu **doğru** davranıştır
  (gelecek ayda henüz hiçbir şey gerçekleşmedi), 0 dönmesinden çekinme

`daysElapsed` 0 olamaz ama savunmacı ol: 0 ise `0.00` dön, bölme hatası fırlatma.

`daysInMonth` ve `daysElapsed` alanları **kalıyor** — frontend "3/31 gün" etiketini bunlarla yazıyor.

**Doğrulama:** mevcut seed veriyle `year=2026&month=8` için:

```
realizedExpense = 11600.00, daysElapsed = 3
averageDailyExpense = 11600 / 3 = 3866.67     (eski: 9609.67)
projectedMonthEndExpense                       (alan tamamen yok)
```

`year=2026&month=7` (ACTUAL) için: `realizedExpense = 23499.00`, `daysElapsed = 31` →
`averageDailyExpense = 758.03`.

### 2.3 Javadoc

`averageDailyExpense` alanının Javadoc'una şunu yaz: *gerçekleşen giderin geçen güne bölümü;
ayın toplam gideri zaten `expense` alanındadır ve planlı taksitler nedeniyle baştan bilinir.*
İleride biri "ay sonu tahmini" eklemek isterse neden gereksiz olduğunu görsün.

---

## 3. Eksik test fixture'ları

Aşağıdaki iki senaryo mevcut seed veriyle **hiç test edilmemiş**. Fixture ekle ve testle.

### 3.1 `occurrenceCount` ile `monthsSpan` ayrışmalı

Şu an üç örnek kaydın üçünde de bu iki alan birebir aynı (`2/2`, `4/4`, `4/4`). Dolayısıyla
"`averageAmount = totalAmount / monthsSpan`, `occurrenceCount`'a değil" kararın fiilen
doğrulanmamış durumda.

**Aralıklı bir tekrar fixture'ı ekle:** aynı isimli işlem Mayıs'ta var, Haziran'da **yok**,
Temmuz ve Ağustos'ta var → `occurrenceCount = 3`, `monthsSpan = 4`.

Test şunları doğrulasın:
- İki alan farklı değer üretiyor
- `averageAmount == totalAmount / monthsSpan` (yani `/3` değil `/4`)
- `amountByMonth` Haziran için `amount: 0.00` içeriyor (deliksizlik korunuyor)

### 3.2 Çok taksitli veriyle `projectedRemainingDebt` eğrisi

Seed'de Buzdolabı `3/12`, İhtiyaç Kredisi `4/12` görünüyor ama gelecek taksit satırları yok —
`cumulativeRemainingDebt` toplam `29229.00`'da kalıyor. Yani eğri gerçekçi çok taksitli veriyle
hiç görülmedi.

**Gelecek taksitleri olan bir fixture ekle** (örn. 12 taksitli bir işlemin kalan 9 taksiti ileri
tarihli ve ödenmemiş). Test şunları doğrulasın:
- `projectedRemainingDebt` ay ilerledikçe **kesin olarak azalıyor** (yalnız düz gitmiyor)
- Son taksitin ayından sonraki noktalarda `0.00`'a iniyor
- Aynı seride `cumulativeRemainingDebt` gelecekte **sabit** kalıyor (iki metriğin farkı kanıtlanmış olsun)

---

## 4. Teslim

1. `docs/report/openapi.json` yeniden üretilsin (`projectedMonthEndExpense` artık yok).
2. `docs/report/examples/summary.json` yeniden alınsın (gerçek HTTP çağrısı,
   `averageDailyExpense: 3866.67`).
3. Revizyon 2'de ürettiğin **frontend prompt'unun** şu üç yerini güncelle ve güncel halini ver:
   - `ReportDTOs.SummaryResponse` tipinden `projectedMonthEndExpense` satırını sil
   - §4'teki "`averageDailyExpense` + `daysElapsed` + `daysInMonth` + `projectedMonthEndExpense`
     birlikte kullanılır" bloğunu yeniden yaz: alan artık **gerçekleşen** giderin günlük ortalaması;
     ay sonu tahmini diye bir şey yok, ay toplamı zaten `expense`. Önerilen kart metni:
     *"Günlük ort. (gerçekleşen) ₺3.867 · 3/31 gün"* + alt satır *"Ay toplamı ₺28.829 —
     ₺17.229'u planlı"*
   - §8 Tuzaklar'daki `projectedMonthEndExpense` maddesini kaldır
4. `./mvnw clean verify` çıktısı.

Ayrıca not düş: `minOccurrence` varsayılanı 3 iken `INSTALLMENT` tipi kayıtların
`occurrenceCount`'u 3'ten küçük olabiliyor (kurala `total_installment >= minOccurrence` üzerinden
giriyorlar — seed'deki Buzdolabı `occurrenceCount: 2` bu yüzden). Bu doğru davranış; frontend'in
bunu tutarsız veri sanıp filtrelememesi için prompt'ta bir cümleyle açıkla.

## PROMPT SONU
