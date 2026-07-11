/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // "Дала түні" (Steppe night) palette
        night: {
          950: '#0e0e16',
          900: '#14141f',
          800: '#1c1c2a',
          700: '#28283a',
          600: '#3a3a52',
        },
        parchment: {
          100: '#f6efe0',
          200: '#ece0c8',
        },
        ember: {
          400: '#e8a33d',
          500: '#d98c1f',
          600: '#b06f16',
        },
        steppe: {
          400: '#6fae8f',
          500: '#4f8d6f',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Iowan Old Style"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        read: ['"Charter"', '"Georgia"', 'serif'],
      },
      backgroundImage: {
        'ornament': "radial-gradient(circle at 20% 20%, rgba(232,163,61,0.08), transparent 40%), radial-gradient(circle at 80% 60%, rgba(79,141,111,0.08), transparent 45%)",
      },
    },
  },
  plugins: [],
};
