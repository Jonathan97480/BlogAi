/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                'blue-neon': '#00e6ff',
                'violet-electric': '#a259ff',
            },
        },
    },
    darkMode: 'class',
}
