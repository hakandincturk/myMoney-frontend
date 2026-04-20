---
name: mymoney-frontend
description: myMoney-frontend (Vite + React + TypeScript bütçe kontrol uygulaması) için mimari rehberi ve scaffold asistanı. Bu skill'i kullan — yeni bir sayfa/ekran, feature modülü (Budgets, Reports vb.), CRUD endpoint, RTK Query api slice, DTO namespace, ApiUrl enum girdisi, feature component (Table + Toolbar + actions/ modalları) eklenirken; mevcut RTK Query / Redux Toolkit / Redux Persist / React Router / TanStack Table / Tailwind / i18next kurulumuna uygunluğu kontrol ederken; i18n anahtarlarını tr.json + en.json'a eklerken; "mimari uyumlu mu", "review et", "yeni modül ekle", "endpoint ekle" gibi taleplerde. Ayrıca mevcut koda dokunurken convention'lara (namespace DTO, ApiUrl enum, tagTypes, namespaces/en/tr senkron, dark-mode Tailwind class'ları, store.ts entegrasyonu) uyulduğunu doğrula.
---

# myMoney-frontend Mimari Skill

Sen bu proje üzerinde çalışırken Architect'in (kullanıcı) onayladığı mimariyi KORUMAKLA yükümlüsün. Bu skill, projeye özgü kesin kuralları ve scaffold akışlarını içerir. Kod yazmadan önce bu dosyadaki ilgili bölümü tarayıp kurallara uygun üret.

---

## 0. Golden Rules — Asla İhlal Etme

1. **Tüm backend istekleri RTK Query** üzerinden yapılır. `fetch`, `axios`, `useEffect` + state ile manuel veri çekme YASAK.
2. **Hiçbir endpoint URL'si string literal olarak yazılmaz** — mutlaka `src/config/ApiUrl.ts` enum'ına eklenir ve oradan kullanılır.
3. **Tüm DTO/type'lar namespace pattern** ile `src/types/<domain>.ts` içinde tanımlanır (`export namespace XDTOs { ... }`) ve `src/types/index.ts`'ten re-export edilir.
4. **Yeni bir `xxxApi` eklendiğinde `src/store/store.ts`'ye 3 yerde** entegre edilir: `rootReducer`, `persistConfig.whitelist`, `middleware.concat`. (Ayrıca `serializableCheck.ignoredPaths` ilgili ise.)
5. **Kullanıcıya görünen HER metin i18next üzerinden** gelir. `t('...')` kullanılır, string literal UI içine yazılmaz. tr.json ve en.json **birlikte** güncellenir — anahtar sayısı ve yapısı her iki dosyada aynı olmalı.
6. **Tailwind class'ları dark mode destekli yazılır**: `bg-white dark:bg-mm-card`, `text-gray-900 dark:text-mm-text` gibi. Sadece light veya sadece dark class yazma.
7. **Sayfa-seviyesi component'ler `lazy()` + `Suspense`** ile yüklenir ve `ProtectedRoute` sarmalayıcısı içinde route'lanır.
8. **Tip güvenliği zorunlu**: `any` kullanma (baseApi içindeki error handling hariç — orada zaten var). `unknown` + narrowing tercih et.
9. **Yorumlar İngilizce**; kullanıcıya verilen yanıtlar Türkçe (global CLAUDE.md kuralı).
10. **Kod değişikliği onaylanmadan mimari değişiklik yapma** — Architect onayı şart. Mevcut pattern'leri taklit et, yeni bir pattern önermek gerekirse önce sor.

---

## 1. Teknoloji Yığını (Referans)

