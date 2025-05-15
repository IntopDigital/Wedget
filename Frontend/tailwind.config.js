// tailwind.config.js
export default {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          'primary-gradient-start': '#6A11CB', // Purple
          'primary-gradient-end': '#2575FC',   // Blue
          'button-yellow': '#FFC107',
          'accent-orange': '#F97316',
          'accent-cyan': '#06B6D4',
          'text-black': '#000000',
          'text-white': '#FFFFFF',
        },
        backgroundImage: {
          'primary-gradient': 'linear-gradient(to right, #6A11CB, #2575FC)',
        },
      },
    },
    plugins: [],
  };
  