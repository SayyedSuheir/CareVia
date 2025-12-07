/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-teal': '#2BB0A8',
        'action-blue': '#208a82',
        'soft-gray': '#f5f5f5',
        'text-primary': '#1a1a1a',
        'text-secondary': '#666666',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Keeps Bootstrap styles
  },
};
