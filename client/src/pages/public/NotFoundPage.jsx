
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page-container section">
      <h1>404: Page Not Found</h1>

      <p>The page you are looking for does not exist.</p>

      <Link to="/">Return home</Link>
    </main>
  );
}
