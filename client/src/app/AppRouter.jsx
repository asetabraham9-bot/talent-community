import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public pages
import HomePage from "../pages/public/HomePage";
import ChallengesPage from "../pages/public/ChallengesPage";
import ChallengeDetailPage from "../pages/public/ChallengeDetailPage";
import TalentsPage from "../pages/public/TalentsPage";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";
import FAQsPage from "../pages/public/FAQsPage";
import NotFoundPage from "../pages/public/NotFoundPage";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// Dashboard layout
import DashboardLayout from "../layouts/DashboardLayout";

// Talent pages
import TalentDashboardPage from "../pages/talent/TalentDashboardPage";
import TalentProfilePage from "../pages/talent/TalentProfilePage";
import TalentApplicationsPage from "../pages/talent/TalentApplicationsPage";
import TalentProjectsPage from "../pages/talent/TalentProjectsPage";

// Organization pages
import OrganizationDashboardPage from "../pages/organization/OrganizationDashboardPage";
import OrganizationProfilePage from "../pages/organization/OrganizationProfilePage";
import OrganizationChallengesPage from "../pages/organization/OrganizationChallengesPage";
import OrganizationApplicationsPage from "../pages/organization/OrganizationApplicationsPage";
import OrganizationProjectsPage from "../pages/organization/OrganizationProjectsPage";

// Admin pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminOrganizationsPage from "../pages/admin/AdminOrganizationsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";

// Route guard
import ProtectedRoute from "../routes/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ──────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/challenges" element={<ChallengesPage />} />
        <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
        <Route path="/talents" element={<TalentsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faqs" element={<FAQsPage />} />

        {/* ── Auth routes ────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Talent workspace (protected) ───────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["talent"]} />}>
          <Route path="/talent" element={<DashboardLayout role="talent" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TalentDashboardPage />} />
            <Route path="profile" element={<TalentProfilePage />} />
            <Route path="applications" element={<TalentApplicationsPage />} />
            <Route path="projects" element={<TalentProjectsPage />} />
          </Route>
        </Route>

        {/* ── Organization workspace (protected) ─────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["organization"]} />}>
          <Route path="/organization" element={<DashboardLayout role="organization" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OrganizationDashboardPage />} />
            <Route path="profile" element={<OrganizationProfilePage />} />
            <Route path="challenges" element={<OrganizationChallengesPage />} />
            <Route path="applications" element={<OrganizationApplicationsPage />} />
            <Route path="projects" element={<OrganizationProjectsPage />} />
          </Route>
        </Route>

        {/* ── Admin workspace (protected) ────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="organizations" element={<AdminOrganizationsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        {/* ── 404 ────────────────────────────────────────────── */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
