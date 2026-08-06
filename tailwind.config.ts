import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        card: "#171717",
        surface: "#202020",
        border: "#2A2A2A",
        accent: "#FFFFFF",
        muted: "#8E8E93",
        "muted-dark": "#3A3A3C",
        emerald: {
          500: "#10B981",
          400: "#34D399",
        },
        amber: {
          500: "#F59E0B",
        },
        rose: {
          500: "#F43F5E",
        }
      },
      fontFamily: {
        serif: ["Playfair Display", "Didot", "Cinzel", "Georgia", "serif"],
        sans: ["Inter", "Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "marquee": "marquee 25s linear infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(255, 255, 255, 0.1)" },
          "100%": { boxShadow: "0 0 35px rgba(255, 255, 255, 0.35)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "glow-radial": "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
        "hero-overlay": "radial-gradient(circle at 50% 30%, rgba(30, 40, 60, 0.35) 0%, rgba(13, 13, 13, 0.95) 75%)",
      }
    },
  },
  plugins: [],
};

export default config;
