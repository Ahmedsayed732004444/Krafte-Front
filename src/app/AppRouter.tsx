import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import HomePage from "@/features/home/pages/HomePage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import BookingsPage from "@/features/bookings/pages/BookingsPage";
import BookingDetailsPage from "@/features/bookings/pages/BookingDetailsPage";
import CreateBookingPage from "@/features/bookings/pages/CreateBookingPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import CustomersPage from "@/features/customers/pages/CustomersPage";
import CustomerDetailsPage from "@/features/customers/pages/CustomerDetailsPage";
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";
import ExpensesPage from "@/features/expenses/pages/ExpensesPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/bookings/create" element={<CreateBookingPage />} />
            <Route path="/bookings/:id" element={<BookingDetailsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
