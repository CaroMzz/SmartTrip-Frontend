import { Routes, Route } from "react-router-dom";

import Login from "../pages/login/Login";
import Registration from "../pages/registration/Registration";
import EmailVerification from "../pages/email-verification/EmailVerification";
import MyTrips from "../pages/my-trips/MyTrips";
import NewTrip from "../pages/new-trips/NewTrip";
import BudgetPreferences from "../pages/budget-preferences/BudgetPreferences";
import CompareItineraries from "../pages/compare-itineraries/CompareItineraries";
import Itinerary from "../pages/itinerary/Itinerary";
import EditTrip from "../pages/edit-trip/EditTrip";
import TripCalendar from "../pages/trip-calendar/TripCalendar";
import TripBudget from "../pages/trip-budget/TripBudget";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Registration />} />

      <Route path="/email-verification" element={<EmailVerification />} />

      <Route path="/my-trips" element={<MyTrips />} />

      <Route path="/new-trip" element={<NewTrip />} />

      <Route path="/budget-preferences" element={<BudgetPreferences />} />

      <Route path="/compare-itineraries" element={<CompareItineraries />} />

      <Route path="/itinerary" element={<Itinerary />} />

      <Route path="/edit-trip" element={<EditTrip />} />

      <Route path="/trip-calendar" element={<TripCalendar />} />

      <Route path="/trip-budget" element={<TripBudget />} />
    </Routes>
  );
}

export default AppRoutes;