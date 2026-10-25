
export default function AdminDashboardPage() {
  return (
    <section>
      <div className="section-heading">
        <h2>Platform Administration</h2>
        <p>
          Review organizations, manage platform users, and maintain
          the quality of published challenges.
        </p>
      </div>

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <h3>Organizations</h3>
          <p>Review organization registration and verification requests.</p>
        </article>

        <article className="dashboard-card">
          <h3>Users</h3>
          <p>Manage accounts and respond to reported account issues.</p>
        </article>

        <article className="dashboard-card">
          <h3>Challenges</h3>
          <p>Review published challenges when moderation is needed.</p>
        </article>
      </div>
    </section>
  );
}
