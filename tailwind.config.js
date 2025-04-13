/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00FFFF',
        'neon-magenta': '#FF00FF',
        'neon-lime': '#39FF14', // Lime green
        'manga-black': '#1a1a1a', // Deep black
        'manga-white': '#f0f0f0', // Bright white
      },
      fontFamily: {
        // Using Montserrat as a substitute for 'Anime Ace'
        sans: ['Montserrat', 'sans-serif'],
        manga: ['Montserrat', 'sans-serif'], // Specific alias for manga titles/bubbles
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00FFFF, 0 0 10px #00FFFF, 0 0 15px #00FFFF',
        'neon-magenta': '0 0 5px #FF00FF, 0 0 10px #FF00FF, 0 0 15px #FF00FF',
        'neon-lime': '0 0 5px #39FF14, 0 0 10px #39FF14, 0 0 15px #39FF14',
      },
      backgroundImage: {
        // Simple dot pattern for screentone effect
        'screentone-dots': 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        'speed-lines': 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 70%)',
        'cityscape': "url('https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", // Placeholder cityscape
      },
      backgroundSize: {
        'screentone-size': '10px 10px',
      },
      gridTemplateColumns: {
        'layout': '280px 1fr', // Sidebar and main content
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
        flash: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.5)' },
        }
      },
      animation: {
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        flash: 'flash 0.3s ease-in-out',
      }
    },
  },
  plugins: [],
}
