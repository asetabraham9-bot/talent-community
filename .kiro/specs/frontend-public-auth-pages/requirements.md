# Requirements Document

## Introduction

This feature delivers a complete, elegant, motion-based frontend for the Talent Community platform using React 19, Vite, Tailwind CSS v4, React Router v7, Framer Motion, and Lucide React icons. The build covers the first pass: seven public pages (HomePage, ChallengesPage, ChallengeDetailPage, TalentsPage, AboutPage, ContactPage, FAQsPage), two authentication pages (RegisterPage with role selection, LoginPage with role-based redirect), and the supporting infrastructure — Framer Motion installation, AppRouter update with all routes and ProtectedRoute wrappers, auth-aware PublicHeader, and an enriched DashboardSidebar with user info and logout. The color system uses primary dark navy `#102c46`, teal accent `#0d9488`, and slate/white surfaces. All animations respect `prefers-reduced-motion`. The backend is Express + MongoDB at `http://localhost:5000/api` with JWT stored in `sessionStorage` via `AuthContext`.

## Glossary

- **Application**: The React SPA client running in the browser.
- **AppRouter**: The top-level React Router v7 component that declares all route definitions.
- **AuthContext**: The React context that exposes `user`, `token`, `login`, `logout`, and `isAuthenticated`.
- **ChallengeDetailPage**: The public page that fetches and displays a single challenge by its MongoDB `_id` from the URL parameter `:id`.
- **DashboardLayout**: The shared authenticated layout wrapping the sidebar and an `<Outlet>` for dashboard sub-pages.
- **DashboardSidebar**: The persistent left-side navigation component used inside `DashboardLayout`.
- **FramerMotion**: The `framer-motion` npm package used for declarative, spring-based animations.
- **LoginPage**: The page at `/login` that authenticates a user and redirects based on role.
- **ProtectedRoute**: The route guard component that redirects unauthenticated or unauthorised users.
- **PublicFooter**: The shared footer rendered on all public pages.
- **PublicHeader**: The shared sticky header rendered on all public pages.
- **RegisterPage**: The page at `/register` that creates new talent or organisation accounts.
- **Role**: One of three string values — `talent`, `organization`, or `admin` — stored on the authenticated user object.
- **TalentsPage**: The public page at `/talents` that lists talent profiles.

## Requirements

### Requirement 1: Install Framer Motion

**User Story:** As a developer, I want Framer Motion installed as a project dependency, so that all pages and components can use declarative motion primitives.

#### Acceptance Criteria

1. THE Application SHALL declare `framer-motion` as a production dependency in `client/package.json`.
2. WHEN a component imports `motion` from `framer-motion`, THE Application SHALL resolve the import without build or runtime errors.
3. WHEN the user's OS has `prefers-reduced-motion: reduce` set, THE Application SHALL pass `reducedMotion="user"` globally or individual `motion` components SHALL use a zero-duration variant, so no animation plays.

---

### Requirement 2: AppRouter — Complete Route Tree

**User Story:** As a user, I want every page to be reachable via its canonical URL, so that direct navigation, links, and browser history all work correctly.

#### Acceptance Criteria

1. THE AppRouter SHALL define a route for each of the following paths: `/`, `/challenges`, `/challenges/:id`, `/talents`, `/about`, `/contact`, `/faqs`, `/register`, `/login`.
2. WHEN an authenticated user with Role `talent` navigates to `/talent/*`, THE AppRouter SHALL render the `DashboardLayout` only after a `ProtectedRoute` check that allows the `talent` role.
3. WHEN an authenticated user with Role `organization` navigates to `/organization/*`, THE AppRouter SHALL render the `DashboardLayout` only after a `ProtectedRoute` check that allows the `organization` role.
4. WHEN an authenticated user with Role `admin` navigates to `/admin/*`, THE AppRouter SHALL render the `DashboardLayout` only after a `ProtectedRoute` check that allows the `admin` role.
5. WHEN a user navigates to any undefined path, THE AppRouter SHALL redirect the user to `/404`.
6. THE AppRouter SHALL import and wire `ProtectedRoute` so that all dashboard routes are wrapped in the appropriate role guard.

---

### Requirement 3: Auth-Aware PublicHeader

**User Story:** As a visitor or authenticated user, I want the header to reflect my login state and provide links to all public pages, so that I can navigate the site without confusion.

#### Acceptance Criteria

