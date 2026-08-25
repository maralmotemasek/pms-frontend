import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login/Login";
import Register from "../pages/auth/Register/Register";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;