/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        "70/30": "70% 30%",
        "30/70": "30% 70%",
        "35/65": "35% 65%",
        "45/55": "45% 55%",
        "20/80": "20% 80%",
        "25/75": "25% 75%",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#4f46e5", // Indigo 600 - modern vibrant primary
          "primary-focus": "#4338ca",
          "primary-content": "#ffffff",
          "secondary": "#0ea5e9", // Sky 500
          "secondary-focus": "#0284c7",
          "secondary-content": "#ffffff",
          "accent": "#f43f5e", // Rose 500
          "accent-focus": "#e11d48",
          "accent-content": "#ffffff",
          "neutral": "#3d4451",
          "neutral-focus": "#2a2e37",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff", // Pure white for cards
          "base-200": "#f8fafc", // Slate 50 for background
          "base-300": "#f1f5f9",
          "base-content": "#1e293b",
          "info": "#3b82f6",
          "success": "#10b981", // Emerald 500
          "warning": "#f59e0b",
          "error": "#ef4444",
          "--rounded-btn": "0.5rem", // slightly rounded buttons
          "--rounded-box": "1rem", // rounded cards
          "--animation-btn": "0.25s", // slightly slower animation
          "--animation-input": "0.2s", // duration of animation for inputs like checkbox, toggle, radio, etc
          "--btn-focus-scale": "0.95", // button scale transform on focus
          "--border-btn": "1px", // border width of buttons
          "--tab-border": "1px", // border width of tabs
          "--tab-radius": "0.5rem", // border radius of tabs
        },
      },
    ],
  },
};
