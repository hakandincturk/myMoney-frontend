# ReportsPage — Rapor / Özet Ekranı (Tasarım)

> Durum: **Uygulandı.** Backend revizyon 2 canlı; A3 (günlük ortalama) düzeltmesi backend'de
> beklemede — bkz. `docs/reports-backend-prompt-v3-a3fix.md`. Frontend bu alanı sunucudan
> okumak yerine `realizedExpense / daysElapsed` ile kendisi türetiyor, dolayısıyla iki backend
> sürümünde de doğru çalışıyor.

- Dosya: `src/pages/screens/ReportsPage.tsx`
- Route: `/reports` (v2 dashboard `CommandBar` içindeki "Raporlar" aksiyonu zaten buraya yönleniyor)
- Sidebar: `faChartPie` ikonu, `t('sidebar.reports')`
- Amaç: Ay merkezli finansal rapor. Geçmiş ayların özeti, seçilen ayın kırılımı,
  önceki/sonraki ay ile karşılaştırma, tekrar eden harcamalar ve gelecek projeksiyonu.

---

## 1. Konumlandırma — Dashboard ve Taksitler'den farkı

| Ekran | Odak | Zaman |
|---|---|---|
| Home (v2 Dashboard) | "Şu an ne durumdayım?" | Sadece **bu ay** |
| Installments | "Neyi ne zaman ödeyeceğim?" (operasyonel liste) | Tek ay, satır bazlı |
| **Reports (yeni)** | "Nereye harcıyorum, trend ne, geçen aya göre ne değişti?" | **Çok aylı, karşılaştırmalı** |

Reports ekranı **işlem yapmaz** (create/update/delete yok) — salt okunur analiz ekranıdır.
Drill-down gerektiğinde ilgili ekrana query string ile yönlendirir
(örn. etiket kartına tıklayınca `/debts/overview?tags=3&startDate=...&endDate=...`).

---

## 2. Ekran Yerleşimi

```
┌────────────────────────────────────────────────────────────────────────┐
│  Raporlar                                    [Gider|Gelir]  [12A ▾] ⟳ │
├────────────────────────────────────────────────────────────────────────┤
│  ◀  Şub   Mar   Nis   May  ▐HAZİRAN▌ Tem*  Ağu*  Eyl*  ▶               │  A. Period Strip
│      -2K   +8K   +1K   +8K    +9.2K   -2K*  -4K*  +1K*                  │     (* = projeksiyon)
├────────────────────────────────────────────────────────────────────────┤
│  ┌── MAYIS ────────┐ ┏━━ HAZİRAN 2026 ━━━━━━━┓ ┌── TEMMUZ (plan) ──┐  │  B. Comparison Hero
│  │ Gelir  ₺45.700  │ ┃ Gelir  ₺48.500  ▲ %6  ┃ │ Gelir  ₺38.900     │  │
│  │ Gider  ₺37.500  │ ┃ Gider  ₺39.300  ▲ %5  ┃ │ Gider  ₺41.000  ▲  │  │
│  │ Net    +₺8.200  │ ┃ Net    +₺9.200  ▲12%  ┃ │ Net    -₺2.100  ▼  │  │
│  └─────────────────┘ ┗━━━━━━━━━━━━━━━━━━━━━━━┛ └────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│ [Toplam Gider ▲%5] [Toplam Gelir ▲%6] [Tasarruf %19] [Günlük Ort ₺1.3K] │  C. KPI Strip
├────────────────────────────────────────────────────────────────────────┤
│  Gelir / Gider Zaman Serisi                            ● Gelir ● Gider │  D. Timeline Chart
│  ▁▃▅▂▇▄▆█ ┊┊┊  (gelecek aylar kesikli + soluk, seçili ay vurgulu)      │
├──────────────────────────────────┬─────────────────────────────────────┤
│ E. Kategori Karşılaştırma        │ F. Kategori Dağılımı                │
│    Market  ████████ ₺8.4K  ▲%34  │       ◐ Donut                       │
│    Kira    ██████   ₺7.0K   =    │    Top 5 + delta chip               │
│    Ulaşım  ███      ₺2.1K  ▼%12  │    "Etiketsiz ₺3.2K"                │
├──────────────────────────────────┼─────────────────────────────────────┤
│ G. Bu Ay En Çok Ne?              │ H. Tekrar Eden Harcamalar           │
│    🥇 Buzdolabı  ₺12.000 · 12 tk │    Netflix  ₺229  6 ay  ▁▁▁▁▁▁     │
│    🥈 Kira       ₺7.000          │    Kira     ₺7.0K 12 ay ▃▃▄▄▅▅     │
│    🥉 Market     ₺2.400          │    ────────────────────────────      │
│    ...                            │    Sabit gider: ₺11.4K/ay (%23)     │
├────────────────────────────────────────────────────────────────────────┤
│ 💡 Market harcaman geçen aya göre %34 arttı · 3 aydır Netflix ödüyorsun │  I. Insight Bar
└────────────────────────────────────────────────────────────────────────┘
```

