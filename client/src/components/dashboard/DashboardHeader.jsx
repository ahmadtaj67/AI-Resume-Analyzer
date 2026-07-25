function DashboardHeader({ accountStatus, roleLabel, userEmail, userInitials, userName }) {
  return (
    <header className="dashboard-page-header">
      <div>
        <p className="eyebrow">User workspace</p>
        <h1>Dashboard</h1>
        <p>
          Track your resume-analysis activity and account details from one clean
          workspace.
        </p>
      </div>

      <article className="dashboard-header-profile" aria-label="Authenticated user">
        <span className="dashboard-avatar" aria-hidden="true">
          {userInitials}
        </span>
        <span className="dashboard-user-text">
          <strong>{userName}</strong>
          <small title={userEmail}>{userEmail || roleLabel}</small>
        </span>
        {accountStatus ? (
          <span className="dashboard-status-pill">{accountStatus}</span>
        ) : null}
      </article>
    </header>
  )
}

export default DashboardHeader
