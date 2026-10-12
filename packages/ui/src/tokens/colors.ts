export const colors = {
  primary: {
    DEFAULT: '#E10600', // --red-500
    hover: '#B80500',   // --red-600
    bright: '#FF3B30',  // --red-400
    muted: '#4A0806',
  },
  background: {
    base: '#0B0B0D',    // --bg-900: background utama
    surface: '#131316', // --bg-800: surface
    card: '#1C1C21',    // --bg-700: card
    elevated: '#25252C',
  },
  border: {
    DEFAULT: '#2A2A31', // --line
    subtle: '#1F1F24',
    strong: '#3F3F4A',
    primary: '#E10600',
  },
  text: {
    primary: '#F5F5F7',   // --text-100
    secondary: '#9A9AA5', // --text-400
    muted: '#636370',
    inverse: '#0B0B0D',
  },
  feedback: {
    success: '#22C55E',
    warning: '#F5A524',
    info: '#3B82F6',
    error: '#E10600',
  },
} as const;
