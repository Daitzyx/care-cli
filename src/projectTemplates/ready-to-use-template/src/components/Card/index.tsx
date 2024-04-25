import { ReactNode } from 'react'
import { Container } from './styles'

type Props = {
  children: ReactNode
  noPadding?: boolean
  style?: React.CSSProperties
  className?: string
}

export const Card = ({ children, noPadding, style, className }: Props) => {
  return (
    <Container className={className} style={style} noPadding={noPadding}>
      {children}
    </Container>
  )
}
