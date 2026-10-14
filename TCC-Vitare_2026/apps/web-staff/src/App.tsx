import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import StaffEntryPage from "../app/entry/page";
import StaffLoginPage from "../app/login/page";
import StaffSignupPage from "../app/cadastro/page";
import StaffEmergenciesPage from "../app/emergencias/page";
import StaffPatientsPage from "../app/pacientes/page";
import StaffNotFoundPage from "../app/not-found/page";
import { StaffAuthProvider } from "./context/staff-auth-context";
import { StaffProtectedRoute } from "../components/staff-protected-route";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <StaffAuthProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<StaffEntryPage />} />
        <Route path="/login" element={<StaffLoginPage />} />
        <Route path="/cadastro" element={<StaffSignupPage />} />
        <Route path="/emergencias" element={<StaffProtectedRoute><StaffEmergenciesPage /></StaffProtectedRoute>} />
        <Route path="/pacientes" element={<StaffProtectedRoute><StaffPatientsPage /></StaffProtectedRoute>} />
        <Route path="*" element={<StaffNotFoundPage />} />
      </Routes>
    </StaffAuthProvider>
  );
}