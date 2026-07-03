import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f4",
          100: "#ffe0e7",
          200: "#ffc6d4",
          300: "#ff9db4",
          400: "#ff6690",
          500: "#fb3a6f",
          600: "#e81a5a",
          700: "#c30f49",
          800: "#a30f44",
          900: "#8b103f",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