Responsive: `lg` altında E/F ve G/H blokları tek kolona düşer. Period strip yatay scroll olur
(`overflow-x-auto snap-x`). Comparison Hero `md` altında dikey stack, seçili ay en üstte.

---

## 3. Bölüm Detayları

### A. `ReportPeriodBar`
- ±6 ay penceresinde ay chip'leri; her chip'te ay kısaltması + o ayın net rakamı (compact).
- Bugünden sonraki aylar `PROJECTED` rozetiyle soluk + kesikli border.
- İçinde bulunulan ay `PARTIAL` (ay bitmemiş) → farklı ton.
- Seçili ay state'i URL'e senkronlanır: `/reports?year=2026&month=6`
  (DebtsOverview'daki `useSearchParams` pattern'i birebir uygulanır).
- Sağda pencere genişliği toggle'ı: `6A / 12A / 24A` → timeline sorgusunu etkiler.
- Sağda `Gider | Gelir` toggle'ı → E ve F panellerinin `type` parametresini değiştirir.

### B. `PeriodComparisonHero`
- 3 kolon: önceki ay (küçük/soluk) — seçili ay (büyük, ring'li) — sonraki ay (kesikli, "plan" rozeti).
- Seçili ay kolonunda her satırda delta rozeti: `▲ %6` / `▼ %12`.
- **Renk semantiği kritik:** gider artışı **kırmızı**, gider azalışı **yeşil**; gelir tersi.
  Yani "artış = yeşil" değil, "iyi = yeşil". Bunun için `tone` prop'u (`good | bad | neutral`) ile
  yön hesabı `metric`'ten türetilir.
- Prev/next kolonlarına tıklanınca o aya geçilir (period bar ile senkron).

### C. `ReportKpiStrip`
4 kart, `InsightsStrip` görsel diliyle (rounded-2xl, hover -translate-y-0.5):
1. Toplam Gider + önceki aya göre %
2. Toplam Gelir + önceki aya göre %
3. Tasarruf oranı (ring göstergesi — `SavingsRing` mantığı yeniden kullanılır). Negatif olabilir;
   ring 0-100 clamp'lenir ama ham değer tooltip'te gösterilir.
4. Ortalama günlük harcama (+ "en yoğun gün" alt satırı)

**`PARTIAL` ayda 4. kart özel davranır.** Backend `averageDailyExpense`'i ayın *bugüne kadarki*
gün sayısına bölüyor (`daysElapsed`), dolayısıyla ayın başında değer ay sonundakinin katları kadar
yüksek çıkar (örn. 3 Ağustos'ta ₺9.610 → ay sonunda ~₺930). Kart gizlenmez, ama:
- Etiket `reports.kpi.dailyAverageSoFar` ("bugüne kadar günlük ort.") olur
- Alt satırda `projectedMonthEndExpense` ile "bu hızla ay sonu ≈ ₺X" gösterilir
- `daysElapsed / daysInMonth` küçük punto ile belirtilir ("3/31 gün")

`ACTUAL` ve `PROJECTED` aylarda normal etiket (`reports.kpi.dailyAverage`) kullanılır.

### D. `ReportTimelineChart`
- chart.js **Bar + Line combo**: gelir/gider bar, net line (ikinci eksen yok, aynı eksen).
- Gelecek aylar: `borderDash: [6,4]` + `%40` opacity → "projeksiyon".
- Seçili ay barı vurgulu (diğerleri `%60` opacity).
- Bar'a tıklamak o ayı seçer → tüm sayfa o aya göre yeniden yüklenir.
- `lazy()` ile ayrı chunk (dashboard `ChartsSection` pattern'i).

### E. `TagBreakdownPanel`
- Yatay karşılaştırma barları. Her etiket satırında iki ince bar: seçili ay (dolu) / önceki ay (outline).
- Sağda tutar + delta chip.
- En çok harcanan üstte, `limit=10` + "Tümünü gör".
- Satıra tıklama → `/debts/overview?tags={id}&startDate=…&endDate=…`

### F. `TagDonutPanel`
- Donut (mevcut `ChartConfigFactory.createDoughnutChartConfig()` yeniden kullanılabilir).
- Altında Top-5 liste, her satırda delta chip.
- "Etiketsiz" dilimi ayrı renkle (gri) — kullanıcı etiketleme boşluğunu görsün.
- `sumMode` (DISTRIBUTED / DOUBLE_COUNT) toggle'ı — mevcut `TagPanel` ile aynı semantik.

### G. `TopExpensesPanel`
- O ayın en büyük 5 harcaması, rank rozetli (1..5).
- Her satır: ad, tutar, tarih, hesap, etiket chip'leri, taksitse `3/12` rozeti, ödendi/bekliyor durumu.
- Üstte tek satırlık vurgu: "Bu ayın en büyük kalemi **Buzdolabı** — toplam giderin **%31**'i".

### H. `RecurringExpensesPanel`

**Bu panel ay seçiciyi TAKİP ETMEZ.** `/report/recurring` `year`/`month` almıyor; her zaman
sunucunun bugününden geriye `lookbackMonths` kadar bakıyor. Yanındaki `TopExpensesPanel` ay-bazlı
olduğu için sessiz bir tutarsızlık doğuyor — kullanıcı Mart'ı seçtiğinde solda "Mart'ın kalemleri",
sağda "son 6 ay" görür.

Çözüm: panel başlığının altına pencereyi **açıkça yaz** — backend'in döndüğü
`windowStart` / `windowEnd` alanlarından: *"Mart 2026 – Ağustos 2026"*. Böylece bağımsızlık
gizlenmek yerine görünür kılınır. (`items` boş olsa bile bu alanlar dolu gelir.)

- Tekrar eden harcamalar: aynı `transaction.name` (normalize) veya çok taksitli işlemler.
- Her satır: ad, aylık ortalama tutar, kaç aydır sürüyor, son 6 ay **sparkline** (saf SVG, chart.js yok).
- `INSTALLMENT` (taksitli borç) ve `REPEATED` (tekrar eden manuel işlem) rozetleri ayrı.
- Alt toplam: "Sabit giderin ₺11.400/ay — gelirinin %23'ü".

### I. `ReportInsightBar`
- **Client-side türetilir**, ekstra endpoint yok. Elde edilen DTO'lardan kural bazlı cümleler:
  - En çok artan kategori (`changeRate` max)
  - En uzun süredir tekrar eden kalem
  - Gelecek ayın gideri bu aydan yüksekse uyarı
  - Tasarruf oranı negatifse uyarı
- Maksimum 3 cümle, chip formatında, i18n interpolation ile.

---

## 4. Yükleme / Hata / Boş Durum

- Her panel **kendi** `isLoading` / `hasError` / `isEmpty` durumunu yönetir (dashboard v2 pattern'i).
  Bir endpoint patlarsa sayfanın geri kalanı çalışmaya devam eder.
- Skeleton: `Skeleton` / `CardSkeleton` bileşenleri.
- Boş durum: ikon + başlık + ipucu satırı (`TrendsPanel`'deki empty state dili).
- Ay değiştirirken `isFetching` → panellerde `opacity-60 pointer-events-none` geçiş, skeleton'a düşme yok
  (flicker önlemi).

---

## 5. API Sözleşmesi (Frontend'in beklediği)

### `src/config/ApiUrl.ts`
```ts
// Report endpoints
REPORT_SUMMARY = '/report/summary',
REPORT_TIMELINE = '/report/timeline',
REPORT_TAG_BREAKDOWN = '/report/tag-breakdown',
REPORT_TOP_EXPENSES = '/report/top-expenses',
REPORT_RECURRING = '/report/recurring',
```

### `src/types/report.ts`
```ts
export namespace ReportDTOs {
  // Bir dönemin verisi ne kadar kesin?
  //  ACTUAL    → ay tamamen geçmiş, rakamlar kesinleşmiş
  //  PARTIAL   → içinde bulunulan ay, kısmen gerçekleşmiş
  //  PROJECTED → gelecek ay, sadece planlı taksitlerden hesaplanmış
  export type PeriodKind = 'ACTUAL' | 'PARTIAL' | 'PROJECTED'

  export type FlowType = 'EXPENSE' | 'INCOME'
  export type SumMode = 'DISTRIBUTED' | 'DOUBLE_COUNT'

  export type PeriodTotals = {
    year: number
    month: number            // 1-12
    label: string            // "JUNE" — i18n months.* anahtarıyla eşleşir
    kind: PeriodKind
    income: number
    expense: number
    net: number
    realizedIncome: number
    pendingIncome: number
    realizedExpense: number
    pendingExpense: number
    transactionCount: number
    installmentCount: number
  }

  export type Delta = {
    incomeChangeRate: number | null   // yüzde; önceki dönem 0 ise null
    expenseChangeRate: number | null
    netChangeAmount: number
  }

  // --- 1) /report/summary ---
  export type SummaryRequest = { year: number; month: number }
  export type SummaryResponse = {
    previous: PeriodTotals | null
    current: PeriodTotals
    next: PeriodTotals | null
    deltaVsPrevious: Delta
    deltaVsNext: Delta
    savingRate: number                 // 0-100
    averageDailyExpense: number
    busiestDay: { date: string; amount: number } | null
    topTag: { tagId: number | null; name: string; amount: number; share: number } | null
  }

  // --- 2) /report/timeline ---
  export type TimelineRequest = {
    year: number
    month: number
    pastMonths?: number      // default 6
    futureMonths?: number    // default 6
  }
  export type TimelinePoint = PeriodTotals & {
    cumulativeRemainingDebt: number
  }
  export type TimelineResponse = { points: TimelinePoint[] }

  // --- 3) /report/tag-breakdown ---
  export type TagBreakdownRequest = {
    year: number
    month: number
    type?: FlowType          // default EXPENSE
    sumMode?: SumMode        // default DISTRIBUTED
    limit?: number           // default 10
  }
  export type TagBreakdownItem = {
    tagId: number | null     // null = etiketsiz
    name: string
    amount: number
    percentage: number
    previousAmount: number
    changeRate: number | null
    transactionCount: number
  }
  export type TagBreakdownResponse = {
    items: TagBreakdownItem[]
    total: number
    previousTotal: number
    untaggedAmount: number
  }

  // --- 4) /report/top-expenses ---
  export type TopExpensesRequest = {
    year: number
    month: number
    type?: FlowType          // default EXPENSE
    limit?: number           // default 5
  }
  export type TopExpenseItem = {
    transactionId: number
    installmentId: number | null
    name: string
    description: string | null
    amount: number
    date: string             // YYYY-MM-DD
    accountName: string
    contactName: string | null
    tags: { id: number; name: string }[]
    installmentNumber: number | null
    totalInstallment: number | null
    paid: boolean
  }
  export type TopExpensesResponse = {
    items: TopExpenseItem[]
    periodTotal: number
  }

  // --- 5) /report/recurring ---
  export type RecurringRequest = {
    lookbackMonths?: number  // default 6
    minOccurrence?: number   // default 3
    limit?: number           // default 10
  }
  export type RecurringKind = 'INSTALLMENT' | 'REPEATED'
  export type RecurringMonthAmount = { year: number; month: number; amount: number }
  export type RecurringItem = {
    groupKey: string
    name: string
    kind: RecurringKind
    occurrenceCount: number
    monthsSpan: number
    averageAmount: number
    totalAmount: number
    lastAmount: number
    lastDate: string
    nextExpectedDate: string | null
    amountByMonth: RecurringMonthAmount[]   // sparkline verisi, eskiden yeniye sıralı
    tags: { id: number; name: string }[]
    active: boolean
  }
  export type RecurringResponse = {
    items: RecurringItem[]
    monthlyFixedCost: number
    fixedCostShareOfIncome: number   // 0-100
  }
}
```

### `src/services/reportApi.ts`
- `reducerPath: 'reportApi'`, `baseQuery: baseQueryWithReauth`
- `tagTypes: ['Report']`
- `providesTags` dönem bazlı: `{ type: 'Report', id: 'SUMMARY_2026_6' }` gibi
- Tüm endpoint'ler `build.query`, mutation yok (salt okunur ekran)
- `keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0`
- Hook'lar: `useGetReportSummaryQuery`, `useGetReportTimelineQuery`,
  `useGetTagBreakdownQuery`, `useGetTopExpensesQuery`, `useGetRecurringQuery`

### `src/store/store.ts` (3+2 nokta)
`rootReducer` · `persistConfig.whitelist` · `middleware.concat` · `serializableCheck.ignoredPaths`

---

## 6. Bileşen Ağacı

```
src/pages/screens/ReportsPage.tsx        # period state + URL sync, panelleri dizer
src/components/report/
├── ReportPeriodBar.tsx
├── PeriodComparisonHero.tsx
├── ReportKpiStrip.tsx
├── ReportTimelineChart.tsx     (lazy — chart.js, ayrı chunk)
├── TagBreakdownPanel.tsx
├── TagDonutPanel.tsx           (lazy — chart.js, ayrı chunk)
├── TopExpensesPanel.tsx
├── RecurringExpensesPanel.tsx
├── Sparkline.tsx               (saf SVG, bağımlılıksız)
├── DeltaBadge.tsx              (▲/▼ + tone hesabı, her yerde kullanılır)
├── PeriodKindBadge.tsx         (ACTUAL/PARTIAL/PROJECTED rozeti)
├── ReportInsightBar.tsx
├── periodUtils.ts              (ay aritmetiği, varsayılan dönem, PeriodKind türetimi)
└── index.ts
```

`PeriodKindBadge` ve `periodUtils` ilk tasarımda yoktu; rozet iki panelde (period bar + hero)
kullanıldığı, ay aritmetiği ise dört yerde tekrarlandığı için ayrıştırıldı.

**Formatters (tamamlandı):** `formatTRY` / `formatCompactTRY` / `formatPercent` /
`formatShortDate` / `formatDayMonthYear` / `daysUntil` / `bucketOfDate` artık
`src/utils/formatters.ts` içinde. `src/components/dashboard/v2/formatters.ts` kaldırıldı,
v2 bileşenlerinin 7 import'u `@/utils/formatters`'a taşındı. Report bileşenleri de buradan alacak.

---

## 7. i18n

Yeni namespace: `reports.*` (tr.json + en.json **eş zamanlı**).

```
reports.title, reports.subtitle
reports.period.{previous,current,next,projected,partial,actual,thisMonth,window6,window12,window24}
reports.comparison.{income,expense,net,vsPrevious,vsNext,plan}
reports.kpi.{totalExpense,totalIncome,savingRate,dailyAverage,busiestDay}
reports.timeline.{title,subtitle,projectedHint,empty,emptyHint}
reports.tags.{title,subtitle,untagged,viewAll,empty,previousMonth,sumMode,distributed,doubleCount}
reports.top.{title,subtitle,rank,biggestItem,shareOfTotal,empty,installmentBadge}
reports.recurring.{title,subtitle,months,monthlyAverage,fixedCost,fixedCostShare,installment,repeated,empty,emptyHint}
reports.insight.{tagIncreased,tagDecreased,longestRecurring,nextMonthHigher,negativeSaving}
reports.errors.loadFailed
sidebar.reports, pages.reports
```

Mevcut `months.*` anahtarları backend'in döndüğü `label` (JANUARY…) ile birebir eşleşiyor —
`DateUtils.translateMonthName` yeniden kullanılır.

---

## 8. Uygulama Sırası (skill Adım 1→11)

1. `ApiUrl.ts` → 5 endpoint
2. `enums/report.ts` → `PeriodKind`, `FlowType`, `SumMode`, `RecurringKind` + `enums/index.ts`
3. `types/report.ts` → `ReportDTOs` + `types/index.ts`
4. `services/reportApi.ts`
5. `store.ts` entegrasyonu (4 nokta)
6. `components/report/*` (önce `DeltaBadge` + `Sparkline`, sonra paneller)
7. `pages/screens/ReportsPage.tsx`
8. `AppRoutes.tsx` → `lazy` + `Suspense` + `ProtectedRoute`
9. `AppLayout.tsx` → sidebar entry (`faChartPie`)
10. `tr.json` + `en.json` senkron
11. `endpoints.json` — backend hazır olunca yeni OpenAPI dump ile güncellenir

---

## 9. Notlar / Riskler

- **Gelecek ay verisi sadece taksitlerden gelir.** Kullanıcının henüz girmediği düzensiz
  harcamalar projeksiyonda görünmez. UI bunu açıkça söylemeli (`reports.timeline.projectedHint`).
- **`sumMode`**: bir işlem birden çok etikete sahip olabilir. `DOUBLE_COUNT` her etikete tam tutarı
  yazar (toplam > gerçek), `DISTRIBUTED` tutarı etiketlere böler (toplam = gerçek).
  Donut için varsayılan `DISTRIBUTED`.
- **Zaman dilimi**: tüm tarih hesapları backend'de kullanıcının ayına göre yapılır; frontend
  `year`/`month` gönderir, UTC/ISO dönüşümü yapmaz.
- **İki borç metriği karıştırılmamalı.** `cumulativeRemainingDebt` geçmişe bakar (o ayın sonunda
  taşınan borç) ve gelecekte **düz gider** — hiçbir gelecek taksit "ödenmiş" olmadığı için.
  `projectedRemainingDebt` geleceğe bakar ("planına uyarsan borcun nasıl erir") ve monoton azalır.
  Timeline grafiğinde çizilecek olan **`projectedRemainingDebt`**'tir; `cumulativeRemainingDebt`
  yalnızca geçmiş dönem tooltip'inde bilgi olarak kullanılabilir.
- **Delta yönü**: `deltaVsPrevious` ve `deltaVsNext` **ikisi de zaman yönünde ileri okunur**.
  `deltaVsNext` = `(next − current) / current`, yani "gelecek ay bu aya göre nasıl değişiyor".
  Backend revizyon 2'de bu yöne çevrildi; eski yön (`(current − next) / next`) hero kartındaki
  "sonraki ay" rozetiyle ters düşüyordu.
- Sayfa 5 paralel istek atıyor — backend'in bunları `monthly_summary` üzerinden ucuza karşılaması
  önemli (bkz. backend prompt).
</content>
</invoke>
