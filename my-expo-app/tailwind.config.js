/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./screens/**/*.js", "./components/**/*.js"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};