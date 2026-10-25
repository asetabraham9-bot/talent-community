
export default function OrganizationDashboardPage() {
  return (
    <section>
      <div className="section-heading">
        <h2>Organization Workspace</h2>
        <p>
          Publish real-world challenges, review talent applications,
          and manage projects with selected candidates.
        </p>
      </div>

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <h3>My Challenges</h3>
          <p>Create and manage challenges your organization publishes.</p>
        </article>

        <article className="dashboard-card">
          <h3>Applications</h3>
          <p>Review candidates who apply to your challenges.</p>
        </article>

        <article className="dashboard-card">
          <h3>Projects</h3>
          <p>Track accepted candidates and project outcomes.</p>
        </article>
      </div>
    </section>
  );
}
