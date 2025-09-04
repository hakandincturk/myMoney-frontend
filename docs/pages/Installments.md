# InstallmentsPage

- Dosya: `src/pages/screens/InstallmentsPage.tsx`
- Amaç: Aylık taksitleri listeleme, filtreleme ve taksit ödeme.

## İçerik
- Ay/Yıl seçimi (hızlı önceki/sonraki ay), aktif filtre çipleri
- URL senkron filtreleme (transactionName, description, min/max amount, paid tarihleri, isPaid)
- Sütun sıralama (ASC → DESC → Varsayılan)
- Modal: Taksit ödeme (tarih seçimi)

## API
- Liste: `useListMonthlyInstallmentsQuery(filters)`
- Ödeme: `usePayInstallmentMutation()`

## Kullanılanlar
- Bileşenler: `Table`, `Modal`, `Input`, `Select`, `DatePicker`, `FilterChips`, `TableSkeleton`, `StatusBadge`
- Enum: `TransactionStatus`
- Çeviri: `t('pages.installments.*')`, `t('filters.*')`, `t('buttons.*')`, `t('installment.*')`

## Notlar
- Tutar alanları TR formatından sayıya çevrilerek gönderilir.
- Ay/Yıl varsayılanı: mevcut ay ve yıl.
