# RegisterPage

- Dosya: `src/pages/screens/auth/RegisterPage.tsx`
- Amaç: Kullanıcı kayıt akışı; alan validasyonları ve başarı sonrası login’e yönlendirme.

## Akış
1. Alan validasyonları (ad, email, şifre, şifre tekrar, telefon)
2. Telefon formatlama: `+90 5XX XXX XX XX`
3. `useRegisterMutation` ile kayıt isteği; 400 validasyonları alana yansıtılır
4. Başarı: 1.5 sn sonra `/login` sayfasına yönlendirme (bilgi mesajı parametreleriyle)

## Kullanılanlar
- Bileşenler: `AuthContainer`, `Input`, `PasswordInput`, `Button`
- Router: `useNavigate`, `Link`
- Çeviri: `t('auth.*')`, `t('messages.*')`, `t('validation.*')`

## Notlar
- Şifre değişiminde `confirmPassword` hatası yeniden hesaplanır.
- Telefon validasyonu regex ile yapılır; gönderim öncesi format korunur.
