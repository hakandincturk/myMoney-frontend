# ContactsPage

- Dosya: `src/pages/screens/ContactsPage.tsx`
- Amaç: Kişi yönetimi; listeleme, filtreleme, oluşturma, güncelleme ve silme.

## İçerik
- URL senkron filtreleme (query string) ve geri/ileri desteği
- Akıllı filtre özet çipleri (kaldırma, sıfırlama)
- Sütun sıralama (ASC → DESC → Varsayılan)
- Modallar: Kişi oluştur/düzenle

## API
- `useListMyActiveContactsQuery(filters)`
- `useCreateContactMutation()`
- `useUpdateMyContactMutation()`
- `useDeleteContactMutation()`

## Kullanılanlar
- Bileşenler: `Table`, `Modal`, `Input`, `Button`, `FilterChips`, `TableSkeleton`
- Çeviri: `t('pages.contacts')`, `t('filters.*')`, `t('buttons.*')`, `t('messages.*')`

## Notlar
- Filtreler URL’ye yazılır; boş değerler yazılmaz.
- Silme işleminde başarılı sonuçta toast gösterilir.
