import { createRoot } from 'react-dom/client'

import {HashRouter} from 'react-router-dom'
import App from './App.tsx'

import './index.css'
import '@mantine/core/styles.css'
import { createTheme, MantineProvider } from '@mantine/core'

import {THEME_COLOR} from '@digital-projector/shared';

const appTheme = createTheme({
  colors: {
    'main': THEME_COLOR
  },

  primaryColor: 'main',
  fontFamily: 'Inter, sans-serif',
  defaultRadius: 'sm'
});

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <MantineProvider forceColorScheme='dark' theme={appTheme}>
      <App />
    </MantineProvider>
  </HashRouter>,
)
