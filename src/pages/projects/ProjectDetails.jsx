import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Gauge,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";

import {
  getCurrentUser,
} from "../../services/authService";

import {
  getMyOrganizations,
} from "../../services/organizationService";

import {
  loadOrganizationMembers,
} from "../../data/organizationUiMockData";

import {
  getProjectMembership,
  getProjectManagers,
  getWorkspaceProjectById,
  normalizeProjectRole,
  updateWorkspaceProject,
} from "../../data/projectWorkspaceStore";

import {
  PROJECT_ROLES,
  PROJECT_ROLE_LABELS,
} from "../../constants/roles";

import {
  canManageWorkspaceProject,
  canViewWorkspaceProject,
  getProjectOrganization,
  getProjectOrganizationRole,
} from "../../utils/projectAccess";

import "./ProjectDetails.css";


const STATUS_LABELS = {
  "in-progress":
    "در حال انجام",

  delayed:
    "با تأخیر",

  review:
    "در انتظار تأیید",

  completed:
    "تکمیل شده",
};


function ProjectDetails() {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();


  const [
    project,
    setProject,
  ] = useState(null);


  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);


  const [
    organizations,
    setOrganizations,
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
    memberSearch,
    setMemberSearch,
  ] = useState("");


  useEffect(() => {
    const loadPage =
      async () => {

        setLoading(true);
        setError("");


        try {
          const [
            user,
            organizationList,
          ] =
            await Promise.all([
              getCurrentUser(),
              getMyOrganizations(),
            ]);


          const loadedProject =
            getWorkspaceProjectById(
              id
            );


          if (!loadedProject) {
            setError(
              "پروژه موردنظر پیدا نشد."
            );

            return;
          }


          const safeOrganizations =
            Array.isArray(
              organizationList
            )
              ? organizationList
              : [];


          if (
            !canViewWorkspaceProject(
              user,
              loadedProject,
              safeOrganizations
            )
          ) {
            setError(
              "شما به این پروژه دسترسی ندارید."
            );

            return;
          }


          setCurrentUser(
            user
          );

          setOrganizations(
            safeOrganizations
          );

          setProject(
            loadedProject
          );
        } catch (requestError) {
          console.error(
            "Load project details error:",
            requestError
          );

          setError(
            "دریافت اطلاعات پروژه با خطا مواجه شد."
          );
        } finally {
          setLoading(false);
        }
      };


    loadPage();
  }, [id]);


  const organization =
    useMemo(
      () =>
        getProjectOrganization(
          project,
          organizations
        ),
      [
        project,
        organizations,
      ]
    );


  const organizationMembers =
    useMemo(
      () => {

        if (
          !organization ||
          !currentUser
        ) {
          return [];
        }


        return loadOrganizationMembers(
          organization,
          currentUser
        );
      },
      [
        organization,
        currentUser,
      ]
    );


  const canManage =
    project &&
    currentUser
      ? canManageWorkspaceProject(
          currentUser,
          project,
          organizations
        )
      : false;


  const currentMembership =
    project &&
    currentUser
      ? getProjectMembership(
          project,
          currentUser.id
        )
      : null;


  const organizationRole =
    project &&
    currentUser
      ? getProjectOrganizationRole(
          project,
          currentUser,
          organizations
        )
      : null;


  const managers =
    project
      ? getProjectManagers(
          project
        )
      : [];


  const availableMembers =
    useMemo(
      () => {

        if (!project) {
          return [];
        }


        const selectedIds =
          new Set(
            project.members.map(
              (member) =>
                Number(
                  member.userId
                )
            )
          );


        const query =
          memberSearch
            .trim()
            .toLowerCase();


        return organizationMembers.filter(
          (member) => {

            if (
              selectedIds.has(
                Number(
                  member.user_id
                )
              )
            ) {
              return false;
            }


            if (!query) {
              return true;
            }


            return (
              member.username
                ?.toLowerCase()
                .includes(query) ||
              member.full_name
                ?.toLowerCase()
                .includes(query)
            );
          }
        );
      },
      [
        organizationMembers,
        project,
        memberSearch,
      ]
    );


  const saveMembers =
    (
      nextMembers
    ) => {

      if (
        !canManage ||
        !project
      ) {
        return;
      }


      const updated =
        updateWorkspaceProject(
          project.id,
          {
            members:
              nextMembers,
          }
        );


      if (updated) {
        setProject(
          updated
        );
      }
    };


  const addProjectMember =
    (member) => {

      if (
        !project ||
        !canManage
      ) {
        return;
      }


      saveMembers([
        ...project.members,

        {
          userId:
            member.user_id,

          fullName:
            member.full_name ||
            member.username,

          username:
            member.username ||
            "",

          role:
            PROJECT_ROLES.PR_MEMBER,
        },
      ]);


      setMemberSearch("");
    };


  const changeMemberRole =
    (
      userId,
      role
    ) => {

      if (
        !project ||
        !canManage
      ) {
        return;
      }


      const nextMembers =
        project.members.map(
          (member) =>
            Number(
              member.userId
            ) ===
            Number(userId)
              ? {
                  ...member,
                  role,
                }
              : member
        );


      saveMembers(
        nextMembers
      );
    };


  const removeProjectMember =
    (userId) => {

      if (
        !project ||
        !canManage
      ) {
        return;
      }


      const nextMembers =
        project.members.filter(
          (member) =>
            Number(
              member.userId
            ) !==
            Number(userId)
        );


      saveMembers(
        nextMembers
      );
    };


  if (loading) {
    return (
      <section className="project-details-page">

        <div className="project-details-state">
          در حال دریافت اطلاعات پروژه...
        </div>

      </section>
    );
  }


  if (
    error ||
    !project
  ) {
    return (
      <section className="project-details-page">

        <div className="project-details-state">

          <h2>
            پروژه در دسترس نیست
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/projects"
              )
            }
          >
            بازگشت به پروژه‌ها
          </button>

        </div>

      </section>
    );
  }


  const currentRoleLabel =
    currentMembership
      ? PROJECT_ROLE_LABELS[
          normalizeProjectRole(
            currentMembership.role
          )
        ]
      : organizationRole ===
        "OWNER"
        ? "مالک سازمان"
        : organizationRole ===
          "ADMIN"
          ? "مدیر سازمان"
          : "عضو پروژه";


  return (
    <section className="project-details-page">

      <div className="project-details-header">

        <div>

          <button
            type="button"
            className="project-details-back"
            onClick={() =>
              navigate(
                "/projects"
              )
            }
          >
            <ArrowRight
              size={17}
            />

            بازگشت به پروژه‌ها
          </button>


          <div className="project-details-title-row">

            <div>
              <h2>
                {project.title}
              </h2>

              <div className="project-details-meta">

                <span
                  className={`project-details-status status-${project.status}`}
                >
                  {STATUS_LABELS[
                    project.status
                  ] ||
                    "در حال انجام"}
                </span>


                <span className="project-details-role">
                  {currentRoleLabel}
                </span>

              </div>

            </div>

          </div>

        </div>


        <div className="project-details-header-actions">

          <Link
            to={`/projects/${project.id}/resources`}
            className="project-details-resources-button"
          >
            <Gauge
              size={17}
            />

            منابع پروژه
          </Link>


          {canManage && (
            <Link
              to={`/projects/${project.id}/edit`}
              className="project-details-edit-button"
            >
              <Pencil
                size={17}
              />

              ویرایش پروژه
            </Link>
          )}

        </div>

      </div>


      <div className="project-summary-grid">

        <div className="project-summary-card">

          <div className="summary-icon">
            <Building2
              size={20}
            />
          </div>

          <div>
            <span>
              سازمان
            </span>

            <strong>
              {project.organizationName ||
                organization?.name ||
                "-"}
            </strong>
          </div>

        </div>


        <div className="project-summary-card">

          <div className="summary-icon">
            <UserRound
              size={20}
            />
          </div>

          <div>
            <span>
              مدیر پروژه
            </span>

            <strong>
              {managers.length > 0
                ? managers
                    .map(
                      (manager) =>
                        manager.fullName
                    )
                    .join("، ")
                : "تعیین نشده"}
            </strong>
          </div>

        </div>


        <div className="project-summary-card">

          <div className="summary-icon">
            <CalendarDays
              size={20}
            />
          </div>

          <div>
            <span>
              بازه پروژه
            </span>

            <strong>
              {project.startDate ||
                "-"}
              {" "}
              تا
              {" "}
              {project.endDate ||
                "-"}
            </strong>
          </div>

        </div>


        <div className="project-summary-card">

          <div className="summary-icon">
            <CircleDollarSign
              size={20}
            />
          </div>

          <div>
            <span>
              بودجه پروژه
            </span>

            <strong>
              {Number(
                project.budget ||
                0
              ).toLocaleString(
                "fa-IR"
              )}
              {" "}
              تومان
            </strong>
          </div>

        </div>

      </div>


      <div className="project-details-main-grid">

        <div className="project-details-card">

          <div className="details-card-title">

            <div>
              <Building2
                size={19}
              />

              <h3>
                درباره پروژه
              </h3>
            </div>

          </div>


          <p className="project-description">
            {project.description ||
              "توضیحی برای این پروژه ثبت نشده است."}
          </p>

        </div>


        <div className="project-details-card">

          <div className="details-card-title">

            <div>
              <CalendarDays
                size={19}
              />

              <h3>
                پیشرفت پروژه
              </h3>
            </div>

          </div>


          <div className="details-progress">

            <div className="details-progress-label">

              <span>
                میزان پیشرفت
              </span>

              <strong>
                {project.progress}
                %
              </strong>

            </div>


            <div className="details-progress-track">

              <div
                className="details-progress-fill"
                style={{
                  width:
                    `${project.progress}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>


      <div className="project-details-card project-members-card">

        <div className="details-card-title">

          <div>
            <Users
              size={19}
            />

            <h3>
              اعضای پروژه
            </h3>
          </div>


          <span className="details-count">
            {project.members.length}
            {" "}
            عضو
          </span>

        </div>


        {project.members.length ===
        0 ? (
          <div className="details-empty-state">
            هنوز عضوی برای این پروژه تعیین نشده است.
          </div>
        ) : (
          <div className="project-members-grid">

            {project.members.map(
              (member) => {

                const role =
                  normalizeProjectRole(
                    member.role
                  );


                return (
                  <article
                    className="project-member-card"
                    key={
                      member.userId
                    }
                  >

                    <div className="project-member-main">

                      <div className="project-member-avatar">

                        <UserRound
                          size={19}
                        />

                      </div>


                      <div className="project-member-info">

                        <strong>
                          {member.fullName}
                        </strong>

                        <span>
                          {member.username
                            ? `@${member.username}`
                            : PROJECT_ROLE_LABELS[
                                role
                              ]}
                        </span>

                      </div>

                    </div>


                    {canManage ? (
                      <div className="project-member-actions">

                        <select
                          value={
                            role
                          }
                          onChange={(
                            event
                          ) =>
                            changeMemberRole(
                              member.userId,
                              event.target
                                .value
                            )
                          }
                        >

                          {Object.values(
                            PROJECT_ROLES
                          ).map(
                            (
                              projectRole
                            ) => (
                              <option
                                key={
                                  projectRole
                                }
                                value={
                                  projectRole
                                }
                              >
                                {
                                  PROJECT_ROLE_LABELS[
                                    projectRole
                                  ]
                                }
                              </option>
                            )
                          )}

                        </select>


                        <button
                          type="button"
                          className="project-member-remove"
                          onClick={() =>
                            removeProjectMember(
                              member.userId
                            )
                          }
                          aria-label="حذف عضو از پروژه"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>
                    ) : (
                      <span
                        className={`project-member-role role-${role.toLowerCase()}`}
                      >
                        {
                          PROJECT_ROLE_LABELS[
                            role
                          ]
                        }
                      </span>
                    )}

                  </article>
                );
              }
            )}

          </div>
        )}


        {canManage && (
          <div className="project-add-member-section">

            <div className="project-add-member-header">

              <div>

                <h4>
                  افزودن عضو سازمان به پروژه
                </h4>

                <p>
                  فقط مالک و مدیر سازمان می‌توانند اعضا و نقش‌های پروژه را مدیریت کنند.
                </p>

              </div>

              <UserPlus
                size={20}
              />

            </div>


            <div className="project-member-search">

              <Search
                size={17}
              />

              <input
                type="text"
                value={
                  memberSearch
                }
                onChange={(
                  event
                ) =>
                  setMemberSearch(
                    event.target.value
                  )
                }
                placeholder="جستجوی عضو سازمان..."
              />

            </div>


            <div className="project-available-members">

              {availableMembers.length ===
              0 ? (
                <div className="details-empty-state small">
                  عضو دیگری برای افزودن وجود ندارد.
                </div>
              ) : (
                availableMembers.map(
                  (member) => (
                    <div
                      className="project-available-member"
                      key={
                        member.user_id
                      }
                    >

                      <div>

                        <strong>
                          {member.full_name ||
                            member.username}
                        </strong>

                        <span>
                          @{member.username}
                        </span>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          addProjectMember(
                            member
                          )
                        }
                      >
                        <UserPlus
                          size={15}
                        />

                        افزودن
                      </button>

                    </div>
                  )
                )
              )}

            </div>

          </div>
        )}

      </div>

    </section>
  );
}


export default ProjectDetails;


