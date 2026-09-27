import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Registration from "../pages/Registration";
import EmailVerification from "../pages/EmailVerification";
import MyTrips from "../pages/MyTrips";
import NewTrip from "../pages/NewTrip";
import BudgetPreferences from "../pages/BudgetPreferences";
import CompareItineraries from "../pages/CompareItineraries";


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
    </Routes>
  );
}

export default AppRoutes;