import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Forbidden } from './pages/Forbidden';
import { Dashboard } from './pages/Dashboard';
import { Notifications } from './pages/Notifications';
import { Olts } from './pages/Olts';
import { Audit } from './pages/Audit';
import { KriPage } from './pages/Kri';
import { RiskRegister } from './pages/RiskRegister';
import { ProcessFlowsPage } from './pages/ProcessFlows';
import { SelfAssessmentPage } from './pages/SelfAssessment';
import { Departments } from './pages/Departments';
import { Branches } from './pages/Branches';
import { Users } from './pages/Users';
import { RolesConfiguration } from './pages/RolesConfiguration';
import { Events } from './pages/Events';
import { LossCategories } from './pages/LossCategories';
import { canAccess } from './lib/auth/roles';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/shared/ThemeToggle';
import type { EngineKey } from './types';
import { Profile } from './pages/Profile';

function Guard({ engine, children }: {engine: EngineKey;children: React.ReactNode;}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!canAccess(user.role, engine)) return <Navigate to="/403" replace />;
  return <>{children}</>;
}

function Routing() {
  const { user, status } = useAuth();

  if (status === 'bootstrapping') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-5">
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-500">
          Restoring session...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>);

  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="/departments"
          element={
          <Guard engine="departments">
              <Departments />
            </Guard>
          } />
        <Route
          path="/branches"
          element={
          <Guard engine="branches">
              <Branches />
            </Guard>
          } />
        <Route
          path="/events"
          element={
          <Guard engine="events">
              <Events />
            </Guard>
          } />
        <Route
          path="/loss-categories"
          element={
          <Guard engine="lossCategories">
              <LossCategories />
            </Guard>
          } />
        <Route
          path="/users"
          element={
          <Guard engine="users">
              <Users />
            </Guard>
          } />
        <Route
          path="/roles-configuration"
          element={
          <Guard engine="rolesConfig">
              <RolesConfiguration />
            </Guard>
          } />
        <Route
          path="/olts"
          element={
          <Guard engine="olts">
              <Olts />
            </Guard>
          } />
        
        <Route
          path="/audit"
          element={
          <Guard engine="audit">
              <Audit />
            </Guard>
          } />
        
        <Route
          path="/kri"
          element={
          <Guard engine="kri">
              <KriPage />
            </Guard>
          } />
        
        <Route
          path="/risk-register"
          element={
          <Guard engine="riskRegister">
              <RiskRegister />
            </Guard>
          } />
        
        <Route
          path="/process-flows"
          element={
          <Guard engine="processFlows">
              <ProcessFlowsPage />
            </Guard>
          } />
        
        <Route
          path="/self-assessment"
          element={
          <Guard engine="selfAssessment">
              <SelfAssessmentPage />
            </Guard>
          } />
        
        <Route path="/403" element={<Forbidden />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>);

}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <ThemeToggle className="fixed right-4 top-4 z-[60]" />
            <Routing />
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>);

}
