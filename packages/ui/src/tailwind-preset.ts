import { colors } from './tokens/colors';
import { typography } from './tokens/typography';
import { geometry } from './tokens/spacing';

export const esportSumbarPreset = {
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        surface: colors.background,
        border: colors.border,
        text: colors.text,
        feedback: colors.feedback,
        brand: {
          500: '#E10600',
          600: '#B80500',
          400: '#FF3B30',
        },
      },
      fontFamily: typography.fontFamily,
      borderRadius: geometry.borderRadius,
      transitionDuration: {
        150: '150ms',
        200: '200ms',
        250: '250ms',
      },
    },
  },
};
