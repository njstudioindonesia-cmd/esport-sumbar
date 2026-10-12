export const geometry = {
  borderRadius: {
    none: '0px',
    sm: '4px',
    DEFAULT: '6px',
    md: '8px',
    chamfer: '12px',
  },
  clipPath: {
    // Chamfer diagonal cuts for gaming-pro look
    chamferCornerTopRight: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
    chamferCornerBottomRight: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
    chamferOppositeCorners: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
    ticketNotch: 'polygon(0 0, 100% 0, 100% calc(50% - 8px), calc(100% - 8px) 50%, 100% calc(50% + 8px), 100% 100%, 0 100%, 0 calc(50% + 8px), 8px 50%, 0 calc(50% - 8px))',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
