import { Container } from './styles'

import carLogo from '../../assets/img/logo-care.png'

interface HelloProps {
  title?: string
}

export const Hello = ({ title }: HelloProps) => {
  return (
    <Container>
      <img src={carLogo} alt="Logo da empresa escrito Care Intelligence" />
      <p>{title}</p>
    </Container>
  )
}
