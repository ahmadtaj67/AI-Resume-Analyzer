function OverviewCard({ label, tone = 'blue', value, supportingText }) {
  return (
    <article className="dashboard-overview-card">
      <span className={`dashboard-card-symbol dashboard-card-symbol-${tone}`} aria-hidden="true" />
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{supportingText}</span>
      </div>
    </article>
  )
}

export default OverviewCard
