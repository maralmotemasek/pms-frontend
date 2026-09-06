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
  RefreshCw,
  Search,
} from "lucide-react";

import {
  getCurrentUser,
} from "../../services/authService";

import {
  getMyOrganizations,
  getOrganizationMembers,
} from "../../services/organizationService";

import {
  fromBackendProjectRole,
  getMyProjects,
  getOrganizationProjects,
  getProjectMembers,
  normalizeProject,
  normalizeProjectMember,
} from "../../services/projectService";

import {
  ORGANIZATION_ROLES,
  PROJECT_ROLES,
  PROJECT_ROLE_LABELS,
} from "../../constants/roles";

import "./Projects.css";


const STATUS_OPTIONS = {
  all: "همه وضعیت‌ها",
  planning: "در برنامه‌ریزی",
  "in-progress": "در حال انجام",
  delayed: "با تأخیر",
  review: "در انتظار تأیید",
  completed: "تکمیل شده",
};


const formatPersianDate = (value) => {
  if (!value) {
    return "-";
  }

  const parts =
    String(value)
      .trim()
      .split("-")
      .map(Number);

  if (
    parts.length !== 3 ||
    parts.some(
      (part) =>
        Number.isNaN(part)
    )
  ) {
    return String(value);
  }

  const [
    year,
    month,
    day,
  ] = parts;

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "fa-IR-u-ca-persian",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(date);
};


const getOrganizationRole = (
  organization,
  members,
  user
) => {
  if (
    !organization ||
    !user
  ) {
    return null;
  }

  if (
    Number(
      organization.owner_id
    ) ===
    Number(
      user.id
    )
  ) {
    return ORGANIZATION_ROLES.OWNER;
  }

  const membership =
    members.find(
      (member) =>
        Number(
          member.user_id
        ) ===
        Number(
          user.id
        )
    );

  return (
    membership?.role ||
    null
  );
};


