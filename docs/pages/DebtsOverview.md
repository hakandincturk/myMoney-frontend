# DebtsOverviewPage

- Dosya: `src/pages/screens/DebtsOverviewPage.tsx`
- Amaç: İşlemleri (özellikle borçlar) listeleme, filtreleme; yeni borç ekleme; işlem detaylarını ve taksitlerini görüntüleme; taksit ödeme.

## İçerik
- URL senkron filtreleme ve akıllı filtre çipleri (çoklu seçim destekleri: hesap, kişi, tür)
- Sütun sıralama (ASC → DESC → Varsayılan)
- Modallar: Yeni borç, İşlem detayı (taksit tablosu), Silme onayı, Taksit ödeme
- Sonsuz kaydırma ile hesap/kişi seçimlerinde sayfa sayfa yükleme

## API
- Liste: `useListMyTransactionsQuery(filters)`
- Hesaplar: `useListMyActiveAccountsQuery`
- Kişiler: `useListMyActiveContactsQuery`
- Taksitler: `useListTransactionInstallmentsQuery(transactionId)`
- İşlemler: `useCreateTransactionMutation()`, `useDeleteTransactionMutation()`
- Ödeme: `usePayInstallmentsMutation()`

## Kullanılanlar
- Bileşenler: `Table`, `Modal`, `Input`, `Select`, `DatePicker`, `StatusBadge`, `FilterChips`, `TableSkeleton`
- Yardımcılar: `TransactionHelpers.getTypeOptions/getTypeText`
- Çeviri: `t('pages.debts')`, `t('table.*')`, `t('filters.*')`, `t('buttons.*')`, `t('status.*')`

## Notlar
- Para alanları TR formatından sayıya parse edilerek gönderilir.
- Detay modalında taksitler yüklendikten sonra özet (toplam ödenen/ödenecek) hesaplanır.
