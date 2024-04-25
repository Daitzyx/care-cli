import { InputHTMLAttributes } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

import { Container } from './styles'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  isPasswordWeak?: boolean
  isWrong?: boolean
  maxLength?: number
  isLoading?: boolean
  inputRef?: any
}

export const Input = ({ label, isPasswordWeak, isWrong, maxLength, inputRef, isLoading, ...rest }: InputProps) => {
  return (
    <Container isPasswordWeak={isPasswordWeak} isWrong={isWrong}>
      {isLoading && <AiOutlineLoading3Quarters color="#D4D4D4" />}
      <input maxLength={maxLength} ref={inputRef} {...rest} />
    </Container>
  )
}
