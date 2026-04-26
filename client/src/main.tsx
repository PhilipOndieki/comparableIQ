import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchPage } from '@/pages/SearchPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { ComparablesPage } from '@/pages/admin/ComparablesPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { AuditPage } from '@/pages/admin/AuditPage';
import { AddComparablePage } from '@/pages/admin/AddComparablePage';
import { UserRole } from '@/types';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/comparables"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <ComparablesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/comparables/new"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <AddComparablePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <AuditPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
