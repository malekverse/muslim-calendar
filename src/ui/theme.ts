export const colors = {
  base: '#0B0D10',
  surface: '#14171C',
  raised: '#1C2128',
  hairline: '#262C34',
  ink: '#ECEEF1',
  inkMuted: '#9BA4AF',
  inkFaint: '#626B76',
  accent: '#5FB3A3',
  onAccent: '#0B0D10',
  danger: '#C96A6A',
} as const

export const navColors = {
  background: colors.base,
  card: colors.surface,
  border: colors.hairline,
  text: colors.ink,
  primary: colors.accent,
}

export const radii = {
  card: 16,
  sheet: 24,
} as const
