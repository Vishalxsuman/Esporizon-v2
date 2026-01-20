/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'charcoal': '#121212',
        'electric-purple': '#8B5CF6',
        'neon-green': '#10B981',
        'dark-bg': '#0A0A0A',
        'card-bg': '#1A1A1A',
        // Esports Dashboard Theme
        'bg-primary': '#0b0202',
        'bg-secondary': '#1a0404',
        'accent-red': '#c72c2c',
        'accent-red-dark': '#7a0f0f',
        'accent-orange': '#ff6a00',
        'text-secondary': '#b8a1a1',
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #8B5CF6 0%, #10B981 100%)',
        'gradient-dark': 'linear-gradient(180deg, #121212 0%, #0A0A0A 100%)',
        'gradient-hero': 'radial-gradient(ellipse at center, #7a0f0f 0%, #1a0404 70%, #0b0202 100%)',
        'gradient-liquid': 'linear-gradient(135deg, rgba(199, 44, 44, 0.3) 0%, rgba(255, 106, 0, 0.2) 100%)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slideUp': 'slideUp 0.3s ease-out',
        'fadeIn': 'fadeIn 0.2s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #8B5CF6, 0 0 10px #8B5CF6' },
          '100%': { boxShadow: '0 0 10px #8B5CF6, 0 0 20px #8B5CF6, 0 0 30px #8B5CF6' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(199, 44, 44, 0.4), 0 0 40px rgba(255, 106, 0, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(199, 44, 44, 0.6), 0 0 60px rgba(255, 106, 0, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
