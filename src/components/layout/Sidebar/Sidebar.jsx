import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  BarChart3,
  Bell,
  Box,
  Building2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import {
  logoutUser,
} from "../../../services/authService";

import {
  getMyOrganizationInvitations,
} from "../../../services/organizationService";

import "./Sidebar.css";


function Sidebar() {
  const navigate =
    useNavigate();

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const [
    pendingOrganizationInvitations,
    setPendingOrganizationInvitations,
  ] = useState(0);


  const loadPendingOrganizationInvitations =
    async () => {
      try {
        const invitations =
          await getMyOrganizationInvitations();

        const pendingCount =
          Array.isArray(invitations)
            ? invitations.filter(
                (invitation) => {
                  if (!invitation.status) {
                    return true;
                  }

                  return (
                    String(
                      invitation.status
                    ).toUpperCase() ===
                    "PENDING"
                  );
                }
              ).length
            : 0;

        setPendingOrganizationInvitations(
          pendingCount
        );
      } catch (error) {
        console.error(
          "Load organization invitations count error:",
          error
        );
      }
    };


  useEffect(() => {
    loadPendingOrganizationInvitations();

    const timer =
      window.setInterval(
        loadPendingOrganizationInvitations,
        30000
      );

    return () => {
      window.clearInterval(timer);
    };
  }, []);


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

          <span className="sidebar-label">
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

          <span
            className={
              pendingOrganizationInvitations > 0
                ? "sidebar-label sidebar-organization-label has-invite"
                : "sidebar-label sidebar-organization-label"
            }
          >
            <span className="sidebar-organization-text">
              سازمان‌ها
            </span>

            {pendingOrganizationInvitations > 0 && (
              <Bell
                className="sidebar-invite-bell"
                size={16}
                strokeWidth={2.5}
                aria-label="دعوت‌نامه جدید"
              />
            )}
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

          <span className="sidebar-label">
            پروژه‌ها
          </span>
        </NavLink>


        <NavLink
          to="/resources"
          className={getLinkClass}
        >
          <BarChart3
            className="sidebar-icon"
            size={21}
          />

          <span className="sidebar-label">
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

          <span className="sidebar-label">
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

          <span className="sidebar-label">
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

          <span className="sidebar-label">
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

          <span className="sidebar-label">
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

          <span className="sidebar-label">
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
