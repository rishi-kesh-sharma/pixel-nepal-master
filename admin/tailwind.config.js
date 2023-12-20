const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0e0e23",
        secondary: "#6259ca",
        dark: "#170c6b",
      },
      fontSize: {
        s: "12px",
      },
      screens: {
        xl: { max: "1600px" },
        lg: { max: "1400px" },
        tab: { max: "768px" },
        mobile: { max: "512px" },
      },
      boxShadow: {
        shadow1: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
      },
    },
  },
  plugins: [],
});