| Katman | Kullanılan |
|---|---|
| Build | Vite 5 |
| UI | React 18 + TypeScript (strict) |
| Routing | React Router v6 (lazy + Suspense + ProtectedRoute) |
| State | Redux Toolkit + RTK Query + redux-persist |
| Tables | @tanstack/react-table v8 |
| Styling | Tailwind CSS + class-based dark mode + `mm-*` custom palette |
| i18n | i18next + react-i18next + localStorage detection |
| Icons | FontAwesome v7 |
| Charts | chart.js + react-chartjs-2 |
| Validation | zod (yüklü, formda henüz manuel validasyon yapılıyor — zod'a geçiş Architect kararı) |
| Path alias | `@/` → `src/` |

---

## 2. Klasör Haritası

```
src/
├── components/
│   ├── ui/              # Primitive: Button, Card, Input, Modal, Toast, ...
│   ├── <feature>/       # Feature component'leri (Table, Toolbar, Form vb.)
│   │   └── actions/     # O feature'a ait modal/aksiyon component'leri
│   ├── ProtectedRoute.tsx
│   └── AuthRedirect.tsx
├── pages/
│   ├── screens/         # *Page.tsx — route'lanan tam sayfalar
│   ├── layouts/         # AppLayout.tsx
│   └── routes/          # AppRoutes.tsx
├── store/
│   ├── slices/          # Redux slice'ları + selectors
│   ├── hooks.ts         # useAppDispatch, useAppSelector
│   └── store.ts         # configureStore + persist
├── services/            # *Api.ts — her domain için bir createApi() + baseApi.ts
├── types/               # <domain>.ts — namespace XDTOs pattern + index.ts re-export
├── enums/               # <domain>.ts — TypeScript enum'ları + index.ts re-export
├── config/              # ApiUrl.ts, environment.ts, cache.ts
├── hooks/               # Custom React hooks (useToast, useCharts, ...)
├── i18n/                # index.ts + locales/tr.json, en.json
├── styles/              # index.css (Tailwind @layer)
├── utils/               # Saf yardımcı fonksiyonlar
└── constants/           # Sabitler
```

**İsimlendirme:**
- Component / Page / Type dosyaları → `PascalCase.tsx|ts`
- Hook / util / service → `camelCase.ts` (service'ler `xxxApi.ts`)
- Page component'i her zaman `XxxPage` suffix'li: `CategoriesPage.tsx`
- Feature component klasörü tekil: `category/` (çoğul değil)

---

## 3. Yeni CRUD Feature Ekleme — Scaffold Sırası

Yeni bir domain (örn. `budget`) eklendiğinde aşağıdaki adımları **bu sırayla** ve **her adımda mevcut dosyaları taklit ederek** yap. Her adımdan sonra tek bir özet cümle yaz, Architect'in müdahale edebileceği şekilde ilerle.

### Adım 1 — `src/config/ApiUrl.ts` güncelle
Benzer pattern'le (`// <Domain> endpoints` yorum bloğu) yeni endpoint'leri ekle. Örnek:
```ts
// Budget endpoints
BUDGET = '/budget/',
BUDGET_MY = '/budget/my',
BUDGET_MY_ACTIVE = '/budget/my/active',
BUDGET_MY_BY_ID = '/budget/my/{id}',
BUDGET_BY_ID = '/budget/{id}',
```
Dinamik parametreler `{id}` formatında; kullanımda `.replace('{id}', id.toString())`.

### Adım 2 — `src/enums/<domain>.ts` (varsa) ve `src/enums/index.ts` re-export
Enum'lar UPPERCASE string literal değerli TypeScript `enum`'dur:
```ts
export enum BudgetStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}
```

### Adım 3 — `src/types/<domain>.ts` (namespace DTO) ve `src/types/index.ts` re-export
```ts
export namespace BudgetDTOs {
  export type ListItem = { id: number; name: string; amount: number }
  export type SortablePageRequest = {
    pageNumber?: number
    pageSize?: number
    columnName?: string
    asc?: boolean
  }
  export type FilterRequest = SortablePageRequest & { name?: string }
  export type PagedResponse<T> = {
    content: T[]
    pageNumber: number
    pageSize: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
  }
  export type CreateRequest = { name: string; amount: number }
  export type UpdateRequest = Partial<CreateRequest>
}
```
`src/types/index.ts`'e `export * from './budget'` satırını ekle.

### Adım 4 — `src/services/<domain>Api.ts` (RTK Query slice)
`categoryApi.ts` dosyasını birebir taklit et:
- `createApi` + `reducerPath: '<domain>Api'`
- `baseQuery: baseQueryWithReauth`
- `tagTypes`: domain başına PascalCase (`['Budget']` — ilişki varsa `['Budget', 'BudgetTransaction']`)
- `query` endpoint'leri: `providesTags` (listelerde `id: 'LIST'` + tek tek id'ler)
- `mutation` endpoint'leri: `invalidatesTags` (ilgili tag'leri geçersiz kıl)
- Dosya sonunda `export const { useXxxQuery, useXxxMutation } = xxxApi`

