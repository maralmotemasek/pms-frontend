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

import Tasks from "../pages/tasks/Tasks";
import CreateTask from "../pages/tasks/CreateTask";
import TaskDetails from "../pages/tasks/TaskDetails";
import EditTask from "../pages/tasks/EditTask";

import UserProfile from "../pages/user/UserProfile";

import AppLayout from "../components/layout/AppLayout/AppLayout";


function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================
            DEFAULT
        ====================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
            />
          }
        />


        {/* =====================
            AUTH
        ====================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================
            APP
        ====================== */}

        <Route
          element={<AppLayout />}
        >

          {/* USER */}

          <Route
            path="/profile"
            element={
              <UserProfile />
            }
          />


          {/* PROJECTS */}

          <Route
            path="/projects"
            element={<Projects />}
          />


          <Route
            path="/projects/create"
            element={
              <CreateProject />
            }
          />


          <Route
            path="/projects/:id"
            element={
              <ProjectDetails />
            }
          />


          <Route
            path="/projects/:id/edit"
            element={
              <EditProject />
            }
          />


          {/* TASKS */}

          <Route
            path="/tasks"
            element={<Tasks />}
          />


          <Route
            path="/tasks/create"
            element={
              <CreateTask />
            }
          />


          <Route
            path="/tasks/:id"
            element={
              <TaskDetails />
            }
          />


          <Route
            path="/tasks/:id/edit"
            element={
              <EditTask />
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}


export default AppRoutes;