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
  getOrganizationMembers,
} from "../../services/organizationService";

import {
  addProjectMember,
  deleteProject,
  getOrganizationProjects,
  getProjectMembers,
  normalizeProject,
  normalizeProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
} from "../../services/projectService";

import {
  ORGANIZATION_ROLES,
  PROJECT_ROLES,
  PROJECT_ROLE_LABELS,
} from "../../constants/roles";

import "./ProjectDetails.css";


const STATUS_LABELS = {
  planning:
    "در برنامه‌ریزی",

  "in-progress":
    "در حال انجام",

  delayed:
    "با تأخیر",

  review:
    "در انتظار تأیید",

  completed:
    "تکمیل شده",
};


function getOrganizationRole(
  organization,
  members,
  user
) {
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


  return (
    members.find(
      (member) =>
        Number(
          member.user_id
        ) ===
        Number(
          user.id
        )
    )?.role ||
    null
  );
}


function getOrganizationMemberUser(
  member,
  currentUser
) {
  if (!member) {
    return null;
  }


  if (
    Number(
      member.user_id
    ) ===
    Number(
      currentUser?.id
    )
  ) {
    return currentUser;
  }


  return {
    full_name:
      member.full_name ||
      member.user?.full_name ||
      member.username ||
      member.user?.username ||
      `کاربر #${member.user_id}`,

    username:
      member.username ||
      member.user?.username ||
      "",
  };
}


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
    organization,
    setOrganization,
  ] = useState(null);


  const [
    organizationMembers,
    setOrganizationMembers,
  ] = useState([]);


  const [
    organizationRole,
    setOrganizationRole,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    actionMessage,
    setActionMessage,
  ] = useState("");


  const [
    memberSearch,
    setMemberSearch,
  ] = useState("");


  const loadPage =
    async (
      showMainLoading = true
    ) => {
      if (
        showMainLoading
      ) {
        setLoading(true);
      }

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


        const safeOrganizations =
          Array.isArray(
            organizationList
          )
            ? organizationList
            : [];


        let foundProject =
          null;

        let foundOrganization =
          null;


        for (
          const currentOrganization
          of safeOrganizations
        ) {
          try {
            const projects =
              await getOrganizationProjects(
                currentOrganization.id
              );


            const matchedProject =
              (
                Array.isArray(
                  projects
                )
                  ? projects
                  : []
              ).find(
                (
                  item
                ) =>
                  String(
                    item.id
                  ) ===
                  String(
                    id
                  )
              );


            if (
              matchedProject
            ) {
              foundProject =
                matchedProject;

              foundOrganization =
                currentOrganization;

              break;
            }
          } catch (
            organizationProjectError
          ) {
            console.error(
              `Load organization ${currentOrganization.id} projects error:`,
              organizationProjectError
            );
          }
        }


        if (
          !foundProject ||
          !foundOrganization
        ) {
          setProject(
            null
          );

          setError(
            "پروژه موردنظر پیدا نشد یا شما به آن دسترسی ندارید."
          );

          return;
        }


        const [
          rawOrganizationMembers,
          rawProjectMembers,
        ] =
          await Promise.all([
            getOrganizationMembers(
              foundOrganization.id
            )
              .catch(
                () => []
              ),

            getProjectMembers(
              foundOrganization.id,
              foundProject.id
            )
              .catch(
                () => []
              ),
          ]);


        const safeOrganizationMembers =
          Array.isArray(
            rawOrganizationMembers
          )
            ? rawOrganizationMembers
            : [];


        const safeProjectMembers =
          Array.isArray(
            rawProjectMembers
          )
            ? rawProjectMembers
            : [];


        const normalizedMembers =
          safeProjectMembers.map(
            (
              member
            ) => {
              const organizationMember =
                safeOrganizationMembers.find(
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
                getOrganizationMemberUser(
                  organizationMember,
                  user
                )
              );
            }
          );


        const normalizedProject =
          normalizeProject(
            foundProject,
            {
              organizationName:
                foundOrganization.name,

              members:
                normalizedMembers,
            }
          );


        setCurrentUser(
          user
        );

        setOrganization(
          foundOrganization
        );

        setOrganizationMembers(
          safeOrganizationMembers
        );

        setOrganizationRole(
          getOrganizationRole(
            foundOrganization,
            safeOrganizationMembers,
            user
          )
        );

        setProject(
          normalizedProject
        );
      } catch (
        requestError
      ) {
        console.error(
          "Load project details error:",
          requestError
        );

        setError(
          "دریافت اطلاعات پروژه با خطا مواجه شد."
        );
      } finally {
        if (
          showMainLoading
        ) {
          setLoading(false);
        }
      }
    };


  useEffect(() => {
    loadPage();
  }, [id]);


  const canManage =
    organizationRole ===
      ORGANIZATION_ROLES.OWNER ||
    organizationRole ===
      ORGANIZATION_ROLES.ADMIN;


  const currentMembership =
    useMemo(
      () => {
        if (
          !project ||
          !currentUser
        ) {
          return null;
        }


        return (
          project.members.find(
            (
              member
            ) =>
              Number(
                member.userId
              ) ===
              Number(
                currentUser.id
              )
          ) ||
          null
        );
      },
      [
        project,
        currentUser,
      ]
    );


  const managers =
    useMemo(
      () =>
        project?.members?.filter(
          (
            member
          ) =>
            member.role ===
            PROJECT_ROLES.MANAGER
        ) ||
        [],
      [
        project,
      ]
    );


  const availableMembers =
    useMemo(
      () => {
        if (
          !project
        ) {
          return [];
        }


        const selectedIds =
          new Set(
            project.members.map(
              (
                member
              ) =>
                Number(
                  member.userId
                )
            )
          );


        const search =
          memberSearch
            .trim()
            .toLowerCase();


        return organizationMembers.filter(
          (
            member
          ) => {
            if (
              selectedIds.has(
                Number(
                  member.user_id
                )
              )
            ) {
              return false;
            }


            const userData =
              getOrganizationMemberUser(
                member,
                currentUser
              );


            if (
              !search
            ) {
              return true;
            }


            return (
              userData?.full_name
                ?.toLowerCase()
                .includes(
                  search
                ) ||
              userData?.username
                ?.toLowerCase()
                .includes(
                  search
                ) ||
              String(
                member.user_id
              ).includes(
                search
              )
            );
          }
        );
      },
      [
        project,
        organizationMembers,
        currentUser,
        memberSearch,
      ]
    );


  const handleAddMember =
    async (
      member
    ) => {
      if (
        !project ||
        !organization ||
        !canManage ||
        actionLoading
      ) {
        return;
      }


      setActionLoading(
        true
      );

      setActionMessage(
        ""
      );


      try {
        await addProjectMember(
          organization.id,
          project.id,
          member.user_id,
          PROJECT_ROLES.PR_MEMBER
        );


        setMemberSearch(
          ""
        );

        setActionMessage(
          "عضو با موفقیت به پروژه اضافه شد."
        );


        await loadPage(
          false
        );
      } catch (
        requestError
      ) {
        console.error(
          "Add project member error:",
          requestError
        );


        setActionMessage(
          requestError
            ?.response
            ?.data
            ?.detail ||
          "افزودن عضو به پروژه با خطا مواجه شد."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };


  const handleChangeMemberRole =
    async (
      userId,
      role
    ) => {
      if (
        !project ||
        !organization ||
        !canManage ||
        actionLoading
      ) {
        return;
      }


      setActionLoading(
        true
      );

      setActionMessage(
        ""
      );


      try {
        await updateProjectMemberRole(
          organization.id,
          project.id,
          userId,
          role
        );


        setActionMessage(
          "نقش عضو با موفقیت تغییر کرد."
        );


        await loadPage(
          false
        );
      } catch (
        requestError
      ) {
        console.error(
          "Update project member role error:",
          requestError
        );


        const detail =
          requestError
            ?.response
            ?.data
            ?.detail;


        if (
          requestError
            ?.response
            ?.status ===
          409
        ) {
          setActionMessage(
            detail ||
            "این نقش قبلاً به عضو دیگری اختصاص داده شده است."
          );
        } else {
          setActionMessage(
            detail ||
            "تغییر نقش عضو با خطا مواجه شد."
          );
        }
      } finally {
        setActionLoading(
          false
        );
      }
    };


  const handleRemoveMember =
    async (
      userId
    ) => {
      if (
        !project ||
        !organization ||
        !canManage ||
        actionLoading
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          "این عضو از پروژه حذف شود؟"
        );


      if (
        !confirmed
      ) {
        return;
      }


      setActionLoading(
        true
      );

      setActionMessage(
        ""
      );


      try {
        await removeProjectMember(
          organization.id,
          project.id,
          userId
        );


        setActionMessage(
          "عضو از پروژه حذف شد."
        );


        await loadPage(
          false
        );
      } catch (
        requestError
      ) {
        console.error(
          "Remove project member error:",
          requestError
        );


        setActionMessage(
          requestError
            ?.response
            ?.data
            ?.detail ||
          "حذف عضو از پروژه با خطا مواجه شد."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };


  const handleDeleteProject =
    async () => {
      if (
        !project ||
        !organization ||
        !canManage ||
        actionLoading
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          `پروژه «${project.title}» حذف شود؟ این عملیات قابل بازگشت نیست.`
        );


      if (
        !confirmed
      ) {
        return;
      }


      setActionLoading(
        true
      );

      setActionMessage(
        ""
      );


      try {
        await deleteProject(
          organization.id,
          project.id
        );


        navigate(
          "/projects",
          {
            replace: true,
          }
        );
      } catch (
        requestError
      ) {
        console.error(
          "Delete project error:",
          requestError
        );


        setActionMessage(
          requestError
            ?.response
            ?.data
            ?.detail ||
          "حذف پروژه با خطا مواجه شد."
        );

        setActionLoading(
          false
        );
      }
    };


  if (
    loading
  ) {
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
          currentMembership.role
        ] ||
        "عضو پروژه"
      : organizationRole ===
        ORGANIZATION_ROLES.OWNER
        ? "مالک سازمان"
        : organizationRole ===
          ORGANIZATION_ROLES.ADMIN
          ? "مدیر سازمان"
          : "عضو سازمان";


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
                {
                  project.title
                }
              </h2>

              <div className="project-details-meta">

                <span
                  className={`project-details-status status-${project.status}`}
                >
                  {
                    STATUS_LABELS[
                      project.status
                    ] ||
                    project.backendStatus ||
                    "نامشخص"
                  }
                </span>


                <span className="project-details-role">
                  {
                    currentRoleLabel
                  }
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


          {canManage && (
            <button
              type="button"
              className="project-details-delete-button"
              onClick={
                handleDeleteProject
              }
              disabled={
                actionLoading
              }
            >
              <Trash2
                size={17}
              />

              حذف پروژه
            </button>
          )}

        </div>

      </div>


      {actionMessage && (
        <div className="project-details-action-message">
          {
            actionMessage
          }
        </div>
      )}


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
              {
                project.organizationName ||
                organization?.name ||
                "-"
              }
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
              {
                project.startDate ||
                "-"
              }
              {" "}
              تا
              {" "}
              {
                project.endDate ||
                "-"
              }
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
            {
              project.description ||
              "توضیحی برای این پروژه ثبت نشده است."
            }
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
                {
                  project.progress
                }
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
            {
              project.members.length
            }
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
              (
                member
              ) => (
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
                        {
                          member.fullName
                        }
                      </strong>

                      <span>
                        {member.username
                          ? `@${member.username}`
                          : `شناسه کاربر: ${member.userId}`}
                      </span>

                    </div>

                  </div>


                  {canManage ? (
                    <div className="project-member-actions">

                      <select
                        value={
                          member.role
                        }
                        disabled={
                          actionLoading
                        }
                        onChange={(
                          event
                        ) =>
                          handleChangeMemberRole(
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
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          handleRemoveMember(
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
                      className={`project-member-role role-${member.role.toLowerCase()}`}
                    >
                      {
                        PROJECT_ROLE_LABELS[
                          member.role
                        ] ||
                        "عضو پروژه"
                      }
                    </span>
                  )}

                </article>
              )
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
                    event.target
                      .value
                  )
                }
                placeholder="جستجو با نام، نام کاربری یا شناسه..."
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
                  (
                    member
                  ) => {
                    const userData =
                      getOrganizationMemberUser(
                        member,
                        currentUser
                      );


                    return (
                      <div
                        className="project-available-member"
                        key={
                          member.user_id
                        }
                      >

                        <div>

                          <strong>
                            {
                              userData?.full_name ||
                              `کاربر #${member.user_id}`
                            }
                          </strong>

                          <span>
                            {userData?.username
                              ? `@${userData.username}`
                              : `شناسه کاربر: ${member.user_id}`}
                          </span>

                        </div>


                        <button
                          type="button"
                          disabled={
                            actionLoading
                          }
                          onClick={() =>
                            handleAddMember(
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
                    );
                  }
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
