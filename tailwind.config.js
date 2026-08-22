/*
 * AuraCal design tokens — dark mode first.
 * Keep hex values in sync with src/ui/theme.ts (single visual language).
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        base: '#0B0D10',
        surface: '#14171C',
        raised: '#1C2128',
        hairline: '#262C34',
        ink: {
          DEFAULT: '#ECEEF1',
          muted: '#9BA4AF',
          faint: '#626B76',
        },
        accent: {
          DEFAULT: '#5FB3A3',
          strong: '#7CCFC0',
          dim: '#3E7A70',
        },
      },
      borderRadius: {
        card: '16px',
        sheet: '24px',
      },
    },
  },
}
