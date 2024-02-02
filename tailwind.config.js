/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      green: "#00B56C",
      gray: "#808080",
      red: "#FF0000",
      yellow: "#eec40f",
      grayLight: "#D3D3D3",
      bgLight: "rgb(248,255,253)",
      bgHoverTabel: "#e1f5ef",
      labelColor: "#000000D9",
      zonebtnColor: "#F5F5F5",
      zoneTabelBg: "#FAFAFA",
      black: "#000000",
      liveTrackingGrayColor: "#A9A9A9",
      tripBg: "#f3fcf2",
      bgPlatBtn: "#29303b",
    },
    fontFamily: {
      popins: ["Popins", "sans-serif"],
    },
  },
  plugins: [],
};
