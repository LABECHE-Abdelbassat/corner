/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2.5rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1320px", // bigger than default
        "2xl": "1480px", // bigger than default (Tailwind default is 1536 but container is often smaller)
      },
    },
    extend: {},
  },
  plugins: [],
};
