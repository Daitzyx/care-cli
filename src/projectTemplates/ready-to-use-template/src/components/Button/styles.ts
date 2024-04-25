/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from 'styled-components'
import { theme } from '../../styles/Theme'

type ButtonsProps = {
  color: string
  width?: string
  height?: string
  isActive?: boolean
  disabled?: boolean
}

const getColor = (colorType: string) => {
  const objColors = {
    white: {
      color: theme.colors.blue700,
      backgroundColor: theme.colors.white200,
      border: `2px solid ${theme.colors.blue700}`,
      hoverColor: theme.colors.white250
    },
    blue: {
      color: theme.colors.white200,
      backgroundColor: theme.colors.blue700,
      hoverColor: theme.colors.blue800
    }
  }

  return objColors[colorType as keyof typeof objColors]
}

export const ButtonContainer = styled.button<ButtonsProps>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};

  ${(props) => getColor(props.color)};

  display: flex;
  padding: 0.5rem 2rem;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing.xl};
  border-radius: 0.75rem;

  font-size: ${theme.fontSize.md};
  white-space: nowrap;
  font-weight: ${theme.fontWeight.semiBold};
  line-height: 150%;

  font-family: ${theme.fonts.principal};

  transition: background-color 0.5s ease;

  &:hover {
    background-color: ${({ color }) => getColor(color).hoverColor};
  }
`
