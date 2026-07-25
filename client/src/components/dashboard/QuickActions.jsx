function QuickActions({ onReviewProfile }) {
  const actions = [
    {
      title: 'Analyze Resume',
      description: 'Start an AI-assisted resume review when uploads are available.',
      status: 'Coming soon',
      disabled: true,
    },
    {
      title: 'View Reports',
      description: 'Review completed analysis reports in a future phase.',
      status: 'Coming soon',
      disabled: true,
    },
    {
      title: 'Review Profile',
      description: 'Jump to the profile summary on this dashboard.',
      status: 'Available',
      onClick: onReviewProfile,
    },
    {
      title: 'Account Security',
      description: 'Password and security settings will be introduced later.',
      status: 'Coming soon',
      disabled: true,
    },
  ]

  return (
    <section className="dashboard-quick-actions" aria-labelledby="quick-actions-title">
      <div className="dashboard-section-heading">
        <p className="eyebrow">Shortcuts</p>
        <h2 id="quick-actions-title">Quick Actions</h2>
      </div>

      <div className="dashboard-action-grid">
        {actions.map((action) => (
          <article className="dashboard-action-card" key={action.title}>
            <div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
            <button
              className="dashboard-secondary-action"
              disabled={action.disabled}
              onClick={action.onClick}
              type="button"
            >
              {action.status}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default QuickActions
