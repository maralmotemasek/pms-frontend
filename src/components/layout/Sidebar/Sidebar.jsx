import {
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Sparkles,
  LogOut,
  Box,
  Gauge,
} from "lucide-react";

import {
  logoutUser,
} from "../../../services/authService";

import "./Sidebar.css";


function Sidebar() {
  const navigate =
    useNavigate();

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);


  const handleLogout =
    async () => {

      if (isLoggingOut) {
        return;
      }

      setIsLoggingOut(true);

      try {
        await logoutUser();
      } catch (error) {
        console.error(
          "Logout error:",
          error
        );
      } finally {
        navigate(
          "/login",
          {
            replace: true,
          }
        );

        setIsLoggingOut(false);
      }
    };


  const getLinkClass =
    ({ isActive }) =>
      isActive
        ? "sidebar-link active"
        : "sidebar-link";


  return (
    <aside className="sidebar">

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          <Box
            size={22}
            strokeWidth={2.2}
          />
        </div>

        <span className="sidebar-brand-text">
          سیستم مدیریت پروژه
        </span>

      </div>


      <nav className="sidebar-nav">

        <NavLink
          to="/dashboard"
          className={getLinkClass}
        >
          <LayoutDashboard
            className="sidebar-icon"
            size={21}
          />

          <span>
            داشبورد
          </span>
        </NavLink>


        <NavLink
          to="/organizations"
          className={getLinkClass}
        >
          <Building2
            className="sidebar-icon"
            size={21}
          />

          <span>
            سازمان‌ها
          </span>
        </NavLink>


        <NavLink
          to="/projects"
          className={getLinkClass}
        >
          <FolderKanban
            className="sidebar-icon"
            size={21}
          />

          <span>
            پروژه‌ها
          </span>
        </NavLink>


        <NavLink
          to="/resources"
          className={getLinkClass}
        >
          <Gauge
            className="sidebar-icon"
            size={21}
          />

          <span>
            منابع
          </span>
        </NavLink>


        <NavLink
          to="/tasks"
          className={getLinkClass}
        >
          <ClipboardList
            className="sidebar-icon"
            size={21}
          />

          <span>
            وظایف
          </span>
        </NavLink>


        <NavLink
          to="/reports"
          className={getLinkClass}
        >
          <BarChart3
            className="sidebar-icon"
            size={21}
          />

          <span>
            گزارش‌ها
          </span>
        </NavLink>


        <NavLink
          to="/chat"
          className={getLinkClass}
        >
          <MessageSquare
            className="sidebar-icon"
            size={21}
          />

          <span>
            چت تیمی
          </span>
        </NavLink>


        <NavLink
          to="/ai-chat"
          className={getLinkClass}
        >
          <Sparkles
            className="sidebar-icon"
            size={21}
          />

          <span>
            دستیار هوشمند
          </span>
        </NavLink>


        <button
          type="button"
          className="sidebar-link logout-button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut
            className="sidebar-icon"
            size={21}
          />

          <span>
            {isLoggingOut
              ? "در حال خروج..."
              : "خروج"}
          </span>
        </button>

      </nav>

    </aside>
  );
}


export default Sidebar;

