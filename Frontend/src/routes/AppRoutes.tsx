import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { RoleSelectionPage } from '../pages/public/RoleSelectionPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Seller / Collector Pages
import { SellerDashboard } from '../pages/seller/SellerDashboard';
import { CreateLotPage } from '../pages/seller/CreateLotPage';
import { PriceEstimatePage } from '../pages/seller/PriceEstimatePage';
import { SellerLotsPage } from '../pages/seller/SellerLotsPage';
import { SellerLotDetailsPage } from '../pages/seller/SellerLotDetailsPage';
import { RecyclerMatchesPage } from '../pages/seller/RecyclerMatchesPage';
import { SellerPickupsPage } from '../pages/seller/SellerPickupsPage';
import { SellerTransactionsPage } from '../pages/seller/SellerTransactionsPage';
import { SellerNotificationsPage } from '../pages/seller/SellerNotificationsPage';

// Recycler / Buyer Pages
import { RecyclerDashboard } from '../pages/recycler/RecyclerDashboard';
import { BrowseLotsPage } from '../pages/recycler/BrowseLotsPage';
import { RecyclerLotDetailsPage } from '../pages/recycler/RecyclerLotDetailsPage';
import { AcceptedLotsPage } from '../pages/recycler/AcceptedLotsPage';
import { PickupHandoverPage } from '../pages/recycler/PickupHandoverPage';
import { RecyclerTransactionsPage } from '../pages/recycler/RecyclerTransactionsPage';
import { RecyclerPricesPage } from '../pages/recycler/RecyclerPricesPage';
import { RecyclerNotificationsPage } from '../pages/recycler/RecyclerNotificationsPage';

// Shared
import { ProfilePage } from '../pages/shared/ProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/join" element={<RoleSelectionPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Seller / Kabadiwala Routes */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRole="collector">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/seller/dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="lots/create" element={<CreateLotPage />} />
        <Route path="price-estimate" element={<PriceEstimatePage />} />
        <Route path="lots" element={<SellerLotsPage />} />
        <Route path="lots/:id" element={<SellerLotDetailsPage />} />
        <Route path="lots/:id/matches" element={<RecyclerMatchesPage />} />
        <Route path="pickups" element={<SellerPickupsPage />} />
        <Route path="transactions" element={<SellerTransactionsPage />} />
        <Route path="notifications" element={<SellerNotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Recycler / Buyer Routes */}
      <Route
        path="/recycler"
        element={
          <ProtectedRoute allowedRole="recycler">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/recycler/dashboard" replace />} />
        <Route path="dashboard" element={<RecyclerDashboard />} />
        <Route path="lots" element={<BrowseLotsPage />} />
        <Route path="lots/:id" element={<RecyclerLotDetailsPage />} />
        <Route path="accepted-lots" element={<AcceptedLotsPage />} />
        <Route path="pickups" element={<AcceptedLotsPage />} />
        <Route path="pickups/:id" element={<PickupHandoverPage />} />
        <Route path="transactions" element={<RecyclerTransactionsPage />} />
        <Route path="prices" element={<RecyclerPricesPage />} />
        <Route path="notifications" element={<RecyclerNotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

