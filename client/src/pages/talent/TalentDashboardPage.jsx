
export default function TalentDashboardPage() {
  return (
    <section>
      <div className="section-heading">
        <h2>Welcome to your workspace</h2>
        <p>
          Manage your talent profile, discover challenges, and track
          your applications in one place.
        </p>
      </div>

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <h3>My Profile</h3>
          <p>Showcase your skills, experience, and portfolio.</p>
        </article>

        <article className="dashboard-card">
          <h3>Explore Challenges</h3>
          <p>Find real-world problems you can help solve.</p>
        </article>

        <article className="dashboard-card">
          <h3>My Applications</h3>
          <p>Track the status of your challenge applications.</p>
        </article>
      </div>
    </section>
  );
}
