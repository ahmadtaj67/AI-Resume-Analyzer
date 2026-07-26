import { AuthProvider } from './context/AuthContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import AppRouter from './routes/AppRouter.jsx'

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </SettingsProvider>
  )
}

export default App
