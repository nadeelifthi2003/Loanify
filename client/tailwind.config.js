/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0D47A1', // Primary Blue
                    light: '#1e5bb6',
                    dark: '#083378',
                },
                teal: {
                    DEFAULT: '#00B9A7',
                    light: '#2cdccb',
                    dark: '#008a7c',
                },
                aqua: {
                    DEFAULT: '#3ED6C4',
                },
                dark: {
                    bg: '#0F172A',
                    surface: '#1E293B',
                    text: {
                        primary: '#F1F5F9',
                        secondary: '#CBD5E1',
                        muted: '#64748B',
                    },
                    border: '#334155',
                },
                light: {
                    bg: '#FFFFFF',
                    surface: '#F8FAFC',
                    text: {
                        primary: '#1E293B',
                        secondary: '#475569',
                        muted: '#94A3B8',
                    },
                    border: '#E2E8F0',
                },
                status: {
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #0D47A1 0%, #00B9A7 100%)',
                'gradient-accent': 'linear-gradient(135deg, #00B9A7 0%, #3ED6C4 100%)',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                }
            },
            animation: {
                float: 'float 3s ease-in-out infinite',
                'fade-up': 'fade-up 0.5s ease-out forwards',
                blob: 'blob 7s infinite',
            }
        },
    },
    plugins: [
        require('tailwindcss-animate'),
    ],
}
