/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}", "./public/**/*.html"],
  plugins: [
    require("@catppuccin/tailwindcss")({
      defaultFlavour: "latte",
    }),
  ],
  extend: {
    animation: {
      "shadow-pop-bl": "shadow-pop-bl 0.3s cubic-bezier(0.470, 0.000, 0.745, 0.715)   both",
    },
    keyframes: {
      "shadow-pop-bl": {
        "0%": {
          "box-shadow":
            "0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e, 0 0 #3e3e3e",
          transform: "translateX(0) translateY(0)",
        },
        to: {
          "box-shadow":
            "-1px 1px #3e3e3e, -2px 2px #3e3e3e, -3px 3px #3e3e3e, -4px 4px #3e3e3e, -5px 5px #3e3e3e, -6px 6px #3e3e3e, -7px 7px #3e3e3e, -8px 8px #3e3e3e",
          transform: "translateX(8px) translateY(-8px)",
        },
      },
    },
  },
  darkMode: "class",
}
