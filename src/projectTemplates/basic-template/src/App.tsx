import { ThemeProvider } from 'styled-components'
import { AppRoutes } from './routes'
import { GlobalStyles } from './styles/GlobalStyles'
import { theme } from './styles/Theme'
import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
