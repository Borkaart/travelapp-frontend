import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";
import TripBudgetPage from "./pages/trip/TripBudgetPage";
import LoginPage from "./pages/LoginPage";
import TripsListPage from "./pages/TripsListPage";
import TripLayout from "./pages/trip/TripLayout";
import TripSummaryPage from "./pages/trip/TripSummaryPage";
import TripItineraryPage from "./pages/trip/TripItineraryPage";
import TripExpensesPage from "./pages/trip/TripExpensesPage";
import TripCreatePage from "./pages/TripCreatePage";
import UserProfilePage from "./pages/user/UserProfilePage";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/trips"
          element={
            <RequireAuth>
              <TripsListPage />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <UserProfilePage />
            </RequireAuth>
          }
        />
        
        <Route
          path="/profile/setup"
          element={
            <RequireAuth>
              <UserProfilePage isSetupMode={true} />
            </RequireAuth>
          }
        />

        <Route
          path="/trips/new"
          element={
            <RequireAuth>
              <ErrorBoundary>
                <TripCreatePage />
              </ErrorBoundary>
            </RequireAuth>
          }
        />

        <Route
          path="/trips/:tripId"
          element={
            <RequireAuth>
              <TripLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="summary" replace />} />
          <Route path="summary" element={<TripSummaryPage />} />
          <Route path="itinerary" element={<TripItineraryPage />} />
          <Route path="activities" element={<Navigate to="../itinerary" replace />} />
          <Route path="expenses" element={<TripExpensesPage />} />
          <Route path="budget" element={<TripBudgetPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
