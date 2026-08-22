import { Pressable, Text, type PressableProps } from 'react-native'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const SHELL: Record<Variant, string> = {
  primary: 'bg-accent',
  secondary: 'border border-hairline bg-raised',
  ghost: 'bg-transparent',
  danger: 'bg-transparent border border-danger/40',
}

const LABEL: Record<Variant, string> = {
  primary: 'text-onAccent font-semibold',
  secondary: 'text-ink font-medium',
  ghost: 'text-accent font-medium',
  danger: 'text-danger font-medium',
}

interface ButtonProps extends PressableProps {
  label: string
  variant?: Variant
}

export function Button({ label, variant = 'primary', disabled, className = '', ...rest }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      className={`h-11 items-center justify-center rounded-card px-4 ${SHELL[variant]} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      {...rest}
    >
      <Text className={`text-base ${LABEL[variant]}`}>{label}</Text>
    </Pressable>
  )
}
