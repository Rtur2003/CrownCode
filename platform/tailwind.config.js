/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#e7c77a',
        secondary: '#a4743a',
        accent: '#eac06f',
        background: '#0b0a08',
        surface: '#15110e',
        'surface-alt': '#1f1914',
        'text-primary': '#f4ede3',
        'text-secondary': '#c8b9a7',
        'text-muted': '#9a8d7d',
        border: '#2c231b',
        'border-light': '#3d2f23',
        success: '#7fb069',
        warning: '#c99347',
        error: '#a64b3c',
        info: '#6b8f7a',
      },
      fontFamily: {
        sans: ['IM Fell Double Pica', 'Times New Roman', 'serif'],
        heading: ['Portmanteau', 'IM Fell Double Pica', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 40px rgba(201, 147, 71, 0.25)',
        'glow-lg': '0 0 60px rgba(201, 147, 71, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'float': 'float 20s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(30px, -30px)' },
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #eac06f 0%, #c99347 50%, #8a5f2b 100%)',
        'gradient-ai': 'linear-gradient(135deg, #eac06f 0%, #c99347 50%, #8a5f2b 100%)',
        'gradient-data': 'linear-gradient(135deg, #c99347 0%, #9a6b2b 100%)',
        'gradient-ml': 'linear-gradient(135deg, #7fb069 0%, #6b8f7a 100%)',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents }) {
      const newComponents = {
        '.crowncode-container': {
          '@apply max-w-7xl mx-auto px-6': {},
        },
        '.project-gradient-ai': {
          background: 'linear-gradient(135deg, #eac06f 0%, #c99347 50%, #8a5f2b 100%)',
        },
        '.project-gradient-data': {
          background: 'linear-gradient(135deg, #c99347 0%, #9a6b2b 100%)',
        },
        '.project-gradient-ml': {
          background: 'linear-gradient(135deg, #7fb069 0%, #6b8f7a 100%)',
        },
        '.gradient-text': {
          background: 'linear-gradient(135deg, #eac06f 0%, #c99347 50%, #8a5f2b 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-dots': {
          'background-image': 'radial-gradient(circle, rgba(231,199,122,0.12) 1px, transparent 1px)',
          'background-size': '20px 20px',
        },
      }

      addComponents(newComponents)
    }
  ],
}
