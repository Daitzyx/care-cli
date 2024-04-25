import styled from 'styled-components'

type ContainerProps = {
  isPasswordWeak?: boolean
  isWrong?: boolean
}

export const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px auto;
  border: 1px solid #cdcdcd;
  border-radius: 15px;

  input {
    padding: 8px 12px;
    font-size: 16px;
  }
`

export const Label = styled.label`
  color: ${({ theme }) => theme.colors.blue900};
  font-family: ${({ theme }) => theme.fonts.principal};
`
