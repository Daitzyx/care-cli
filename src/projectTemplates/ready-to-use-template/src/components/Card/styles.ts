import styled from 'styled-components'

type CardProps = {
  noPadding?: boolean
}

export const Container = styled.div<CardProps>`
  padding: ${({ noPadding }) => (noPadding ? '0' : '30px')};
  border-radius: 10px;
  width: 100%;

  background: ${({ theme }) => theme.colors.white};
  box-shadow: 0 3px 8px ${({ theme }) => theme.colors.gray300};

  span {
    font-size: 18px;
  }
`
