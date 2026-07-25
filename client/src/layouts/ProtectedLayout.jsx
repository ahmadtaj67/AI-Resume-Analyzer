import { Outlet } from 'react-router-dom'

function ProtectedLayout() {
  return (
    <div className="app-shell">
      <Outlet />
    </div>
  )
}

export default ProtectedLayout
