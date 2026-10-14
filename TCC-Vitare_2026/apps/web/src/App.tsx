import { useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";

import LandingPage from "../app/page";
import LoginPage from "../app/login/page";
import ForgotPasswordPage from "../app/esqueci-senha/page";
import ResetPasswordPage from "../app/auth/reset-passworld/page";
import GoogleCallbackPage from "../app/auth/google/callback/page";
import CadastroPage from "../app/cadastro/page";
import Dashboard from "../app/dashboard/page";
import MedicationsPage from "../app/medicamentos/page";
import ChronicDiseasesPage from "../app/doencas-cronicas/page";
import EmergencyContactsPage from "../app/contatos-emergencia/page";
import UserProfilePage from "../app/perfil/page";
import { ProtectedRoute } from "../components/protected-route";
import CompleteRegisterPage from "../app/completar-cadastro/page";
import AllergiesPage from "../app/alergias/page";
import NotFoundPage from "../app/not-found/page";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicamentos"
          element={
            <ProtectedRoute>
              <MedicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/completar-cadastro"
          element={
            <ProtectedRoute>
              <CompleteRegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doencas-cronicas"
          element={
            <ProtectedRoute>
              <ChronicDiseasesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alergias"
          element={
            <ProtectedRoute>
              <AllergiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contatos-emergencia"
          element={
            <ProtectedRoute>
              <EmergencyContactsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Backward-compatible aliases for the temporary /minha-saude/* paths. */}
        <Route
          path="/minha-saude/doencas-cronicas"
          element={<Navigate to="/doencas-cronicas" replace />}
        />
        <Route
          path="/minha-saude/alergias"
          element={<Navigate to="/alergias" replace />}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}