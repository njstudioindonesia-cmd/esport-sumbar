export const colors = {
  primary: {
    DEFAULT: '#E10600', // --red-500
    hover: '#B80500',   // --red-600
    bright: '#FF3B30',  // --red-400
    muted: '#4A0806',
  },
  marawa: {
    gold: '#F5B700',      // Emas Marawa Minangkabau (Champion & Glory)
    goldHover: '#D9A100',
    goldLight: '#FFC72C',
    goldMuted: 'rgba(245, 183, 0, 0.15)',
    red: '#E10600',       // Merah Marawa (Semangat Bertarung)
    black: '#08080A',     // Hitam Marawa (Dasar Keteguhan)
  },
  background: {
    base: '#08080A',    // --bg-900: Hitam Cyber Minang
    surface: '#121217', // --bg-800: Surface panel
    card: '#181822',    // --bg-700: Card container
    elevated: '#22222E', // --bg-600: Elevated component
  },
  border: {
    DEFAULT: '#2A2A38', // --line: border utama
    subtle: '#1C1C26',
    strong: '#3E3E50',
    gold: '#F5B700',
    primary: '#E10600',
  },
  text: {
    primary: '#F5F5F7',   // --text-100: kontras tinggi
    secondary: '#9A9AA5', // --text-400: teks sekunder
    muted: '#686878',
    inverse: '#08080A',
    gold: '#F5B700',
  },
  feedback: {
    success: '#10B981',
    warning: '#F5B700', // Marawa gold
    info: '#38BDF8',
    error: '#E10600',
  },
} as const;

