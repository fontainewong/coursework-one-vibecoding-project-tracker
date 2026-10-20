/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Tweak in M6 (tag-style) and M8 (due-tint)
        feature: '#28C840', // green
        bug: '#FF5F57',     // red
        'brand-primary': '#1D1D1F',
        'brand-accent': '#F5772D',
        'surface-page': '#F5F5F7',
        'surface-card': '#FFFFFF',
        'text-primary': '#1D1D1F',
        'text-muted': '#6E6E73',
        'type-feature': '#28C840',
        'type-bug': '#FF5F57',
        'due-safe': '#28C840',
        'due-warning': '#FEBC2E',
        'due-overdue': '#FF5F57',
        'due-neutral': '#E5E5EA',
      },
    },
  },
  plugins: [],
};
