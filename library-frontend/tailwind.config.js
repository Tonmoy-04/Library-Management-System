/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f67f8',
        secondary: '#eef4ff',
        accent: '#0ea886',
      },
    },
  },
  plugins: [],
}
