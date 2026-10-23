import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './layout/AdminLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ServicesPage } from './pages/ServicesPage'
import { ProductsPage } from './pages/ProductsPage'
import { TeamPage } from './pages/TeamPage'
import { TestimonialsPage } from './pages/TestimonialsPage'
import { GalleryPage } from './pages/GalleryPage'
import { ContentPage } from './pages/ContentPage'
import { MessagesPage } from './pages/MessagesPage'
import { ActivityPage } from './pages/ActivityPage'
import { SettingsPage } from './pages/SettingsPage'

export function AdminRoutes() {
  return (
    <Routes>
      {/* Public Admin Auth Routes */}
      <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Admin Routes */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="testimonials" element={<TestimonialsPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="content" element={<ContentPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
