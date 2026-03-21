/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Restoring white to be white, using dark-surface for the background
                white: '#FFFFFF',
                'dark-surface': '#09090B',
                // Overriding gray scale completely for dark mode (Dark mode first approach)
                gray: {
                    50: '#18181B',   // Dark gray
                    100: '#27272A',  // Lighter dark
                    200: '#3F3F46',
                    300: '#52525B', 
                    400: '#71717A',  // Secondary text
                    500: '#A1A1AA',  // Visible text
                    600: '#D4D4D8',  // Light text
                    700: '#E4E4E7',  // Very light text
                    800: '#F4F4F5',  // Highlights
                    900: '#FAFAFA',  // Near white
                },
                indigo: {
                    50: '#131316',
                    100: '#18181B',
                    200: '#27272A',
                    300: '#3F3F46',
                    400: '#52525B',
                    500: '#71717A',
                    600: '#A1A1AA',
                    700: '#10B981',
                    800: '#059669',
                    900: '#131316', 
                },
                primary: '#10B981', 
                secondary: '#3B82F6', 
                dark: '#09090B', 
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            boxShadow: {
                DEFAULT: '0 0 0 1px rgba(255,255,255,0.05)',
                sm: '0 0 0 1px rgba(255,255,255,0.05)',
                md: '0 0 0 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.5)',
                lg: '0 0 0 1px rgba(255,255,255,0.05), 0 10px 15px -3px rgba(0,0,0,0.5)',
                xl: '0 0 0 1px rgba(255,255,255,0.05), 0 20px 25px -5px rgba(0,0,0,0.5)',
                '2xl': '0 0 0 1px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.5)',
                inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            }
        },
    },
    plugins: [],
}
