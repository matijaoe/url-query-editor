const defaultTheme = require('tailwindcss/defaultTheme')

const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				mono: ['SF Mono', ...defaultTheme.fontFamily.mono],
				sans: ['Inter', ...defaultTheme.fontFamily.sans]
			}
		},
	},

	plugins: [],
};

module.exports = config;
