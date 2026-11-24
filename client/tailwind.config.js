// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//   darkMode: 'class',
//   theme: {
//     extend: {
//       colors: {
//         // Custom dark, music-app palette — distinct from stock Spotify green
//         background: {
//           DEFAULT: '#0a0a0f',
//           secondary: '#12121a',
//           tertiary: '#1a1a24',
//         },
//         surface: {
//           DEFAULT: 'rgba(255, 255, 255, 0.05)',
//           hover: 'rgba(255, 255, 255, 0.08)',
//         },
//         accent: {
//           DEFAULT: '#8b5cf6', // violet
//           light: '#a78bfa',
//           dark: '#7c3aed',
//         },
//         accent2: {
//           DEFAULT: '#06b6d4', // cyan, used in gradients
//         },
//       },
//       backgroundImage: {
//         'gradient-brand': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
//         'gradient-dark': 'linear-gradient(180deg, #1a1a24 0%, #0a0a0f 100%)',
//       },
//       backdropBlur: {
//         xs: '2px',
//       },
//       boxShadow: {
//         glow: '0 0 30px rgba(139, 92, 246, 0.35)',
//         card: '0 8px 32px rgba(0, 0, 0, 0.4)',
//       },
//       animation: {
//         'spin-slow': 'spin 8s linear infinite',
//         'pulse-slow': 'pulse 3s ease-in-out infinite',
//         marquee: 'marquee 10s linear infinite',
//       },
//       keyframes: {
//         marquee: {
//           '0%': { transform: 'translateX(0%)' },
//           '100%': { transform: 'translateX(-100%)' },
//         },
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', 'sans-serif'],
//       },
//     },
//   },
//   plugins: [],
// };




/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0f0d13',
          secondary: '#121216',
          tertiary: '#1b1a21',
          glass: 'rgba(255,255,255,0.05)',
        },

        surface: {
          DEFAULT: 'rgba(255,255,255,.06)',
          hover: 'rgba(255,255,255,.09)',
          active: 'rgba(255,255,255,.12)',
        },

        primary: '#a238ff',
        secondary: '#ad47ff',

        // Deezer purple replaces Tailwind's violet everywhere the app already uses violet-*
        violet: {
          300: '#d4a6ff',
          400: '#bf75ff',
          500: '#a238ff',
          600: '#8a1fe6',
          700: '#7216c0',
        },
        fuchsia: {
          500: '#ad47ff',
          600: '#9a2ff0',
        },
        cyan: '#22D3EE',
        success: '#10B981',
        danger: '#EF4444',

        border: '#2d2d32',

        text: {
          primary: '#fdfcfe',
          secondary: '#a9a6aa',
          muted: '#6f6d71',
        },
      },

      backgroundImage: {
        hero:
          'linear-gradient(180deg,#1b1126 0%,#0f0d13 70%)',

        glass:
          'linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.03))',

        brand:
          'linear-gradient(135deg,#a238ff,#ad47ff)',

        // the names the components already use (bg-gradient-brand / bg-gradient-dark)
        'gradient-brand': 'linear-gradient(135deg,#a238ff,#c27bff)',
        'gradient-dark': 'linear-gradient(180deg,#17101f 0%,#0f0d13 420px)',
      },

      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
        xl4: '2rem',
      },

      backdropBlur: {
        xs: '2px',
        glass: '20px',
      },

      boxShadow: {
        glow: '0 0 40px rgba(162,56,255,.22)',
        glass: '0 2px 2px rgba(45,45,50,.08), 0 16px 40px rgba(0,0,0,.4)',
        card: '0 12px 35px rgba(0,0,0,.35)',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(.22,.61,.36,1)',
      },

      animation: {
        float: 'float 6s ease-in-out infinite',
        fade: 'fade .35s ease',
      },

      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },

        fade: {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
      },
    },
  },

  plugins: [],
};