/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,tsx,ts,jsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* ========== CORE COLORS ========== */
        // Light Mode Colors
        light: {
          background: "oklch(1 0 0)",               // Pure white
          foreground: "oklch(0.145 0 0)",          // Dark gray (almost black)
          card: "oklch(1 0 0)",                   // White cards
          cardText: "oklch(0.145 0 0)",           // Dark text on cards
          primary: "oklch(0.205 0 0)",            // Dark gray primary
          primaryText: "oklch(0.985 0 0)",        // White text on primary
          border: "oklch(0.922 0 0)",             // Light gray borders
          input: "oklch(0.922 0 0)",              // Input fields
        },
        
        // Dark Mode Colors
        dark: {
          background: "oklch(0.145 0 0)",         // Dark background
          foreground: "oklch(0.985 0 0)",         // White text
          card: "oklch(0.205 0 0)",              // Dark cards
          cardText: "oklch(0.985 0 0)",           // White text on cards
          primary: "oklch(0.628 0.258 29.234)",   // Orange primary
          primaryText: "oklch(1 0 0)",            // White text on primary
          border: "oklch(0.275 0 0)",             // Dark borders
          input: "oklch(0.325 0 0)",              // Dark input fields
        },

        /* ========== FUNCTIONAL COLORS ========== */
        danger: {
          DEFAULT: "oklch(0.577 0.245 27.325)",  // Red danger (light mode)
          dark: "oklch(0.704 0.191 22.216)",     // Dark red danger
          text: "oklch(1 0 0)",                  // White text on danger
        },
        
        success: "oklch(0.518 0.239 142.495)",   // Green success
        warning: "oklch(0.847 0.199 79.751)",    // Yellow warning
        
        /* ========== CHART COLORS ========== */
        chart: {
          blue: "oklch(0.81 0.1 252)",           // Primary chart blue
          indigo: "oklch(0.62 0.19 260)",        // Secondary indigo
          violet: "oklch(0.55 0.22 263)",        // Tertiary violet
          purple: "oklch(0.49 0.22 264)",        // Quaternary purple
          lavender: "oklch(0.42 0.18 266)",      // Quinary lavender
        },
        
        /* ========== SIDEBAR COLORS ========== */
        sidebar: {
          light: {
            bg: "oklch(0.985 0 0)",              // Light sidebar
            text: "oklch(0.145 0 0)",            // Dark text
            primary: "oklch(0.205 0 0)",         // Sidebar primary
            border: "oklch(0.922 0 0)",          // Sidebar border
          },
          dark: {
            bg: "oklch(0.205 0 0)",              // Dark sidebar
            text: "oklch(0.985 0 0)",            // White text
            primary: "oklch(0.488 0.243 264.376)", // Purple primary
            border: "oklch(0.275 0 0)",          // Dark border
          }
        }
      },
      
      /* ========== TYPOGRAPHY ========== */
      fontFamily: {
        sans: [
          'ui-sans-serif', 
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif'
        ],
        serif: [
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif'
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace'
        ]
      },
      
      /* ========== BORDER RADIUS ========== */
      borderRadius: {
        none: '0',
        xs: '0.125rem',
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.625rem',  // Your --radius value
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      
      /* ========== SHADOWS ========== */
      boxShadow: {
        '2xs': '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
        xs: '0 1px 3px 0px hsl(0 0% 0% / 0.05)',
        sm: '0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1)',
        DEFAULT: '0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 1px 2px -1px hsl(0 0% 0% / 0.1)',
        md: '0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.1)',
        lg: '0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 4px 6px -1px hsl(0 0% 0% / 0.1)',
        xl: '0 1px 3px 0px hsl(0 0% 0% / 0.1), 0 8px 10px -1px hsl(0 0% 0% / 0.1)',
        '2xl': '0 1px 3px 0px hsl(0 0% 0% / 0.25)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};