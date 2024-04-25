import { ButtonHTMLAttributes, ReactNode } from 'react'

import { ButtonContainer } from './styles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  color?: 'blue' | 'white'
  width?: string
  height?: string
  isActive?: boolean
  onClick?: () => void
  disabled?: boolean
}

export const Button = ({
  children,
  color = 'white',
  width,
  height = '3.5rem',
  onClick,
  isActive,
  disabled
}: ButtonProps) => {
  return (
    <ButtonContainer
      type="submit"
      color={color}
      width={width}
      height={height}
      onClick={onClick}
      isActive={isActive}
      disabled={disabled}
    >
      {children}
    </ButtonContainer>
  )
}
