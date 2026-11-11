# Backend Agent Prompt — Report Modülü, Revizyon 2

> İlk teslim (5 endpoint, 369 test) **kabul edildi**. Bu doküman kabul incelemesinden çıkan
> sözleşme değişikliklerini, bug fix'leri ve son teslimi (frontend prompt'u) içerir.
>
> **"PROMPT BAŞLANGICI"** ile **"PROMPT SONU"** arasını olduğu gibi kopyala.

---

## PROMPT BAŞLANGICI

Report modülü teslimi incelendi ve kabul edildi. Sınıflandırmayı `TransactionClassifier` ile tek
kaynağa çekmen, `monthly_summary`'yi bayatlık riski nedeniyle kullanmaman, DISTRIBUTED'da kuruş
artığını ilk etikete ekleyip `Σ items.amount == total` eşitliğini garantilemen — hepsi doğru
kararlardı, korunacak.

Aşağıda üç grup iş var: **(A)** sözleşme değişiklikleri, **(B)** bug fix'ler, **(C)** son teslim.

Frontend kodu **henüz yazılmadı**, dolayısıyla A grubundaki breaking change'lerde geriye dönük
uyumluluk kaygın olmasın — doğrusunu yap, eskisini sil.

---

# A. Sözleşme değişiklikleri

## A1. `deltaVsNext` yönü ters çevrilecek — BREAKING

**Mevcut durum:** her iki delta da `(current − other) / other` ile hesaplanıyor. Bu, `deltaVsNext`
için "bu ay gelecek aya göre ne kadar fazla" anlamına geliyor — frontend'in ihtiyacı olan
"gelecek ay bu aya göre nasıl değişiyor" değil. Ham `PeriodTotals`'tan türetilebiliyor ama o zaman
alan ölü ağırlık oluyor.

**Yeni kural — her iki delta da zaman yönünde ileri okunur:**

| Alan | Hesap | Payda |
|---|---|---|
| `deltaVsPrevious` | `previous → current` geçişi | `previous` |
| `deltaVsNext` | `current → next` geçişi | `current` |

```
deltaVsPrevious.incomeChangeRate  = (current.income - previous.income) / previous.income * 100   [DEĞİŞMEDİ]
deltaVsPrevious.expenseChangeRate = (current.expense - previous.expense) / previous.expense * 100 [DEĞİŞMEDİ]
deltaVsPrevious.netChangeAmount   = current.net - previous.net                                    [DEĞİŞMEDİ]

deltaVsNext.incomeChangeRate  = (next.income - current.income) / current.income * 100    [DEĞİŞTİ]
deltaVsNext.expenseChangeRate = (next.expense - current.expense) / current.expense * 100 [DEĞİŞTİ]
deltaVsNext.netChangeAmount   = next.net - current.net                                   [DEĞİŞTİ — işaret dahil]
```

Payda 0 ise `null` kuralı aynen geçerli — dikkat, `deltaVsNext`'in paydası artık `next` değil
**`current`**.

**Doğrulama:** mevcut seed veriyle (`year=2026&month=8`) yeni değerler şunlar olmalı:

```
current: income 51000.00, expense 28829.00, net 22171.00
next:    income 48500.00, expense 12000.00, net 36500.00

deltaVsNext.incomeChangeRate  = (48500 - 51000) / 51000 * 100 =  -4.90
deltaVsNext.expenseChangeRate = (12000 - 28829) / 28829 * 100 = -58.38
deltaVsNext.netChangeAmount   = 36500 - 22171                 = 14329.00
```

(Eski değerler sırasıyla `5.15` / `140.24` / `-14329.00` idi.) Testleri ve
`docs/report/examples/*.json` dosyalarını güncelle.

## A2. `TimelinePoint.projectedRemainingDebt` eklenecek — YENİ ALAN

**Sorun:** `cumulativeRemainingDebt` geçmişte anlamlı (o an taşınan borç) ama **gelecekte düz
gidiyor** — örnekte Ağu/Eyl/Eki hepsi `29229.00`. Tanım gereği doğru (gelecekte hiçbir taksit
"ödenmiş" değil) ama frontend'in çizmek istediği "planına uyarsan borcun nasıl eriyecek" eğrisi bu
değil.

