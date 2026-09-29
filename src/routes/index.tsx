import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { FoodItemsPage } from '../pages/Menu/FoodItemsPage';
import { CategoriesPage } from '../pages/Menu/CategoriesPage';
import { CombosPage } from '../pages/Menu/CombosPage';
import { SeatsPage } from '../pages/Seats/SeatsPage';
import { OrdersPage } from '../pages/Orders/OrdersPage';
import { PaymentsPage } from '../pages/Payments/PaymentsPage';
import { CustomersPage } from '../pages/Customers/CustomersPage';
import { CouponsPage } from '../pages/Coupons/CouponsPage';
import { ReportsPage } from '../pages/Reports/ReportsPage';
import { SettingsPage } from '../pages/Settings/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Menu routes */}
        <Route path="menu">
          <Route index element={<Navigate to="/menu/foods" replace />} />
          <Route path="foods" element={<FoodItemsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="combos" element={<CombosPage />} />
        </Route>

        <Route path="seats" element={<SeatsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
