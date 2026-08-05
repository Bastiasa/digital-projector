import { Route, Routes } from "react-router-dom"

import ViewPage from "./pages/view/ViewPage"
import AdminPage from "./pages/admin/AdminPage"
import FolderPage from "./pages/admin/folder/FolderPage"
import SettingsPage from "./pages/admin/settings/SettingsPage"
import { AdminMount } from "./pages/admin/AdminMount"

function App() {
  return (
    <Routes>
      <Route path="/view" element={<ViewPage />}></Route>

      <Route path="/admin" element={<AdminMount/>}>
        <Route path="/admin" element={<AdminPage />}></Route>
        <Route path="/admin/folder/:id" element={<FolderPage />}></Route>
        <Route path="/admin/settings" element={<SettingsPage />}></Route>
      </Route>
    </Routes>
  )
}

export default App
