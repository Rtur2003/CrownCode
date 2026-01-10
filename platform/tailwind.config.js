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
        primary: '#00D4FF',
        secondary: '#0080FF',
        accent: '#D4AF37',
        background: '#000000',
        surface: '#0a192f',
        'surface-alt': '#1a2332',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-muted': '#666666',
        border: '#1a1a1a',
        'border-light': '#2a2a2a',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 40px rgba(0, 212, 255, 0.3)',
        'glow-lg': '0 0 60px rgba(0, 212, 255, 0.4)',
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
        'gradient-brand': 'linear-gradient(135deg, #00D4FF 0%, #0080FF 100%)',
        'gradient-ai': 'linear-gradient(135deg, #00D4FF 0%, #0080FF 100%)',
        'gradient-data': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-ml': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents }) {
      const newComponents = {
        '.devforge-container': {
          '@apply max-w-7xl mx-auto px-6': {},
        },
        '.project-gradient-ai': {
          background: 'linear-gradient(135deg, #00D4FF 0%, #0080FF 100%)',
        },
        '.project-gradient-data': {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        },
        '.project-gradient-ml': {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        },
        '.gradient-text': {
          background: 'linear-gradient(135deg, #00D4FF 0%, #0080FF 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-dots': {
          'background-image': 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          'background-size': '20px 20px',
        },
      }

      addComponents(newComponents)
    }
  ],
}