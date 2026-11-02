import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 포인트 색: 로즈 한 가지. 500은 흰 글자와 대비 5.5:1
        brand: {
          50: "#fcf1f2",
          100: "#f9e0e4",
          200: "#f2c2ca",
          300: "#e898a5",
          400: "#de6c80",
          500: "#d6455d",
          600: "#bd3450",
          700: "#9c2a42",
          800: "#7f2438",
          900: "#6a2032",
        },
        // 따뜻한 종이색 무채색 계열 (배경·테두리·글자 모두 여기서)
        ink: {
          50: "#fbf9f6",
          100: "#f2ede6",
          200: "#e6dfd5",
          300: "#cfc6b9",
          400: "#a1978a",
          500: "#7b7266",
          600: "#5e554a",
          700: "#463f36",
          800: "#2e2923",
          900: "#1f1b16",
        },
        paper: "#f8f5f0",
        // 내 말풍선 색과 카톡의 안 읽음 숫자 "1"
        butter: "#fbe38e",
        unread: "#c99700",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(31, 27, 22, 0.05)",
        float: "0 8px 24px rgba(31, 27, 22, 0.06)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 400ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
