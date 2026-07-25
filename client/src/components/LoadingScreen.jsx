function LoadingScreen() {
  return (
    <main className="loading-screen">
      <section role="status" aria-live="polite">
        <div className="brand-mark" aria-hidden="true">
          AI
        </div>
        <p className="eyebrow">Restoring session</p>
        <h1>Preparing your workspace</h1>
      </section>
    </main>
  )
}

export default LoadingScreen