Mutation örneği (bu projede henüz mutation az — ama pattern net):
```ts
createBudget: build.mutation<ApiResponse<BudgetDTOs.ListItem>, BudgetDTOs.CreateRequest>({
  query: (body) => ({
    url: ApiUrl.BUDGET.toString(),
    method: 'POST',
    body,
  }),
  invalidatesTags: [{ type: 'Budget', id: 'LIST' }],
}),
```

### Adım 5 — `src/store/store.ts`'ye entegre et (3 yerde)
1. `import { budgetApi } from '@/services/budgetApi'`
2. `rootReducer` içinde `[budgetApi.reducerPath]: budgetApi.reducer`
3. `persistConfig.whitelist`'in cache-enabled dalında `'budgetApi'`
4. `middleware.concat(..., budgetApi.middleware)`
5. `serializableCheck.ignoredPaths`'e `'budgetApi'` ekle

Bu adım ATLANIRSA hook'lar runtime'da boş data döndürür. Kontrol et.

### Adım 6 — Feature component'leri — `src/components/<domain>/`
Taklit edilecek referans: `src/components/category/`.
- `<Domain>Table.tsx` — TanStack Table + `createColumnHelper`, `columnHelper.accessor` + `columnHelper.display({ id: 'actions', cell: ... })`
- `<Domain>Toolbar.tsx` — search + refresh + filtered badge
- `<Domain>Actions.tsx` — satır-bazlı buton grubu, callback prop'ları
- `actions/<Action><Domain>Modal.tsx` — her aksiyon için ayrı modal (`View...`, `Rename...`, `Delete...`, `Create...`).

**Modal state yönetimi** parent tablo component'inde tutulur:
```ts
const [modalState, setModalState] = useState<{
  type: 'view' | 'rename' | 'delete' | null
  budget: BudgetDTOs.ListItem | null
}>({ type: null, budget: null })
```

### Adım 7 — `src/pages/screens/<Domain>Page.tsx`
`CategoriesPage.tsx`'yi taklit et:
- `useState<PageState>` (pageNumber, pageSize, columnName, asc)
- Search için **350ms debounce** (`setTimeout` + cleanup)
- 3-aşamalı sort: asc → desc → default (`columnName: 'id', asc: false`)
- RTK Query hook → `isLoading`, `isFetching`, `refetch`
- Tablo + Toolbar + Pagination component'leri yan yana

### Adım 8 — `src/pages/routes/AppRoutes.tsx`'e route ekle
```ts
const BudgetsPage = lazy(() => import('../screens/BudgetsPage'))
// ...
<Route path="/budgets" element={
  <ProtectedRoute requireAuth={true}>
    <Suspense fallback={<div>Yükleniyor…</div>}>
      <BudgetsPage />
    </Suspense>
  </ProtectedRoute>
} />
```

### Adım 9 — Sidebar entry (AppLayout.tsx)
`src/pages/layouts/AppLayout.tsx` içindeki nav item listesine i18n anahtarı + FontAwesome ikon ile yeni entry ekle.

### Adım 10 — i18n senkronu
`src/i18n/locales/tr.json` ve `en.json`'a **aynı anahtar yapısıyla** çevirileri ekle. (Detay için aşağıda "i18n kuralları" bölümü.)

### Adım 11 — `endpoints.json` (varsa)
Proje kökündeki `endpoints.json` backend endpoint envanteriyse, yeni endpoint'leri buraya da ekle (mevcut format neyse onu koru).

---

## 4. RTK Query — Tag ve Invalidation Kuralları

- **Query** endpoint'leri `providesTags` verir.
- **Mutation** endpoint'leri `invalidatesTags` ile ilgili query cache'lerini temizler.
- Liste tag'i her zaman `{ type: 'Domain', id: 'LIST' }`.
- Tek kayıt tag'i `{ type: 'Domain', id: <number> }`.
- İlişkili ikincil tag (örn. `CategoryTransaction`) ayrı `tagTypes` içinde tanımlanır; liste-düzeyi anahtar için domain-spesifik format kullan: `id: 'CATEGORY_${categoryId}'`.
- `skip` pattern: hook çağrısının ikinci argümanında `{ skip: !condition }` ile lazy tetikleme yap (örn. modal açık değilken veri çekme).

