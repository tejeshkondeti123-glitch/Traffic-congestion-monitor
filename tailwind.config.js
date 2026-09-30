/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#4cd7f6",
        "primary-container": "#06b6d4",
        "on-primary": "#003640",
        "primary-fixed": "#acedff",
        "primary-fixed-dim": "#4cd7f6",
        
        "secondary": "#4edea3",
        "secondary-container": "#00a572",
        "on-secondary": "#003824",
        "secondary-fixed": "#6ffbbe",
        "secondary-fixed-dim": "#4edea3",
        
        "tertiary": "#ddb7ff",
        "tertiary-container": "#c78dff",
        "on-tertiary": "#490080",
        
        "background": "#0d1322",
        "surface": "#0d1322",
        "surface-dim": "#0d1322",
        "surface-bright": "#33394a",
        "surface-container-lowest": "#080e1d",
        "surface-container-low": "#151b2b",
        "surface-container": "#191f2f",
        "surface-container-high": "#242a3a",
        "surface-container-highest": "#2f3445",
        
        "on-surface": "#dde2f8",
        "on-surface-variant": "#bcc9cd",
        "on-background": "#dde2f8",
        
        "outline": "#869397",
        "outline-variant": "#3d494c",
        
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6"
      },
      fontFamily: {
        display: ['Geist', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'stack-gap': '4px',
        'panel-padding': '12px',
        'margin-edge': '16px',
        'gutter': '8px',
        'unit': '4px',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 4s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(76, 215, 246, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(76, 215, 246, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
