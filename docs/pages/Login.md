# LoginPage

- Dosya: `src/pages/screens/auth/LoginPage.tsx`
- Amaç: Kullanıcı girişi; token alıp store’a yazma ve yönlendirme.

## Akış
1. Form validasyonu (email formatı, zorunlu alanlar)
2. `useLoginMutation` ile giriş isteği
3. Başarılıysa `authSlice.actions.setToken` ile token kaydı ve `/` yönlendirme

## Kullanılanlar
- Bileşenler: `AuthContainer`, `Input`, `PasswordInput`, `Button`
- Store: `useAppDispatch`, `authSlice`
- Router: `useNavigate`, `Link`
- Çeviri: `t('auth.*')`

## Notlar
- Hata durumunda konsola log (geliştirilebilir: toast/alan bazlı hata).
