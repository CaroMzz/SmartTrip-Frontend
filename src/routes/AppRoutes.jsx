import { Routes, Route } from "react-router-dom";

import EmailVerification from "../pages/EmailVerification";
import Login from "../pages/Login";
import Registration from "../pages/Registration";
import MyTrips from "../pages/MyTrips";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/my-trips" element={<MyTrips />} />
    </Routes>
  );
}

export default AppRoutes;