**Çözüm:** `cumulativeRemainingDebt`'i **olduğu gibi bırak**, yanına ikinci bir alan ekle:

```
projectedRemainingDebt(M) = Σ amount
  WHERE is_paid = false
    AND status <> 'SKIPPED'
    AND debt_date > <M ayının son günü>
```

Yani: "M ayının sonundan sonraki vadeye sahip, henüz ödenmemiş taksitlerin toplamı." Vadesi geçmiş
ama ödenmemiş taksitler, kendi aylarından sonraki noktalarda doğal olarak düşer — bu istenen
davranış, çünkü metrik "plana uyulursa" varsayımıyla okunuyor.

Bu tanım M büyüdükçe **monoton azalan** bir eğri üretir ve geçmiş aylar için de anlamlıdır
("o ayın sonunda önümde ne kadar borç vardı").

**Doğrulama:** `year=2026&month=8&pastMonths=2&futureMonths=2` için Ağustos noktasında
`cumulativeRemainingDebt = 29229.00` iken Ağustos'un kendi ödenmemişi `17229.00` olduğuna göre
`projectedRemainingDebt(AUGUST) = 12000.00` çıkmalı; `SEPTEMBER` için Eylül'ün `12000.00`'ı da
düştüğünde `0.00`'a inmeli.

İki alanın farkını Javadoc'ta net yaz — ileride karıştırılacak en olası yer burası.

## A3. `ReportSummaryResponseDto`'ya gün alanları eklenecek — YENİ ALAN

**Sorun:** `averageDailyExpense`, PARTIAL ayda bugüne kadarki gün sayısına bölünüyor. Ayın 3'ünde
`28829 / 3 = 9609.67` çıkıyor — ay sonunda ~930 olacak bir metrik 10 kat şişik görünüyor.
Frontend bunu gösterecek ama **doğru etiketleyebilmesi için böleni ve ay sonu projeksiyonunu
bilmesi gerekiyor**.

Ekle:

| Alan | Tip | Anlam |
|---|---|---|
| `daysInMonth` | `int` | Seçilen ayın toplam gün sayısı (28/29/30/31) |
| `daysElapsed` | `int` | `averageDailyExpense` hesabında kullanılan bölen. `PARTIAL` → ayın bugüne kadarki gün sayısı (bugün dahil); `ACTUAL`/`PROJECTED` → `daysInMonth` |
| `projectedMonthEndExpense` | `BigDecimal` | `PARTIAL` ise `averageDailyExpense × daysInMonth`; değilse `expense` alanının aynısı |

`projectedMonthEndExpense` bilinçli olarak naif doğrusal projeksiyon — planlı taksitleri ayrıca
hesaplamana gerek yok, o bilgi zaten `pendingExpense` alanında var. Javadoc'ta "doğrusal tahmin"
olduğunu belirt.

## A4. `ReportRecurringResponseDto`'ya pencere alanları eklenecek — YENİ ALAN

**Sorun:** `/report/recurring` `year`/`month` almıyor, hep sunucunun bugününden geriye bakıyor.
Frontend'de bu panel ay-bazlı panellerin yanında duracak; hangi aralığı gösterdiğini kullanıcıya
yazabilmesi için pencereyi bilmesi lazım. `items` boş geldiğinde `amountByMonth`'tan da türetemiyor.

Ekle:

```
windowStart: { year, month, label }   // pencerenin ilk ayı
windowEnd:   { year, month, label }   // pencerenin son ayı = sunucunun bugünkü ayı
```

`label` yine `"JANUARY"`…`"DECEMBER"` formatında. Mevcut bir `ReportPeriodRefDto` yoksa oluştur;
`items` boş olsa bile bu iki alan **her zaman dolu** gelmeli.

## A5. `TopTagDto.tagId` nullable olacak — DAVRANIŞ NETLEŞTİRME