---

## 5. Component Yazma Kuralları

### ui/ (primitive)
- Props daima native HTML attribute'larını extend eder:  
  `type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ...; size?: ... }`
- Variant map'i component içinde `Record<Variant, string>` olarak tanımlanır — Tailwind class'ları string template'lerde birleştirilir.
- Dış kütüphane UI (MUI, Radix vb.) ekleme — Architect onayı olmadan YASAK.

### Feature component'leri
- **State feature içinde kapsüllenir**, prop drilling minimize. Parent sayfa yalnızca query/filter state'ini yönetir.
- Modal state her zaman parent tabloda tutulur (yukarıdaki `modalState` pattern).
- `useMemo` pahalı hesaplamalar için kullanılır (toplam tutar vb.).
- Actions callback prop'ları: `onView`, `onEdit`, `onDelete`, `onRename`.

### Modal / Portal
- `Modal` component'i props: `isOpen`, `onClose`, `title`, `size`, `children`.
- Yeni modal yazarken `Modal` wrapper'ı kullan — native `<dialog>` veya başka bir portal açma.

---

## 6. Forms & Validation — Mevcut Durum

- Şu an **manuel state + regex validasyon** kullanılıyor (`LoginPage.tsx` referans).
- `fieldErrors: Record<string, string>` pattern'i.
- Hata mesajları i18n: `t('validation.required')`, `t('validation.email')`.
- **zod yüklü ama aktif değil** — form'a zod entegrasyonu Architect kararı gerektirir, kendin ekleme.

---

## 7. Styling — Tailwind Kuralları

- Tüm renkler `tailwind.config.js`'teki `mm-*` paletinden (dark) veya `mm-light-*` paletinden gelir. Özel hex literal yazma (acil durum dışı — o zaman önce Architect'e danış).
- Her class iki mode'u da kapsamalı: `className="bg-white dark:bg-mm-card text-gray-900 dark:text-mm-text"`.
- Global stil eklemek için `src/styles/index.css` içindeki `@layer components` kullan.
- Animasyon keyframe'leri `styles/index.css`'e eklenir.

---

## 8. i18n Senkron Kuralları — KRİTİK

**Her UI metni için `t('namespace.key')` kullan.** Literal string YASAK (alert/console hariç — onlar da uygun değil aslında).

**Yeni anahtar ekleme akışı:**
1. `src/i18n/locales/tr.json`'u aç, ilgili namespace'i bul (örn. `"pages"`, `"common"`, `"validation"`, `"categories"`, `"budgets"`).
2. Yeni anahtarı ekle: `"budgets.title": "Bütçeler"` veya iç içe namespace: `"budgets": { "title": "Bütçeler", ... }` (dosyada hangi stil kullanılıyorsa ona uy).
3. **Aynı anahtarı `en.json`'a da ekle** — İngilizce karşılığıyla.
4. İki dosyanın anahtar kümesi (deep) **EŞİT** olmalı. Sadece birinde var olan anahtar kalmamalı. Şüphede isen key'leri karşılaştır.
5. Her değişiklikten sonra i18n JSON'ların geçerli JSON olduğunu kontrol et (`node -e "require('./src/i18n/locales/tr.json')"`).

**Anahtar senkron checklist'i:**
- [ ] tr.json'a eklendi
- [ ] en.json'a eklendi (aynı path)
- [ ] Component'te `t('...')` ile çağrıldı
- [ ] Interpolation gerekiyorsa `t('x', { count: n })` formatı

---

## 9. Mimari Uyumluluk — Review Checklist

Değişiklikleri review ederken (veya PR öncesi self-review'de) şu listeyi uygula:

### API katmanı
- [ ] Yeni endpoint string değil, `ApiUrl` enum girdisi mi?
- [ ] `xxxApi.ts` `baseQueryWithReauth` kullanıyor mu?
- [ ] `tagTypes`, `providesTags`, `invalidatesTags` doğru ve tutarlı mı?
- [ ] Yeni api slice `store.ts`'ye 3 yerde eklendi mi?
- [ ] Hook'lar `use*Query` / `use*Mutation` pattern'inde export edilmiş mi?

### Types
- [ ] Tüm DTO'lar `XDTOs` namespace'i altında mı?
- [ ] `src/types/index.ts` re-export edildi mi?
- [ ] `any` kullanımı YOK mu?
- [ ] API response'ları `ApiResponse<T>` ile sarılı mı?

### Component
- [ ] UI metni `t(...)` ile mi çekiliyor?
- [ ] Dark mode class'ları eklendi mi?
- [ ] `Modal` wrapper'ı kullanıldı mı (portal manuel açılmadı mı)?
- [ ] Modal state pattern'i doğru (parent'ta `{ type, item }`)?
- [ ] Debounced search (350ms) var mı?
- [ ] 3-aşamalı sort uygulanmış mı?

