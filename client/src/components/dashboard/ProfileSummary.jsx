function ProfileSummary({ accountStatus, profileRef, roleLabel, userEmail, userInitials, userName }) {
  return (
    <section
      className="dashboard-panel dashboard-profile-panel"
      id="profile-summary"
      ref={profileRef}
      tabIndex="-1"
      aria-labelledby="profile-summary-title"
    >
      <div className="dashboard-profile-topline">
        <span className="dashboard-avatar dashboard-avatar-large" aria-hidden="true">
          {userInitials}
        </span>
        <div>
          <p className="eyebrow">Profile</p>
          <h2 id="profile-summary-title">Account Summary</h2>
        </div>
      </div>

      <dl className="dashboard-profile-list">
        <div>
          <dt>Full name</dt>
          <dd>{userName}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd title={userEmail}>{userEmail}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{roleLabel}</dd>
        </div>
        <div>
          <dt>Account status</dt>
          <dd>{accountStatus || 'Not available'}</dd>
        </div>
      </dl>

      <span className="dashboard-muted-label">Editing coming soon</span>
    </section>
  )
}

export default ProfileSummary
