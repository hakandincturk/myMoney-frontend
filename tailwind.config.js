/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        mm: {
          // Dark Mode - Pastel Breeze
          bg: '#121212',           // Ana arka plan
          card: '#1E1E1E',         // Kart arka planı
          cardHover: '#2C2C2C',    // Kart hover
          border: '#2A2A2A',       // Border/divider
          primary: '#90CAF9',      // Ana renk (Pastel Mavi)
          primaryHover: '#B3E5FC', // Primary hover
          secondary: '#A5D6A7',    // İkincil (Mint Yeşil)
          accent: '#FFB74D',       // Vurgu (Pastel Turuncu)
          accentHover: '#FFA726',  // Accent hover
          text: '#E0E0E0',         // Ana metin
          subtleText: '#B0BEC5',   // İkincil metin
          placeholder: '#9E9E9E',  // Placeholder
          disabled: '#757575',     // Disabled metin
          danger: '#EF5350',       // Danger/uyarı
          dangerHover: '#E53935',  // Danger hover
          
          // Light Mode - Pastel Breeze Light
          light: {
            bg: '#FAFAFA',         // Ana arka plan
            card: '#FFFFFF',       // Kart arka planı
            cardHover: '#F5F5F5',  // Kart hover
            border: '#E0E0E0',     // Border/divider
            primary: '#64B5F6',    // Ana renk (Pastel Mavi)
            primaryHover: '#42A5F5', // Primary hover
            secondary: '#81C784',  // İkincil (Mint Yeşil)
            accent: '#FFB74D',     // Vurgu (Pastel Turuncu)
            accentHover: '#FFA726', // Accent hover
            text: '#212121',       // Ana metin
            subtleText: '#616161', // İkincil metin
            placeholder: '#9E9E9E', // Placeholder
            disabled: '#9E9E9E',   // Disabled metin
            danger: '#EF5350',     // Danger/uyarı
            dangerHover: '#E53935', // Danger hover
          }
        },
      },
    },
  },
  plugins: [],
}