1. THE PublicHeader SHALL render navigation links to `/`, `/challenges`, `/talents`, `/about`, and `/faqs`.
2. WHEN `isAuthenticated` is `false`, THE PublicHeader SHALL display a "Log in" link to `/login` and a "Join the community" call-to-action link to `/register`.
3. WHEN `isAuthenticated` is `true`, THE PublicHeader SHALL hide the "Log in" and "Join the community" links and SHALL display a link to the user's role-appropriate dashboard (`/talent/dashboard`, `/organization/dashboard`, or `/admin/dashboard`).
4. WHEN the viewport width is below the `lg` Tailwind breakpoint (1024 px), THE PublicHeader SHALL render a toggle button that opens and closes a mobile navigation drawer.
5. WHEN the mobile navigation drawer is open and the user activates any link, THE PublicHeader SHALL close the drawer.
6. THE PublicHeader SHALL use `motion` from Framer Motion for the mobile drawer open/close animation.

---

### Requirement 4: Enriched DashboardSidebar

**User Story:** As an authenticated user, I want the sidebar to show my name and role and offer a logout action, so that I know who I am logged in as and can sign out easily.

#### Acceptance Criteria

1. THE DashboardSidebar SHALL read `user` and `logout` from `AuthContext` via `useAuth`.
2. WHEN `user` is non-null, THE DashboardSidebar SHALL display the user's name (or email as fallback) and role label in the bottom user-info section.
3. WHEN the user activates the logout button in the sidebar, THE DashboardSidebar SHALL call `logout()` and then navigate the user to `/login`.
4. THE DashboardSidebar SHALL render a logout button in the bottom section, visually distinct from navigation links.
5. WHEN a navigation link is active, THE DashboardSidebar SHALL apply the `bg-teal-500 text-white` active style and no other link SHALL have that style simultaneously.

---

### Requirement 5: LoginPage

**User Story:** As a registered user, I want a login form with role-based redirect on success, so that I am taken directly to my workspace after authentication.

#### Acceptance Criteria

1. THE LoginPage SHALL render a form with an email field, a password field, and a submit button.
2. WHEN the user submits the form with an empty email or password, THE LoginPage SHALL display an inline validation error message without making an API call.
3. WHEN the user submits valid credentials and the API returns a success response with a `user` object and `token`, THE LoginPage SHALL call `login(authData)` on `AuthContext`.
4. WHEN `user.role` is `talent` after successful login, THE LoginPage SHALL navigate to `/talent/dashboard`.
5. WHEN `user.role` is `organization` after successful login, THE LoginPage SHALL navigate to `/organization/dashboard`.
6. WHEN `user.role` is `admin` after successful login, THE LoginPage SHALL navigate to `/admin/dashboard`.
7. IF the API returns an error, THEN THE LoginPage SHALL display the error message to the user and SHALL NOT navigate.
8. WHILE the login request is in-flight, THE LoginPage SHALL disable the submit button and display a loading indicator.
9. THE LoginPage SHALL use `motion` from Framer Motion for an entrance animation on the form card.
10. THE LoginPage SHALL include a link to `/register` for users who do not yet have an account.

---

### Requirement 6: RegisterPage

**User Story:** As a new user, I want a registration form with role selection, so that I can create a talent or organisation account.

#### Acceptance Criteria

1. THE RegisterPage SHALL render a role selection step that lets the user choose either `talent` or `organization` before filling in account details.
2. THE RegisterPage SHALL render form fields for name, email, password, and password confirmation.
3. WHEN the user submits the form and the password field value does not match the password confirmation field value, THE RegisterPage SHALL display an inline error and SHALL NOT make an API call.
4. WHEN the user submits valid data and the API returns success, THE RegisterPage SHALL call `login(authData)` and redirect to the role-appropriate dashboard.
5. IF the API returns an error (e.g., email already in use), THEN THE RegisterPage SHALL display the server error message to the user.
6. WHILE the registration request is in-flight, THE RegisterPage SHALL disable the submit button and display a loading indicator.
7. THE RegisterPage SHALL use `motion` from Framer Motion for a step-transition animation between the role-selection step and the form step.
8. THE RegisterPage SHALL include a link to `/login` for users who already have an account.

---

### Requirement 7: ChallengesPage (Enhanced)

**User Story:** As a visitor, I want to browse all published challenges with filtering and pagination, so that I can find opportunities that match my interests.

#### Acceptance Criteria

1. THE ChallengesPage SHALL fetch challenges from `GET /api/challenges` with `page` and `limit` query parameters.
2. WHEN challenges load successfully, THE ChallengesPage SHALL render each challenge in a card that shows title, category badge, description excerpt, location, participation type, deadline, and required skills.
3. WHEN the user clicks "Explore opportunity" on a challenge card, THE ChallengesPage SHALL navigate to `/challenges/:id`.
4. WHEN the total number of challenges exceeds the page limit, THE ChallengesPage SHALL render pagination controls and SHALL update the list when the user navigates to a different page.
5. WHILE challenges are loading, THE ChallengesPage SHALL display skeleton placeholder cards.
6. IF the fetch fails, THEN THE ChallengesPage SHALL display an error message and a retry button.
7. THE ChallengesPage SHALL animate each card into view using `motion` from Framer Motion with a staggered entrance.
8. THE ChallengesPage SHALL include a `PublicHeader` and `PublicFooter`.

