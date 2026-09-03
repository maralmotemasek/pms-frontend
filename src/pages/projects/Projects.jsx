import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Building2,
  Filter,
  Plus,
  Search,
} from "lucide-react";

import {
  getCurrentUser,
} from "../../services/authService";

import {
  getMyOrganizations,
} from "../../services/organizationService";

import {
  getProjectManagers,
  getProjectMembership,
  getWorkspaceProjects,
  normalizeProjectRole,
} from "../../data/projectWorkspaceStore";

import {
  PROJECT_ROLES,
} from "../../constants/roles";

import {
  canCreateProjectFromOrganizations,
  canViewWorkspaceProject,
  getProjectOrganizationRole,
  getProjectRoleLabel,
} from "../../utils/projectAccess";

import "./Projects.css";


const STATUS_OPTIONS = {
  all: "همه وضعیت‌ها",
  "in-progress": "در حال انجام",
  delayed: "با تأخیر",
  review: "در انتظار تأیید",
  completed: "تکمیل شده",
};


function Projects() {
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    organizations,
    setOrganizations,
  ] = useState([]);

  const [
    projects,
    setProjects,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    organizationFilter,
    setOrganizationFilter,
  ] = useState("all");

  const [
    searchValue,
    setSearchValue,
  ] = useState("");


  useEffect(() => {
    const loadPage =
      async () => {

        setLoading(true);

        try {
          const [
            user,
            organizationList,
          ] =
            await Promise.all([
              getCurrentUser(),
              getMyOrganizations(),
            ]);

          const safeOrganizations =
            Array.isArray(
              organizationList
            )
              ? organizationList
              : [];

          setCurrentUser(user);
          setOrganizations(
            safeOrganizations
          );

          setProjects(
            getWorkspaceProjects()
          );
        } catch (error) {
          console.error(
            "Load projects page error:",
            error
          );
        } finally {
          setLoading(false);
        }
      };


    loadPage();
  }, []);


  const visibleProjects =
    useMemo(
      () => {

        if (!currentUser) {
          return [];
        }

        return projects.filter(
          (project) =>
            canViewWorkspaceProject(
              currentUser,
              project,
              organizations
            )
        );
      },
      [
        projects,
        currentUser,
        organizations,
      ]
    );


  const filteredProjects =
    useMemo(
      () => {

        const search =
          searchValue
            .trim()
            .toLowerCase();

        return visibleProjects.filter(
          (project) => {

            if (
              statusFilter !==
                "all" &&
              project.status !==
                statusFilter
            ) {
              return false;
            }

            if (
              organizationFilter !==
                "all" &&
              String(
                project.organizationId
              ) !==
                organizationFilter
            ) {
              return false;
            }

            if (!search) {
              return true;
            }

            return (
              project.title
                ?.toLowerCase()
                .includes(search) ||
              project.organizationName
                ?.toLowerCase()
                .includes(search)
            );
          }
        );
      },
      [
        visibleProjects,
        statusFilter,
        organizationFilter,
        searchValue,
      ]
    );


  const canCreate =
    canCreateProjectFromOrganizations(
      currentUser,
      organizations
    );


  return (
    <section className="projects-page">

      <div className="projects-heading">

        <div>
          <h2>
            پروژه‌ها
          </h2>

          <p>
            مدیریت پروژه‌های سازمان، اعضا و سطح دسترسی پروژه‌ای
          </p>
        </div>

        {canCreate && (
          <Link
            to="/projects/create"
            className="create-project-button"
          >
            <Plus size={18} />

            ایجاد پروژه
          </Link>
        )}

      </div>


      <div className="projects-toolbar">

        <div className="projects-search">

          <Search size={17} />

          <input
            type="text"
            value={searchValue}
            onChange={(event) =>
              setSearchValue(
                event.target.value
              )
            }
            placeholder="جستجو در پروژه‌ها..."
          />

        </div>


        <div className="projects-filter-section">

          <div className="status-filter">

            <Filter size={16} />

            <select
              value={
                organizationFilter
              }
              onChange={(event) =>
                setOrganizationFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                همه سازمان‌ها
              </option>

              {organizations.map(
                (organization) => (
                  <option
                    key={
                      organization.id
                    }
                    value={
                      organization.id
                    }
                  >
                    {
                      organization.name
                    }
                  </option>
                )
              )}
            </select>

          </div>


          <div className="status-filter">

            <Filter size={16} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              {Object.entries(
                STATUS_OPTIONS
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>

          </div>

        </div>

      </div>


      <div className="projects-table-card">

        <div className="projects-table-header">

          <div>
            <strong>
              پروژه‌های من
            </strong>

            <span>
              {filteredProjects.length}
              {" "}
              پروژه
            </span>
          </div>

        </div>


        {loading ? (
          <div className="projects-empty">
            در حال بارگذاری پروژه‌ها...
          </div>
        ) : filteredProjects.length ===
          0 ? (
          <div className="projects-empty">

            <Building2 size={39} />

            <strong>
              پروژه‌ای برای نمایش وجود ندارد
            </strong>

            <p>
              اگر مالک یا مدیر سازمان هستید، اولین پروژه را ایجاد کنید.
            </p>

          </div>
        ) : (
          <div className="projects-table-wrapper">

            <table className="projects-table">

              <thead>
                <tr>
                  <th>
                    عنوان پروژه
                  </th>

                  <th>
                    سازمان
                  </th>

                  <th>
                    وضعیت
                  </th>

                  <th>
                    پیشرفت
                  </th>

                  <th>
                    مدیر پروژه
                  </th>

                  <th>
                    نقش من
                  </th>

                  <th>
                    تاریخ شروع
                  </th>
                </tr>
              </thead>


              <tbody>

                {filteredProjects.map(
                  (project) => {

                    const managers =
                      getProjectManagers(
                        project
                      );

                    const membership =
                      getProjectMembership(
                        project,
                        currentUser?.id
                      );

                    const organizationRole =
                      getProjectOrganizationRole(
                        project,
                        currentUser,
                        organizations
                      );

                    const normalizedRole =
                      membership
                        ? normalizeProjectRole(
                            membership.role
                          )
                        : null;

                    const accessLabel =
                      membership
                        ? getProjectRoleLabel(
                            membership.role
                          )
                        : organizationRole ===
                          "OWNER"
                          ? "مالک سازمان"
                          : organizationRole ===
                            "ADMIN"
                            ? "مدیر سازمان"
                            : "عضو";


                    return (
                      <tr
                        key={
                          project.id
                        }
                      >

                        <td>

                          <Link
                            to={`/projects/${project.id}`}
                            className="project-title-link"
                            title="مشاهده و مدیریت پروژه"
                          >
                            {
                              project.title
                            }
                          </Link>

                        </td>


                        <td>
                          <span className="project-organization-name">
                            {
                              project.organizationName ||
                              "سازمان"
                            }
                          </span>
                        </td>


                        <td>

                          <span
                            className={`project-status status-${project.status}`}
                          >
                            {STATUS_OPTIONS[
                              project.status
                            ] ||
                              "در حال انجام"}
                          </span>

                        </td>


                        <td>

                          <div className="progress-cell">

                            <span className="progress-number">
                              {
                                project.progress
                              }
                              %
                            </span>

                            <div className="progress-track">

                              <div
                                className="progress-fill"
                                style={{
                                  width:
                                    `${project.progress}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>


                        <td>
                          {managers.length >
                          0
                            ? managers
                                .map(
                                  (manager) =>
                                    manager.fullName
                                )
                                .join("، ")
                            : "تعیین نشده"}
                        </td>


                        <td>

                          <span
                            className={
                              normalizedRole ===
                              PROJECT_ROLES.MANAGER
                                ? "project-user-role role-manager"
                                : normalizedRole ===
                                  PROJECT_ROLES.TEAM_LEAD
                                  ? "project-user-role role-lead"
                                  : "project-user-role role-member"
                            }
                          >
                            {
                              accessLabel
                            }
                          </span>

                        </td>


                        <td>
                          {project.startDate ||
                            "-"}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </section>
  );
}


export default Projects;
