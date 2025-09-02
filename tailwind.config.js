const colors = require("tailwindcss/colors");

module.exports = {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{vue,js,ts}"],
    theme: {
        extend: {
            colors: {
                neutral: colors.neutral, // 👈 بازگردوندن رنگ neutral
            },
        },
    },
    plugins: [require("daisyui")],
};
