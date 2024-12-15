/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: { 
        text: "var(--text)", 
        background: "var(--background)", 
        primary: "var(--primary)", 
        secondary: "var(--secondary)", 
        accent: "var(--accent)",
      }, 
      strokeWidth: {
        4: '4',
        6: '6',
        8: '8',
      },
      animation: {
        spinSlow: 'spin 8s cubic-bezier(0.42, 0, 0.58, 1) infinite', // Slower spin (5 seconds per rotation)
        pingSlow: 'ping 1.3s ease infinite',
      }
    },
  },
  plugins: [],
}

