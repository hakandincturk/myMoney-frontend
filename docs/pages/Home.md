# HomePage

- Dosya: `src/pages/screens/HomePage.tsx`
- Amaç: Açılış/özet ekranı; özet kartlar, grafikler ve hızlı erişim sunar.

## İçerik
- Özet kartlar: toplam bakiye, aylık gelir, aylık gider, tasarruf oranı (mock veriler)
- Grafikler: gelir-gider trendi (Line), hesap dağılımı (Doughnut)
- Hızlı erişim linkleri: `contacts`, `accounts`, `debts/overview`

## Kullanılanlar
- Bileşenler: `Card`, `Link`
- Kütüphaneler: `react-chartjs-2`, `chart.js`, `react-router-dom`, `i18next`

## Notlar
- Veriler mock’tur; API bağlandığında `services/*` ile entegre edilebilir.
- Karanlık mod Tailwind sınıflarıyla desteklenir.
