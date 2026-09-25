import { Routes, Route } from "react-router-dom";

import EmailVerification from "../pages/EmailVerification";
import Login from "../pages/Login";
import Registration from "../pages/Registration";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Registration />} />

      <Route
        path="/verify-email"
        element={<EmailVerification />}
      />
    </Routes>
  );
}

export default AppRoutes;
