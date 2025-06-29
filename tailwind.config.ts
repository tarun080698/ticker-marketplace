import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Quicksand", "Poppins"],
        body: ["Inconsolata", "Roboto"],
      },
      keyframes: {
        pulseColorCycle: {
          "0%, 30%": {
            backgroundColor: "#FF5758" /* Pink */,
            opacity: "1",
            transform: "scale(1.2)",
          },
          "35%, 65%": {
            backgroundColor: "#FFDE59" /* Yellow */,
            opacity: "1",
            transform: "scale(1.2)",
          },
          "70%, 99%": {
            backgroundColor: "#5CE0E6" /* Blue */,
            opacity: "1",
            transform: "scale(1.2)",
          },
          "0%, 33%, 66%, 100%": {
            transform: "scale(0.7)" /* Reset scale */,
            opacity: "0.3",
          },
        },

        "border-pulse": {
          "0%, 100%": { borderColor: "rgba(255, 0, 0, 0.1)" },
          "50%": { borderColor: "rgba(255, 0, 0, 1)" },
        },
      },
      animation: {
        pulseCycle: "pulseColorCycle 3s infinite",
        "border-pulse": "border-pulse 2s ease-in-out infinite",
      },

      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        yellow: {
          100: "#FFF7CC", // lightest
          200: "#FFF199",
          300: "#FFDE59", // main color
          400: "#E6C650",
          500: "#BFA439", // darkest
        },
        pink: {
          100: "#FFB3B3", // lightest
          200: "#FF8989",
          300: "#FF5758", // main color
          400: "#E64D4E",
          500: "#B73C3D", // darkest
        },
        blue: {
          100: "#D9F8FA", // lightest
          200: "#A8EDF0",
          300: "#5CE0E6", // main color
          400: "#4BC1C7",
          500: "#3A9DA2", // darkest
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