Şu an `tagId` non-null tiplenmiş; UNTAGGED grubu ayın en büyüğü olduğunda ne olacağı belirsiz.

**Karar:** UNTAGGED grubu `topTag` olmaya **uygundur**. O durumda
`tagId: null`, `name: "UNTAGGED"` dön — `tag-breakdown` ile birebir aynı örüntü.
`TopTagDto.tagId`'yi nullable yap ve bu senaryo için test ekle.

---

# B. Bug fix'ler

Bunlar Report modülünün dışında ama Report'un doğru çalışması ve tutarlı görünmesi için gerekli.
Her birini **ayrı commit** yap.

## B1. 401 response'unda `timestamp` sayı dizisi dönüyor — ÖNCELİKLİ

401'de `timestamp` alanı string yerine `[2026,8,3,15,59,25,382516000]` geliyor. Sebep: authentication
entry point / exception handler kendi `ObjectMapper`'ını kuruyor ve Spring'in
`JavaTimeModule` + `WRITE_DATES_AS_TIMESTAMPS=false` konfigürasyonunu almıyor.

Aynı API'nin iki farklı tarih formatı üretmesi kabul edilemez — frontend'in bunu "tolere etmesi"
çözüm değil. Spring-managed `ObjectMapper` bean'ini inject et (veya aynı modül/feature ayarlarını
uygula) ki **tüm** response'larda `timestamp` `"2026-08-03T16:03:18.611114"` formatında olsun.

Hem 401 hem 403 hem de global exception handler yollarını kontrol et. Bir entegrasyon testi ekle:
"geçersiz token ile istek → 401 ve `timestamp` string".

## B2. `DashboardServiceImpl.quickViewResponse` — tasarruf oranı hatalı

`savingRate` hesabında `totalExpense = expenseDetail.getWaiting()` kullanılıyor; gerçekleşen gider
hesaba katılmadığı için oran şişik çıkıyor.

Bu, Ana Sayfa ile Raporlar ekranının **aynı ay için farklı tasarruf oranı göstermesi** demek —
tam olarak `TransactionClassifier`'ı çıkararak önlediğimiz sınıf hata. Report tarafındaki
`ReportMathUtils.savingRate(...)` doğru; dashboard'u da **aynı util'e delege et**, formülü ikinci
kez yazma.

Mevcut dashboard testleri beklenen değerleri eski (hatalı) formüle göre kurguladıysa **testleri
düzelt**, kodu değil. Değişikliğin kullanıcıya yansıyacağını (gösterilen oran düşecek) commit
mesajında belirt.

## B3. `MonthlySummeryTypes` enum değer çakışması

`TRANSACTION(1)` ve `PAYMENT(1)` — iki sabit aynı numerik değere sahip. Değere göre arama yapan
her yerde sessiz yanlış eşleşme üretir.

**Önce şunu kontrol et:** bu numerik değer veritabanına yazılıyor mu (`monthly_summary` tablosunda
bir `type` kolonu var mı)?
- **Yazılıyorsa** → değeri değiştirmek veri bozar. Kullanılmayan yeni bir değer seç, Flyway
  migration ile mevcut satırları güncelle, migration'ı ayrı commit yap.
- **Yazılmıyorsa** → doğrudan benzersiz değer ata.

Hangi yolu seçtiğini ve neden seçtiğini raporla.

## B4. `DashboardServiceImpl.monthlyTrend` içinde `System.out.println(1)`

