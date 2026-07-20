import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section>
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you are looking for is not part of this phase.</p>
        <Link className="primary-link" to="/login">
          Return to login
        </Link>
      </section>
    </main>
  )
}

export default NotFoundPage
