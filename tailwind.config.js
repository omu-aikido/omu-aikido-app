/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}",
        "./public/**/*.html",
    ],
    plugins: [
        require("@catppuccin/tailwindcss")({
            defaultFlavour: "latte",
        }),
    ],
    darkMode: "class",
};