---

### Requirement 8: ChallengeDetailPage

**User Story:** As a visitor, I want to view the full details of a single challenge, so that I can decide whether to apply.

#### Acceptance Criteria

1. THE ChallengeDetailPage SHALL read the `:id` URL parameter and fetch data from `GET /api/challenges/:id`.
2. WHEN the challenge loads, THE ChallengeDetailPage SHALL display the title, full description, category, location, participation type, deadline, required skills, expected deliverables, and a call-to-action to apply or register.
3. IF the fetch returns a 404 or the challenge is not found, THEN THE ChallengeDetailPage SHALL display a "Challenge not found" message with a link back to `/challenges`.
4. WHILE the challenge is loading, THE ChallengeDetailPage SHALL display a skeleton layout matching the content structure.
5. THE ChallengeDetailPage SHALL use `motion` from Framer Motion for a fade-in entrance of the detail content.
6. THE ChallengeDetailPage SHALL include a `PublicHeader` and `PublicFooter`.
7. THE ChallengeDetailPage SHALL render a breadcrumb navigation showing "Challenges > [challenge title]".

---

### Requirement 9: TalentsPage

**User Story:** As a visitor or organisation, I want to browse talent profiles publicly, so that I can discover people with relevant skills.

#### Acceptance Criteria

1. THE TalentsPage SHALL attempt to fetch talent profiles from `GET /api/talent-profiles`.
2. WHEN profiles load successfully, THE TalentsPage SHALL render each profile in a card showing the talent's name, headline, top skills, and a link to their profile or a contact prompt.
3. IF the endpoint is unavailable or returns an empty list, THEN THE TalentsPage SHALL display a graceful empty-state message instead of an error, inviting talents to register.
4. THE TalentsPage SHALL animate profile cards using `motion` from Framer Motion with a staggered entrance.
5. THE TalentsPage SHALL include a `PublicHeader` and `PublicFooter`.

---

### Requirement 10: AboutPage

**User Story:** As a visitor, I want to read about the Talent Community platform's mission and team, so that I can understand its purpose before joining.

#### Acceptance Criteria

1. THE AboutPage SHALL render a hero section, a mission section, a "How it works" section, and a call-to-action section.
2. THE AboutPage SHALL use `motion` from Framer Motion for section entrance animations triggered by scroll intersection.
3. THE AboutPage SHALL include a `PublicHeader` and `PublicFooter`.
4. THE AboutPage SHALL not make any API calls and SHALL render entirely from static content.

---

### Requirement 11: ContactPage

**User Story:** As a visitor, I want to send a message to the platform team via a contact form, so that I can ask questions or request support.

#### Acceptance Criteria

1. THE ContactPage SHALL render a form with name, email, subject, and message fields.
2. WHEN the user submits the form with any required field empty, THE ContactPage SHALL display inline validation errors and SHALL NOT submit the form.
3. WHEN the user submits a valid form, THE ContactPage SHALL display a success confirmation message.
4. THE ContactPage SHALL use `motion` from Framer Motion for form entrance and success message animations.
5. THE ContactPage SHALL include a `PublicHeader` and `PublicFooter`.

---

### Requirement 12: FAQsPage

**User Story:** As a visitor, I want to browse frequently asked questions with expandable answers, so that I can quickly find answers without contacting support.

#### Acceptance Criteria

1. THE FAQsPage SHALL render a list of FAQ items, each with a question and a collapsible answer.
2. WHEN the user activates a question, THE FAQsPage SHALL expand the answer using a `motion` animation from Framer Motion.
3. WHEN the user activates an already-open question, THE FAQsPage SHALL collapse the answer.
4. THE FAQsPage SHALL allow only one answer to be open at a time.
5. THE FAQsPage SHALL include a `PublicHeader` and `PublicFooter`.
6. THE FAQsPage SHALL not make any API calls and SHALL render entirely from static content.

---

### Requirement 13: Shared Motion Standards

**User Story:** As a user, I want all animations to feel consistent, smooth, and unobtrusive, so that motion enhances rather than disrupts my experience.

#### Acceptance Criteria

1. THE Application SHALL use `framer-motion` `motion` components for all entrance, exit, and interactive animations across all new and updated pages.
2. WHEN the user has `prefers-reduced-motion: reduce` set in their OS, THE Application SHALL skip or minimise all animations to zero duration.
3. THE Application SHALL use consistent easing and duration values: entrance animations SHALL use a spring or ease-out curve with a duration between 300 ms and 600 ms.
4. THE Application SHALL use `AnimatePresence` for any component that conditionally mounts or unmounts with an animation.
