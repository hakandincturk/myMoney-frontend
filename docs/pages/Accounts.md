# AccountsPage

- Dosya: `src/pages/screens/AccountsPage.tsx`
- Amaç: Hesapların listelenmesi, yeni hesap oluşturma ve mevcut hesabı güncelleme.

## İçerik
- Sayfalama, sayfa boyutu, sütun bazlı sıralama (ASC → DESC → Varsayılan)
- Liste: ad, tür, para birimi, bakiye, toplam bakiye, aksiyonlar (Düzenle)
- Modallar: Yeni hesap, Hesap düzenle

## API
- `useListMyActiveAccountsQuery(params)`
- `useCreateAccountMutation()`
- `useUpdateMyAccountMutation()`

## Kullanılanlar
- Bileşenler: `Table`, `Modal`, `Input`, `Select`, `Button`, `TableSkeleton`
- Yardımcılar: `AccountHelpers.getTypeText`, `getTypeOptions`
- Çeviri: `t('pages.accounts')`, `t('table.*')`, `t('buttons.*')`, `t('messages.*')`

## Notlar
- Para alanlarında TR formatı kullanılır; gönderim öncesi sayıya çevrilir.
- Sıralama göstergesi oklarla (↑/↓) gösterilir.