Sil. Kod tabanında başka `System.out.print*` kalmışsa onları da temizle (logger kullanılacaksa
uygun seviyede logger'a çevir).

## B5. `JwtAuthenticationFilter.doFilterInternal` — eksik `return`

`shouldNotFilter` true olduğunda `filterChain.doFilter(...)` çağrılıyor ama `return` yok; zincir
ikinci kez işlenip 401 yazılabiliyor. `OncePerRequestFilter` gerçek container'da bunu maskeliyor
ama latent bug. `return` ekle.

## B6. `DashboardRules` yanlış exception tipi kullanıyor

`jakarta.validation.ValidationException` fırlatıyor; global handler bunu yakalamadığı için
validasyon hataları **500** dönüyor. Report tarafında `core.exception.ValidationException`
kullanıldı ve 400 dönüyor. Dashboard'u da aynı tipe geçir, bir test ile 400 döndüğünü doğrula.

## B7. `DashboardServiceImpl.tagSummary` — N+1

Taksit başına lazy `getTransactionTags()` çağrısı var. Report tarafında bunu projeksiyon
sorgusuyla çözdün; dashboard'u da aynı sorguya taşı. Davranış birebir aynı kalmalı — mevcut
dashboard testleri değişmeden geçmeli.

---

# C. Teslim

## C1. Güncel OpenAPI dump ve örnekler

A grubundaki değişikliklerden sonra:
- `docs/report/openapi.json` yeniden üretilsin
- `docs/report/examples/*.json` **gerçek HTTP çağrılarıyla** yeniden alınsın (yeni `deltaVsNext`
  değerleri, `projectedRemainingDebt`, gün alanları, pencere alanları dahil)

## C2. Frontend prompt'u — EN ÖNEMLİ TESLİM

Tüm iş bittikten sonra, frontend agent'ına verilecek **tek parça, kopyala-yapıştır bir prompt**
üret. Bu prompt'u üretirken aşağıdaki kısıtlara **harfiyen** uy — frontend projesinin mimari
kuralları bunlar ve ihlal edilirse çıkan kod reddedilir.

### C2.1 Frontend projesinin bağlamı

Frontend ayrı bir repo: **myMoney-frontend** (Vite 5 + React 18 + TypeScript strict + Redux Toolkit
+ RTK Query + redux-persist + React Router v6 + TanStack Table v8 + Tailwind + i18next + chart.js).
Frontend agent'ının backend repo'suna **erişimi yok** — bu yüzden prompt'a dosya yolu referansı
verme, gereken her şeyi (tipler, örnek JSON'lar) **prompt'un içine göm**.

Frontend repo'sunda şu iki doküman zaten mevcut ve prompt onlara referans verebilir:
- `docs/pages/Reports.md` — ekran tasarımı, bileşen ağacı (§6), 11 adımlık scaffold sırası (§8)
- `.claude/skills/mymoney-frontend/SKILL.md` — mimari kurallar

### C2.2 Prompt'un uyması ZORUNLU olan mimari kurallar

Bunları prompt'un içinde **açıkça yaz**, "projenin kurallarına uy" deyip geçme:

1. **DTO'lar namespace pattern ile.** Düz `interface` **değil**:
   ```ts
   // src/types/report.ts
   export namespace ReportDTOs {
     export type PeriodKind = 'ACTUAL' | 'PARTIAL' | 'PROJECTED'
     export type PeriodTotals = { /* ... */ }
     // ...
   }
   ```
   Ardından `src/types/index.ts`'e `export * from './report'` eklenecek.

2. **Endpoint URL'leri asla string literal değil.** Hepsi `src/config/ApiUrl.ts` enum'ına
   `// Report endpoints` yorum bloğuyla eklenecek, kullanımda enum'dan okunacak.

3. **Tüm istekler RTK Query.** `fetch` / `axios` / `useEffect`+state YASAK.
   `src/services/reportApi.ts`: `createApi`, `reducerPath: 'reportApi'`,
   `baseQuery: baseQueryWithReauth`, `tagTypes: ['Report']`, hepsi `build.query` (mutation yok),
   `providesTags` dönem bazlı (örn. `{ type: 'Report', id: 'SUMMARY_2026_8' }`),
   `keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0`.

4. **`src/store/store.ts`'ye 4 noktadan entegrasyon** — bu adım atlanırsa hook'lar runtime'da boş
   döner: `rootReducer`, `persistConfig.whitelist` (cache-enabled dalı), `middleware.concat`,
   `serializableCheck.ignoredPaths`.

5. **`any` yasak.** `unknown` + narrowing kullanılacak.

6. **Tüm response'lar `CommonTypes.ApiResponse<T>` ile sarılı** — hook dönüşleri
   `ApiResponse<ReportDTOs.SummaryResponse>` şeklinde tiplenecek, `data.data` ile erişilecek.

7. **Her kullanıcıya görünen metin i18next'ten.** Yeni `reports.*` namespace'i
   `src/i18n/locales/tr.json` **ve** `en.json`'a **aynı anahtar yapısıyla** eklenecek; iki dosyanın
   anahtar kümesi birebir eşit olmalı. Ay adları için mevcut `months.*` anahtarları kullanılacak
   (`label` alanı bu anahtarlarla eşleşiyor).

8. **Tailwind class'ları çift modlu.** `bg-white dark:bg-mm-card`, `text-slate-900 dark:text-mm-text`
   gibi; sadece light veya sadece dark class yazılmayacak. Özel hex literal yok, `mm-*` paleti.

9. **Route `lazy()` + `Suspense` + `ProtectedRoute` ile.** Path: `/reports`. Sidebar'a
   `AppLayout.tsx` içine `faChartPie` ikonuyla `t('sidebar.reports')` entry'si eklenecek.
   (Not: v2 dashboard'daki CommandBar'ın "Raporlar" aksiyonu zaten `/reports`'a yönlendiriyor ama
   route yok — bu ekran onu da kapatacak.)

10. **Bileşen yapısını yeniden tasarlama.** `docs/pages/Reports.md` §6'daki ağaç geçerli:
    `ReportPeriodBar`, `PeriodComparisonHero`, `ReportKpiStrip`, `ReportTimelineChart` (lazy),
    `TagBreakdownPanel`, `TagDonutPanel` (lazy), `TopExpensesPanel`, `RecurringExpensesPanel`,
    `Sparkline`, `DeltaBadge`, `ReportInsightBar`.

11. **Formatlama helper'ları `@/utils/formatters`'tan** gelir (`formatTRY`, `formatCompactTRY`,
    `formatPercent`, `formatShortDate`, `daysUntil`). Yenisini yazma.

12. **`console.log` bırakılmayacak, yorumlar İngilizce yazılacak.**

### C2.3 Prompt'un içermesi gereken bölümler

Şu sırayla, eksiksiz:

1. **Genel sözleşme** — `ApiResponse<T>` sarmalayıcısı, JWT, `userId` parametresi olmadığı,
   hata davranışı (400 / 401 / 404 asla), para ve tarih formatları, `timestamp`'ın artık **her
   yerde** string olduğu (B1 düzeltildikten sonra).

2. **`ReportDTOs` namespace'i, tam haliyle** — kopyalanıp `src/types/report.ts`'e yapıştırılabilir
   olmalı. Her alanın yanına satır içi yorumla: birimi, null olabilirliği, `limit`'ten etkilenip
   etkilenmediği.

3. **Endpoint tablosu** — parametre, zorunluluk, default, sınır. `/report/recurring`'in `year`/`month`
   almadığı açıkça yazılacak.

4. **Alan semantikleri ve UI kuralları** — özellikle:
   - `label` bir i18n anahtarıdır, ham gösterilmez
   - `kind` üç değerinin görsel karşılığı (PROJECTED → kesikli + soluk + rozet; yalnız renge
     güvenilmez)
   - `realized` vs `pending` ayrımı
   - **`deltaVsPrevious` ve `deltaVsNext`'in ikisi de zaman yönünde ileri okunur** (A1'deki yeni
     kural) — bu, sözleşmenin en kolay yanlış anlaşılacak yeri, örnekle anlat
   - `changeRate === null` → `"—"` göster, `?? 0` yapma, hesaba katma
   - `savingRate` negatif olabilir
   - `averageDailyExpense` + `daysElapsed` + `daysInMonth` + `projectedMonthEndExpense` birlikte
     kullanılır; `PARTIAL` ayda etiket "bugüne kadar günlük ort." olmalı ve yanında ay sonu
     projeksiyonu gösterilmeli (A3)
   - `cumulativeRemainingDebt` (geçmişe bakan) ile `projectedRemainingDebt` (geleceğe bakan)
     farkı — grafikte hangisinin çizileceği (A2)
   - `sumMode`: `DISTRIBUTED` → `Σ items.amount == total`, pasta grafik için bunu kullan;
     `DOUBLE_COUNT` → yüzdeler %100'ü aşar, pasta grafikte kullanma
   - `total` / `untaggedAmount` / `monthlyFixedCost` `limit`'ten etkilenmez
   - `tagId === null` → `name: "UNTAGGED"`, `t('reports.tags.untagged')` ile çevrilir;
     `topTag` da null `tagId` dönebilir (A5)
   - `top-expenses` sıralaması taksit satırı bazında; `3/12` rozeti yalnız `totalInstallment > 1`
     iken
   - `recurring`: `INSTALLMENT` vs `REPEATED` farkı, `groupKey`'in React key olarak kullanılması,
     `nextExpectedDate`'in REPEATED'da tahmin olduğu, `amountByMonth`'un deliksiz olduğu,
     `windowStart`/`windowEnd`'in panel başlığında gösterileceği (A4)

5. **Gerçek örnek response'lar** — beş uç için de, **revizyon sonrası** gerçek HTTP çağrılarından
   alınmış, tam `ApiResponse` sarmalayıcısı dahil, JSON olarak gömülü.

6. **Frontend'in kendi türeteceği değerler** — backend'den gelmeyen, client-side hesaplanacaklar:
   - "sonraki ay" rozeti artık `deltaVsNext`'ten doğrudan okunur (A1 sonrası)
   - `ReportInsightBar` cümleleri (en yüksek pozitif `changeRate`, en derin negatif net
     `PROJECTED` nokta, en uzun `monthsSpan`) — **yeni endpoint yok**
   - "Diğer" dilimi = `total − Σ items.amount` (yalnız `DISTRIBUTED` modda doğru)
   - Kalemin payı = `amount / periodTotal`

7. **Yapılacaklar listesi** — `docs/pages/Reports.md` §8'deki 11 adımın sırası, ve
   `endpoints.json`'ın yeni OpenAPI dump ile güncelleneceği.

8. **Tuzaklar** — kısa madde listesi.

### C2.4 Prompt'un formatı

- **Türkçe** yazılacak (kod ve kod yorumları İngilizce).
- `PROMPT BAŞLANGICI` / `PROMPT SONU` işaretleri arasında olacak.
- İçinde "backend repo'suna bak", "şu dosyaya bak" gibi frontend agent'ının erişemeyeceği
  referans **olmayacak**.
- Frontend'e mimari **karar** sorma; kararlar verilmiş, prompt bunları bildirir.

### C2.5 Ayrıca raporla

- A grubundaki her değişikliğin **eski → yeni** değer karşılaştırması (seed veri üzerinden)
- B grubundaki her fix için: neyi değiştirdin, hangi test kanıtlıyor, kullanıcıya yansıyan
  davranış değişikliği var mı
- B3'te hangi yolu seçtiğin (migration'lı mı, migration'sız mı) ve neden
- `./mvnw clean verify` çıktısı

## PROMPT SONU

---

## Bu revizyondan sonra frontend tarafında yapılacaklar

1. Backend'in ürettiği frontend prompt'u gözden geçir (C2 kısıtlarına uymuş mu).
2. `docs/pages/Reports.md` § 5'teki `ReportDTOs` sözleşmesini gerçekleşen hale güncelle
   (`previous`/`next` non-null, `installmentId` non-null, `projectedRemainingDebt`,
   `daysInMonth`/`daysElapsed`/`projectedMonthEndExpense`, `windowStart`/`windowEnd`).
3. § 3'te `ReportKpiStrip` (A3 etiketleme) ve `RecurringExpensesPanel` (A4 pencere başlığı)
   maddelerini güncelle.
4. § 8'deki 11 adımlık scaffold'u uygula.
