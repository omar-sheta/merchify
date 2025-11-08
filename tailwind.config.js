module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep-black': 'var(--bg-deep-black)',
        'bg-card': 'var(--bg-card)',
        'bg-card-light': 'var(--bg-card-light)',
        'accent-orange': 'var(--accent-orange)',
        'accent-orange-light': 'var(--accent-orange-light)',
        'accent-yellow': 'var(--accent-yellow)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      }
    },
  },
  plugins: [],
}
