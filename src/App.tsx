import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingState } from "@/components/shared/LoadingState";

// Auth Pages
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";

// App Pages
import { TripsPage } from "@/pages/trips/TripsPage";
import { StartTripPage } from "@/pages/trips/StartTripPage";
import { ActiveTripPage } from "@/pages/trips/ActiveTripPage";
import { TripDetailsPage } from "@/pages/trips/TripDetailsPage";
import { LocationsPage } from "@/pages/locations/LocationsPage";
import { LocationFormPage } from "@/pages/locations/LocationFormPage";
import { ContactsPage } from "@/pages/contacts/ContactsPage";
import { ContactFormPage } from "@/pages/contacts/ContactFormPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState fullScreen message="Loading SafeWalk..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState fullScreen message="Loading SafeWalk..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/trips" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/trips/start" element={<StartTripPage />} />
        <Route path="/trips/active" element={<ActiveTripPage />} />
        <Route path="/trips/:tripId" element={<TripDetailsPage />} />

        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/locations/new" element={<LocationFormPage />} />
        <Route path="/locations/:locationId" element={<LocationFormPage />} />

        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/contacts/new" element={<ContactFormPage />} />
        <Route path="/contacts/:contactId" element={<ContactFormPage />} />

        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/trips" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
