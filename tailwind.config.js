/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          apple: {
            dark: '#000000',
            card: '#161617',
            border: '#333336',
            text: '#f5f5f7',
            subtext: '#86868b',
            blue: '#2997ff',
            blueHover: '#0077ed'
          }
        }
      },
    },
    plugins: [],
  }