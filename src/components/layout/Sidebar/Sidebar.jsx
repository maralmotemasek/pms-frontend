import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Sparkles,
  LogOut,
  Box,
} from "lucide-react";

import "./Sidebar.css";


function Sidebar() {
  const navigate = useNavigate();


  const handleLogout = () => {
    // بعداً وقتی JWT اضافه شد،
    // اینجا Token را هم پاک می‌کنیم.
    navigate("/login");
  };


  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-brand">

        <div className="sidebar-logo">
          <Box size={22} strokeWidth={2.2} />
        </div>

        <span className="sidebar-brand-text">
          سیستم مدیریت پروژه
        </span>

      </div>


      {/* Menu */}
      <nav className="sidebar-nav">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <LayoutDashboard className="sidebar-icon" size={21} />
          <span>داشبورد</span>
        </NavLink>


        <NavLink
          to="/projects"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <FolderKanban className="sidebar-icon" size={21} />
          <span>پروژه‌ها</span>
        </NavLink>


        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <ClipboardList className="sidebar-icon" size={21} />
          <span>وظایف</span>
        </NavLink>


        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <BarChart3 className="sidebar-icon" size={21} />
          <span>گزارش‌ها</span>
        </NavLink>


        <NavLink
          to="/chat"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <MessageSquare className="sidebar-icon" size={21} />
          <span>چت تیمی</span>
        </NavLink>


        <NavLink
          to="/ai-chat"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <Sparkles className="sidebar-icon" size={21} />
          <span>دستیار هوشمند</span>
        </NavLink>


        {/* Logout دقیقا زیر دستیار هوشمند */}
        <button
          type="button"
          className="sidebar-link logout-button"
          onClick={handleLogout}
        >
          <LogOut className="sidebar-icon" size={21} />
          <span>خروج</span>
        </button>

      </nav>

    </aside>
  );
}


export default Sidebar;