/* Tailwind v3 config mirroring the KONTABURE app theme ("icy-blue"). */
module.exports = {
  content: ['./screens.html'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'] },
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
        foreground: '#0f172a',
        slate: { 850: '#172033' },
      },
      spacing: { 4.5: '1.125rem' },
      borderRadius: { 'app-md': '10px' },
    },
  },
  plugins: [],
};