const getMemberUserData = (
  organizationMember
) => {
  if (!organizationMember) {
    return null;
  }

  return {
    full_name:
      organizationMember.full_name ||
      organizationMember.user?.full_name ||
      organizationMember.username ||
      organizationMember.user?.username ||
      "",

    username:
      organizationMember.username ||
      organizationMember.user?.username ||
      "",
  };
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
    organizationRoles,
    setOrganizationRoles,
  ] = useState({});

  const [
    projects,
    setProjects,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

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


  const loadPage =
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          user,
          organizationList,
          myProjects,
        ] =
          await Promise.all([
            getCurrentUser(),
            getMyOrganizations(),
            getMyProjects()
              .catch(() => []),
          ]);

        const safeOrganizations =
          Array.isArray(
            organizationList
          )
            ? organizationList
            : [];

        const safeMyProjects =
          Array.isArray(
            myProjects
          )
            ? myProjects
            : [];

        setCurrentUser(user);

        setOrganizations(
          safeOrganizations
        );


        const myProjectRoles =
          new Map(
            safeMyProjects.map(
              (project) => [
                String(
                  project.id
                ),

                fromBackendProjectRole(
                  project.role
                ),
              ]
            )
          );


        const organizationResults =
          await Promise.all(
            safeOrganizations.map(
              async (
                organization
              ) => {

                let organizationMembers =
                  [];

                let organizationProjects =
                  [];

                try {
                  organizationMembers =
                    await getOrganizationMembers(
                      organization.id
                    );
                } catch (
                  membersError
                ) {
                  console.error(
                    `Load organization ${organization.id} members error:`,
                    membersError
                  );
                }


                try {
                  organizationProjects =
                    await getOrganizationProjects(
                      organization.id
                    );
                } catch (
                  projectsError
                ) {
                  console.error(
                    `Load organization ${organization.id} projects error:`,
                    projectsError
                  );
                }


                const role =
                  getOrganizationRole(
                    organization,
                    organizationMembers,
                    user
                  );


                const normalizedProjects =
                  await Promise.all(
                    (
                      Array.isArray(
                        organizationProjects
                      )
                        ? organizationProjects
                        : []
                    ).map(
                      async (
                        rawProject
                      ) => {

                        let rawProjectMembers =
                          [];

                        try {
                          rawProjectMembers =
                            await getProjectMembers(
                              organization.id,
                              rawProject.id
                            );
                        } catch (
                          projectMembersError
                        ) {
                          console.error(
                            `Load project ${rawProject.id} members error:`,
                            projectMembersError
                          );
                        }


                        const normalizedMembers =
                          (
                            Array.isArray(
                              rawProjectMembers
                            )
                              ? rawProjectMembers
                              : []
                          ).map(
                            (
                              member
                            ) => {

                              const organizationMember =
                                organizationMembers.find(
                                  (
                                    item
                                  ) =>
                                    Number(
                                      item.user_id
                                    ) ===
                                    Number(
                                      member.user_id
                                    )
                                );


                              return normalizeProjectMember(
                                member,
                                getMemberUserData(
                                  organizationMember
                                )
                              );
                            }
                          );


                        return normalizeProject(
                          rawProject,
                          {
                            organizationName:
                              organization.name,

                            members:
                              normalizedMembers,

                            currentProjectRole:
                              myProjectRoles.get(
                                String(
                                  rawProject.id
                                )
                              ) ||
                              null,
                          }
                        );
                      }
                    )
                  );


                return {
                  organizationId:
                    organization.id,

                  role,

                  projects:
                    normalizedProjects,
                };
              }
            )
          );


        const nextOrganizationRoles =
          {};

        const allProjects =
          [];

        organizationResults.forEach(
          (
            result
          ) => {
            nextOrganizationRoles[
              String(
                result.organizationId
              )
            ] =
              result.role;

            const visibleProjects =
              result.role ===
                ORGANIZATION_ROLES.OWNER ||
              result.role ===
                ORGANIZATION_ROLES.ADMIN
                ? result.projects
                : result.projects.filter(
                    (project) =>
                      Boolean(
                        project.currentProjectRole
                      )
                  );


            allProjects.push(
              ...visibleProjects
            );
          }
        );


        setOrganizationRoles(
          nextOrganizationRoles
        );

        setProjects(
          allProjects
        );
      } catch (requestError) {
        console.error(
          "Load projects page error:",
          requestError
        );

        setError(
          "دریافت پروژه‌ها با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadPage();
  }, []);


  const filteredProjects =
    useMemo(
      () => {
        const search =
          searchValue
            .trim()
            .toLowerCase();

        return projects.filter(
          (
            project
          ) => {

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
                .includes(
                  search
                ) ||
              project.organizationName
                ?.toLowerCase()
                .includes(
                  search
                )
            );
          }
        );
      },
      [
        projects,
        statusFilter,
        organizationFilter,
        searchValue,
      ]
    );


  const canCreate =
    useMemo(
      () =>
        Object.values(
          organizationRoles
        ).some(
          (
            role
          ) =>
            role ===
              ORGANIZATION_ROLES.OWNER ||
            role ===
              ORGANIZATION_ROLES.ADMIN
        ),
      [
        organizationRoles,
      ]
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
            <Plus
              size={18}
            />

            ایجاد پروژه
          </Link>
        )}

      </div>


      <div className="projects-toolbar">

        <div className="projects-search">

          <Search
            size={17}
          />

          <input
            type="text"
            value={
              searchValue
            }
            onChange={(
              event
            ) =>
              setSearchValue(
                event.target.value
              )
            }
            placeholder="جستجو در پروژه‌ها..."
          />

        </div>


        <div className="projects-filter-section">

          <div className="status-filter">

            <Filter
              size={16}
            />

            <select
              value={
                organizationFilter
              }
              onChange={(
                event
              ) =>
                setOrganizationFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                همه سازمان‌ها
              </option>

              {organizations.map(
                (
                  organization
                ) => (
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

            <Filter
              size={16}
            />

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
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
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {label}
                  </option>
                )
              )}

            </select>

          </div>


          <button
            type="button"
            className="organization-refresh-button"
            onClick={
              loadPage
            }
            disabled={
              loading
            }
            title="بارگذاری مجدد پروژه‌ها"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "organization-spinner"
                  : ""
              }
            />
          </button>

        </div>

      </div>


      <div className="projects-table-card">

        <div className="projects-table-header">

          <div>
            <strong>
              پروژه‌های من
            </strong>

            <span>
              {
                filteredProjects.length
              }
              {" "}
              پروژه
            </span>
          </div>

        </div>


        {loading ? (
          <div className="projects-empty">

            <RefreshCw
              size={24}
              className="organization-spinner"
            />

            در حال دریافت پروژه‌ها...

          </div>
        ) : error ? (
          <div className="projects-empty">

            <strong>
              {error}
            </strong>

            <button
              type="button"
              onClick={
                loadPage
              }
            >
              تلاش مجدد
            </button>

          </div>
        ) : filteredProjects.length ===
          0 ? (
          <div className="projects-empty">

            <Building2
              size={39}
            />

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
                  (
                    project
                  ) => {

                    const managers =
                      project.members.filter(
                        (
                          member
                        ) =>
                          member.role ===
                          PROJECT_ROLES.MANAGER
                      );


                    const organizationRole =
                      organizationRoles[
                        String(
                          project.organizationId
                        )
                      ];


                    let accessLabel =
                      "عضو سازمان";


                    if (
                      organizationRole ===
                      ORGANIZATION_ROLES.OWNER
                    ) {
                      accessLabel =
                        "مالک سازمان";
                    } else if (
                      organizationRole ===
                      ORGANIZATION_ROLES.ADMIN
                    ) {
                      accessLabel =
                        "مدیر سازمان";
                    } else if (
                      project.currentProjectRole
                    ) {
                      accessLabel =
                        PROJECT_ROLE_LABELS[
                          project.currentProjectRole
                        ] ||
                        "عضو پروژه";
                    }

                    const normalizedRole =
                      project.currentProjectRole;


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
                            {
                              STATUS_OPTIONS[
                                project.status
                              ] ||
                              project.backendStatus ||
                              "نامشخص"
                            }
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
                                  (
                                    manager
                                  ) =>
                                    manager.fullName
                                )
                                .join(
                                  "، "
                                )
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
                          {formatPersianDate(
                            project.startDate
                          )}
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
