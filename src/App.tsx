import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";

import LoginPage from "./pages/LoginPage";
import TripsListPage from "./pages/TripsListPage";

import TripLayout from "./pages/trip/TripLayout";
import TripSummaryPage from "./pages/trip/TripSummaryPage";
import TripItineraryPage from "./pages/trip/TripItineraryPage";
import TripActivitiesPage from "./pages/trip/TripActivitiesPage";
import TripExpensesPage from "./pages/trip/TripExpensesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/login" element={<LoginPage />} />

        {/* ===== PROTECTED ROUTES ===== */}

        {/* Trips list */}
        <Route
          path="/trips"
          element={
            <RequireAuth>
              <TripsListPage />
            </RequireAuth>
          }
        />

        {/* Trip details layout */}
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
          <Route path="activities" element={<TripActivitiesPage />} />
          <Route path="expenses" element={<TripExpensesPage />} />
        </Route>

        {/* ===== DEFAULT REDIRECT ===== */}
        <Route path="/" element={<Navigate to="/trips" replace />} />
        <Route path="*" element={<Navigate to="/trips" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
