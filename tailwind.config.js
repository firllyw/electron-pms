/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#1e88e5',
            light: '#6ab7ff',
            dark: '#005cb2',
          },
          secondary: {
            DEFAULT: '#0d47a1',
            light: '#5472d3',
            dark: '#002171',
          },
        },
      },
    },
    plugins: [],
  }