import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <main className="auth-shell">
      <section className="auth-brand" aria-labelledby="auth-brand-title">
        <div className="brand-mark" aria-hidden="true">
          AI
        </div>
        <p className="eyebrow">Recruiter intelligence platform</p>
        <h1 id="auth-brand-title">AI Resume Analyzer</h1>
        <p>
          Build a sharper hiring workflow with structured resume reviews,
          role-fit signals, and analysis tools planned for upcoming phases.
        </p>
      </section>

      <section className="auth-card" aria-label="Authentication form">
        <Outlet />
      </section>
    </main>
  )
}

export default AuthLayout
