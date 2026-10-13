/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind pravi CSS samo za klase koje nađe u ovim fajlovima
  content: ['./index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        // Primarna: topla narandžasta / jantarna
        brand: {
          50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 300: '#FDBA74',
          400: '#FB923C', 500: '#F97316', 600: '#EA580C', 700: '#C2410C',
        },
        // Akcent: teal (ista nijansa kao primarna boja u samoj aplikaciji)
        accent: {
          50: '#EEF8F9', 100: '#D3EEF0', 400: '#6BB8BF', 500: '#4DA1A9', 600: '#3B8389', 700: '#2F676C',
        },
        cream: '#FFFBF5',
        ink: '#1F1A17',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(124, 58, 16, 0.18)',
        phone: '0 40px 80px -20px rgba(31, 26, 23, 0.35)',
      },
    },
  },
};
