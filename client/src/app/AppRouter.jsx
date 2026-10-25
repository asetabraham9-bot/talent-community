import {BrowserRouter,  Routes, Route, Navigate,} from "react-router-dom";

import HomePage from "../pages/public/HomePage";
import ChallengesPage from "../pages/public/ChallengesPage";
import NotFoundPage from "../pages/public/NotFoundPage";

import DashboardLayout from "../layouts/DashboardLayout";
import TalentDashboardPage from "../pages/talent/TalentDashboardPage";
import OrganizationDashboardPage from "../pages/organization/OrganizationDashboardPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/challenges" element={<ChallengesPage />} />

        {/* Talent dashboard */}
        <Route path="/talent" element={<DashboardLayout role="talent" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TalentDashboardPage />} />
        </Route>

        {/* Organization dashboard */}
        <Route path="/organization" element={<DashboardLayout role="organization" />} >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<OrganizationDashboardPage />}  />
        </Route>

        {/* Administrator dashboard */}
        <Route path="/admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<Navigate to="dashboard" replace />}/>
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>

        {/* Not found */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
