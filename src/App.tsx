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
import type { EngineKey } from './types';
import { Profile } from './pages/Profile';
import {
  ActionStatuses,
  BaselEventCategories,
  Controls,
  Currencies,
  DataSources,
  EventStatuses,
  KriCategories,
  RecoveryMethods,
  ResidualRisks,
  RootCauses,
  UnitsOfMeasure,
  ValidationResults
} from './pages/SystemConfigurationPage';
import { TreatmentStrategies } from './pages/TreatmentStrategies';

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
          path="/system-configurations/event-statuses"
          element={
            <Guard engine="eventStatuses">
              <EventStatuses />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/residual-risks"
          element={
            <Guard engine="residualRisks">
              <ResidualRisks />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/action-statuses"
          element={
            <Guard engine="actionStatuses">
              <ActionStatuses />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/recovery-methods"
          element={
            <Guard engine="recoveryMethods">
              <RecoveryMethods />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/root-causes"
          element={
            <Guard engine="rootCauses">
              <RootCauses />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/basel-event-categories"
          element={
            <Guard engine="baselEventCategories">
              <BaselEventCategories />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/data-sources"
          element={
            <Guard engine="dataSources">
              <DataSources />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/validation-results"
          element={
            <Guard engine="validationResults">
              <ValidationResults />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/controls"
          element={
            <Guard engine="controls">
              <Controls />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/currencies"
          element={
            <Guard engine="currencies">
              <Currencies />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/kri-categories"
          element={
            <Guard engine="kriCategories">
              <KriCategories />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/treatment-strategies"
          element={
            <Guard engine="treatmentStrategies">
              <TreatmentStrategies />
            </Guard>
          }
        />
        <Route
          path="/system-configurations/units-of-measure"
          element={
            <Guard engine="unitsOfMeasure">
              <UnitsOfMeasure />
            </Guard>
          }
        />
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
            <Routing />
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>);

}
