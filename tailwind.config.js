/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        cartoon: {
          light: '#ffffff',
          dark: '#1a1a2e',
          accent: '#f0f0f0',
          'dark-accent': '#252542',
        }
      },
      boxShadow: {
        'cartoon': '4px 4px 0px 0px rgba(0,0,0,1)',
        'cartoon-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
        'cartoon-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
        'cartoon-dark': '4px 4px 0px 0px rgba(255,255,255,0.3)',
        'cartoon-dark-sm': '2px 2px 0px 0px rgba(255,255,255,0.3)',
        'cartoon-dark-lg': '6px 6px 0px 0px rgba(255,255,255,0.3)',
      },
      borderRadius: {
        'cartoon': '16px',
        'cartoon-lg': '24px',
      },
      animation: {
        'bounce-soft': 'bounce-soft 0.5s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