### Routing
- [ ] `lazy()` + `Suspense` + `ProtectedRoute` sarmalaması var mı?
- [ ] Sidebar'a nav entry eklendi mi?

### i18n
- [ ] tr.json ve en.json aynı key kümesine sahip mi?
- [ ] JSON geçerli mi?

### Persist
- [ ] Yeni api slice'ın `persistConfig.whitelist`'te olması gerekiyor mu (cache enabled dalında)?

### Genel
- [ ] `fetch`, `axios`, global event dispatch (toast/redirect hariç) yok mu?
- [ ] Yorumlar İngilizce mi?
- [ ] `console.log` debug kalıntısı yok mu?

---

## 10. Sık Yapılan Anti-Pattern'ler (Yapma)

- ❌ `useEffect` içinde `fetch('/api/...')` — RTK Query kullan.
- ❌ `src/services/` içinde endpoint URL'sini hard-code etme — `ApiUrl` enum'ı kullan.
- ❌ `Modal` açmak için `useState<boolean>` — `modalState: { type, item }` kullan.
- ❌ Tailwind'e özel hex `bg-[#121212]` — `bg-mm-bg` kullan.
- ❌ Sadece tr.json'a key ekleyip en.json'u unutmak.
- ❌ `xxxApi` yazıp `store.ts`'ye eklemeyi unutmak.
- ❌ Page component'ini direkt import etmek (lazy atlanmış) — `lazy()` zorunlu.
- ❌ `any` kullanmak.
- ❌ `console.log` / debug kodu bırakmak.
- ❌ Yeni bir UI kütüphanesi (MUI, Mantine, Radix) eklemek — Architect onayı gerekir.
- ❌ Form için zod'u sessizce eklemek — manuel validasyonla mevcut örüntüye uy, değişiklik önerirsen önce sor.

---

## 11. Nasıl Çalışacaksın (İş Akışı)

1. Görevi oku, hangi kategoriye girdiğini belirle: scaffold / değişiklik / review.
2. İlgili bölümü (yukarıdaki) zihinsel olarak tara.
3. Değişiklik büyükse **önce bir plan özeti** ver Architect'e ve onay iste (global CLAUDE.md kuralı).
4. Scaffold için **sıralı** ilerle (Adım 1 → Adım 11). Her adımı mevcut benzer dosyayı taklit ederek yap.
5. Her adım sonunda tek cümle özet: "Adım 3 tamam, BudgetDTOs namespace'i eklendi."
6. Bittiğinde Adım 9 checklist'i ile kendi kendine review yap.
7. "Rapor ver" dendiğinde global CLAUDE.md'deki rapor formatını kullan.
8. Türkçe cevap ver, kod/yorum İngilizce yaz.

---

## 12. Referans Dosyalar (Okumadan Taklit Etme)

Scaffold yaparken bu dosyaları açıp taklit et:

| Amaç | Referans dosya |
|---|---|
| API slice | `src/services/categoryApi.ts` |
| DTO namespace | `src/types/category.ts` |
| Enum | `src/enums/transaction.ts` |
| Tablo | `src/components/category/CategoryTable.tsx` |
| Toolbar | `src/components/category/CategoryToolbar.tsx` |
| Modal | `src/components/category/actions/ViewCategoryModal.tsx` |
| Sayfa | `src/pages/screens/CategoriesPage.tsx` |
| Route ekleme | `src/pages/routes/AppRoutes.tsx` |
| Store entegrasyonu | `src/store/store.ts` |
| Layout / nav | `src/pages/layouts/AppLayout.tsx` |
| Error handling | `src/services/baseApi.ts` |

Yeni bir pattern icat etme — bu dosyalardaki pattern'i eşle.
