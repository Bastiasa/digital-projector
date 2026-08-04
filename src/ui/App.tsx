
import { Route, Routes } from 'react-router-dom'
import MainPage from './pages/main/MainPage'
import SettingsPage from './pages/settings/SettingsPage'
import { AppProvider } from './contexts/AppContext'
import OtherDevicePage from './pages/other_device/OtherDevicePage'

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path='/' element={<MainPage/>}/>
        <Route path='/settings' element={<SettingsPage/>}/>
        <Route path='/other_device' element={<OtherDevicePage/>}/>
      </Routes>
    </AppProvider>
  )
}

export default App
