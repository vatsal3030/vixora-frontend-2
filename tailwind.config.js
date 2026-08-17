/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Existing semantic colors kept as fallbacks or utilities if needed
        success: '#22c55e',
        warning: '#eab308',
        info: '#3b82f6',
        danger: '#f87171',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      /* --- TYPOGRAPHY SCALE (Phase 1) ---
         Canonical sizes. Use these instead of arbitrary text-[Npx] values.
         Page titles: text-title (mobile) / text-title-lg (desktop via sm: prefix)
         Section headings: text-lg
         Body / labels / nav: text-sm (14px) or text-base (16px)
         Metadata / fine print: text-xs (12px)
      */
      fontSize: {
        'xs':       ['var(--text-xs)',       { lineHeight: '1rem' }],        /* 12px */
        'sm':       ['var(--text-sm)',       { lineHeight: '1.25rem' }],     /* 14px */
        'base':     ['var(--text-base)',     { lineHeight: '1.5rem' }],      /* 16px */
        'lg':       ['var(--text-lg)',       { lineHeight: '1.75rem' }],     /* 20px */
        'title':    ['var(--text-title)',    { lineHeight: '2rem' }],        /* 24px */
        'title-lg': ['var(--text-title-lg)', { lineHeight: '2.25rem' }],    /* 30px */
      },
      spacing: {
        '0.5': '0.125rem',
        '1': '0.25rem',
        '1.5': '0.375rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
      },
      /* --- BORDER RADIUS SCALE (Phase 1) ---
         Pick from these 4 + full. No other values.
         sm  (6px):  badges, tags, small controls
         md  (8px):  buttons, inputs, dropdowns
         lg (12px):  cards, panels, containers (= --radius)
         xl (16px):  modals, large sections
         full:       pills, avatars
      */
      borderRadius: {
        'none': '0',
        'sm': 'var(--radius-sm)',     /* 6px */
        'md': 'var(--radius-md)',     /* 8px */
        'lg': 'var(--radius-lg)',     /* 12px — default --radius */
        'xl': 'var(--radius-xl)',     /* 16px */
        'full': '9999px',
      },
      backdropBlur: {
        'glass': '12px',
        'glass-heavy': '20px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
        'glow': '0 0 20px var(--brand-red-glow, rgba(239, 68, 68, 0.4))',
        'glow-white': '0 0 20px var(--accent-glow, rgba(255, 255, 255, 0.15))',
        'glass': 'var(--glass-shadow)',
        'glass-hover': 'var(--glass-shadow-hover)',
        'glass-glow': 'var(--glass-glow)',
        'glass-glow-strong': 'var(--glass-glow-strong)',
        'primary-glow': '0 0 8px var(--primary-glow)',
      },
      /* --- MOTION TOKENS (Phase 1) ---
         Durations: fast (150ms), base (200ms), slow (300ms)
         Easing: ease-out (snappy decel), ease-in-out (smooth)
         Usage:
           transition-all duration-fast ease-out   → hover states
           transition-all duration-base ease-in-out → card/panel state changes
           transition-all duration-slow ease-out    → page/modal open-close
      */
      transitionDuration: {
        'fast': 'var(--duration-fast)',   /* 150ms */
        'base': 'var(--duration-base)',   /* 200ms */
        'slow': 'var(--duration-slow)',   /* 300ms */
      },
      transitionTimingFunction: {
        'ease-out': 'var(--ease-out)',        /* cubic-bezier(0.16, 1, 0.3, 1) */
        'ease-in-out': 'var(--ease-in-out)',  /* cubic-bezier(0.4, 0, 0.2, 1) */
      },

      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 255, 255, 0.05)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 255, 255, 0.15)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glassFadeIn: {
          '0%': { opacity: '0', backdropFilter: 'blur(0px)' },
          '100%': { opacity: '1', backdropFilter: 'blur(var(--glass-blur))' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float-up': 'floatUp 0.5s ease-out',
        'glass-fade-in': 'glassFadeIn 0.4s ease-out',
        'blob': 'blob 7s infinite',
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal': '1050',
      },
    },
  },
  plugins: [],
}

