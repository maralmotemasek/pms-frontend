import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login/Login";
import Register from "../pages/auth/Register/Register";

import Projects from "../pages/projects/Projects";
import CreateProject from "../pages/projects/CreateProject";
import EditProject from "../pages/projects/EditProject";
import ProjectDetails from "../pages/projects/ProjectDetails";

import AppLayout from "../components/layout/AppLayout/AppLayout";


function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* مسیر پیش‌فرض */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />


        {/* صفحات احراز هویت - بدون Header و Sidebar */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* صفحات داخلی سیستم - دارای Header و Sidebar */}
        <Route element={<AppLayout />}>

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/projects/create"
            element={<CreateProject />}
          />

          <Route
            path="/projects/:id"
            element={<ProjectDetails />}
          />

          <Route
            path="/projects/:id/edit"
            element={<EditProject />}
          />

        </Route>


      </Routes>

    </BrowserRouter>
  );
}


export default AppRoutes;