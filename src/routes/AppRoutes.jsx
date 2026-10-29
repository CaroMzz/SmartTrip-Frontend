import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Faq from "../pages/faq/Faq";
import EmailVerification from "../pages/email-verification/EmailVerification";
import Login from "../pages/login/Login";
import Registration from "../pages/registration/Registration";
import {
  BudgetPreferences,
  CompareItineraries,
  EditTrip,
  Itinerary,
  MyTrips,
  NewTrip,
  TripBudget,
  TripCalendar,
} from "../pages/TravelPages";
import { ChangePassword, Profile } from "../pages/AccountPages";
import { getToken } from "../auth";

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleExpiredSession = () => navigate("/", { replace: true });
    window.addEventListener("smarttrip:session-expired", handleExpiredSession);
    return () =>
      window.removeEventListener("smarttrip:session-expired", handleExpiredSession);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/email-verification" element={<EmailVerification />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/confirmar-correo" element={<EmailVerification />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/ayuda" element={<Faq />} />
      <Route path="/my-trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
      <Route path="/new-trip" element={<ProtectedRoute><NewTrip /></ProtectedRoute>} />
      <Route path="/budget-preferences" element={<ProtectedRoute><BudgetPreferences /></ProtectedRoute>} />
      <Route path="/compare-itineraries" element={<ProtectedRoute><CompareItineraries /></ProtectedRoute>} />
      <Route path="/itinerary" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
      <Route path="/edit-trip" element={<ProtectedRoute><EditTrip /></ProtectedRoute>} />
      <Route path="/trip-calendar" element={<ProtectedRoute><TripCalendar /></ProtectedRoute>} />
      <Route path="/trip-budget" element={<ProtectedRoute><TripBudget /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
