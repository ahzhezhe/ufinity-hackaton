import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/Login';
import { AdminDashboard, SeatManagement, BookingViewer, FloorPlanUpload } from '@/pages/admin';
import { Availability, BookingFlow, MyBookings, WhoBookedWhat } from '@/pages/public';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

function AppRoutes() {
  const { isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Redirect based on role */}
        <Route
          path="/"
          element={
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Availability />
            )
          }
        />

        {/* Public Portal Routes (Employee) */}
        <Route path="/book" element={<Availability />} />
        <Route path="/book/multi" element={<BookingFlow />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/who-booked" element={<WhoBookedWhat />} />

        {/* Admin Portal Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/seats"
          element={
            <ProtectedRoute requireAdmin>
              <SeatManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute requireAdmin>
              <BookingViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/floor-plans"
          element={
            <ProtectedRoute requireAdmin>
              <FloorPlanUpload />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
