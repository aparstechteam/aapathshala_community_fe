import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/pages/**/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/features/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				siliguri: ['"Siliguri"', 'sans-serif'], // Add your custom font here
			},
			backgroundImage: {
				'gradientje': 'linear-gradient(102.52deg, #8A00CA -11.46%, #4394F0 46.49%, #F051FF 89.56%, #440064 145.16%)',
				'dashnje': 'linear-gradient(90deg, rgba(138, 0, 202, 0.07) 0%, rgba(67, 148, 240, 0.07) 37%, rgba(240, 81, 255, 0.07) 64.5%, rgba(68, 0, 100, 0.07) 100%)',
				'zemer': 'linear-gradient(90deg, rgba(138, 0, 202, 0.07) 0%, rgba(67, 148, 240, 0.07) 37%, rgba(240, 81, 255, 0.07) 64.5%, rgba(68, 0, 100, 0.07) 100%)'
			},
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				light: '#757575',
				deep: '#1C1C1C',
				ash: '#DFE2E6',
				dew: '#F5F6F7',
				burn: 'red',
				life: '#43a047',
				elegant: '#8A00CA',
				olive: '#008643',
				hot: '#F43F5E',
				cool: '#0ea5e9',
				carbon: '#1C1C1C',
				ice: '#0ea5e9',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				progress: {
					'0%': { width: '0%' },
					'100%': { width: '100%' },
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				spinSlow: 'spin 9s linear infinite',
				spinFast: 'spin 0.5s linear infinite',
				progress: 'progress 1.5s ease-in-out forwards',
			}
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	plugins: [require("tailwindcss-animate")],
};
export default config;
