
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createTheme, MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App.tsx'

import './index.css'

import '@mantine/core/styles.css'

import { THEME_COLOR } from '@digital-projector/shared'

const queryClient = new QueryClient();
const appTheme = createTheme({
  colors: {
    'main': THEME_COLOR
  },
  primaryColor: "main",
  defaultRadius: "sm",
  fontFamily: "Inter, sans-serif"
})

createRoot(document.getElementById('root')!).render(
  <MantineProvider 
  theme={appTheme}
  forceColorScheme='dark'>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>

          <App />
      </QueryClientProvider >
    </BrowserRouter>
  </MantineProvider>
)
