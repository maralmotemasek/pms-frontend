import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Pencil,
  UserRound,
  Users,
} from "lucide-react";

import {
  currentUser,
  mockProjects,
} from "../../data/projectMockData";

import {
  canEditProject,
  canViewProject,
  getProjectManager,
  getProjectMembership,
  getProjectRoleLabel,
} from "../../utils/projectPermissions";

import "./ProjectDetails.css";


function ProjectDetails() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();


  const project =
    mockProjects.find(
      (item) =>
        String(item.id) ===
        String(id)
    );


  if (
    !project ||
    !canViewProject(
      currentUser,
      project
    )
  ) {
    return (
      <section className="project-details-page">

        <div className="project-not-found">

          <h2>
            پروژه در دسترس نیست
          </h2>

          <p>
            این پروژه وجود ندارد یا شما عضو آن نیستید.
          </p>

          <button
            onClick={() =>
              navigate("/projects")
            }
          >
            بازگشت به پروژه‌ها
          </button>

        </div>

      </section>
    );
  }


  const membership =
    getProjectMembership(
      project,
      currentUser.id
    );


  const manager =
    getProjectManager(
      project
    );


  const canEdit =
    canEditProject(
      currentUser,
      project
    );


  return (
    <section className="project-details-page">

      <div className="project-details-header">

        <div>

          <button
            type="button"
            className="project-details-back"
            onClick={() =>
              navigate("/projects")
            }
          >
            <ArrowRight size={17} />

            بازگشت به پروژه‌ها
          </button>


          <h2>
            {project.title}
          </h2>


          <div className="project-details-header-meta">

            <span
              className={`project-details-status status-${project.status}`}
            >
              {project.statusLabel}
            </span>


            <span
              className={
                membership?.role ===
                "PROJECT_MANAGER"
                  ? "details-role-badge manager-role"
                  : "details-role-badge member-role"
              }
            >
              {getProjectRoleLabel(
                membership?.role
              )}
            </span>

          </div>

        </div>


        {canEdit && (

          <Link
            to={`/projects/${project.id}/edit`}
            className="project-details-edit-button"
          >
            <Pencil size={17} />

            ویرایش پروژه
          </Link>

        )}

      </div>


      <div className="project-summary-grid">

        <div className="project-summary-card">

          <div className="summary-icon">
            <UserRound size={20} />
          </div>

          <div>
            <span>
              مدیر پروژه
            </span>

            <strong>
              {manager?.fullName ||
                "تعیین نشده"}
            </strong>
          </div>

        </div>


        <div className="project-summary-card">

          <div className="summary-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <span>
              تاریخ شروع
            </span>

            <strong>
              {project.startDate}
            </strong>
          </div>

        </div>


        <div className="project-summary-card">

          <div className="summary-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <span>
              تاریخ پایان
            </span>

            <strong>
              {project.endDate}
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
                project.budget
              ).toLocaleString(
                "fa-IR"
              )}{" "}
              تومان
            </strong>
          </div>

        </div>

      </div>


      <div className="project-details-main-grid">

        <div className="project-details-card">

          <div className="details-card-title">

            <div>
              <FileText size={19} />

              <h3>
                درباره پروژه
              </h3>
            </div>

          </div>


          <p className="project-description">
            {project.description}
          </p>

        </div>


        <div className="project-details-card">

          <div className="details-card-title">

            <div>
              <ClipboardList
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
                {project.progress}%
              </strong>

            </div>


            <div className="details-progress-track">

              <div
                className={`details-progress-fill progress-${project.status}`}
                style={{
                  width:
                    `${project.progress}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>


      {/* MEMBERS */}

      <div className="project-details-card">

        <div className="details-card-title">

          <div>
            <Users size={19} />

            <h3>
              اعضای پروژه
            </h3>
          </div>

          <span className="details-count">
            {
              project.members
                .length
            }{" "}
            نفر
          </span>

        </div>


        <div className="project-members-list">

          {project.members.map(
            (member) => (

              <div
                className="project-member-item"
                key={member.userId}
              >

                <div className="project-member-avatar">

                  <UserRound
                    size={18}
                  />

                </div>


                <div className="project-member-info">

                  <strong>
                    {
                      member.fullName
                    }
                  </strong>

                  <span>
                    {getProjectRoleLabel(
                      member.role
                    )}
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      </div>


      {/* TASKS */}

      <div className="project-details-card">

        <div className="details-card-title">

          <div>
            <ClipboardList
              size={19}
            />

            <h3>
              تسک‌های پروژه
            </h3>
          </div>


          <Link
            to="/tasks"
            className="details-view-all"
          >
            مشاهده همه تسک‌ها
          </Link>

        </div>


        <div className="project-tasks-list">

          {project.tasks.map(
            (task) => (

              <div
                className="project-task-item"
                key={task.id}
              >

                <div>

                  <span className="task-point" />

                  <strong>
                    {task.title}
                  </strong>

                </div>


                <span className="task-status-text">
                  {task.status}
                </span>

              </div>

            )
          )}

        </div>

      </div>


      {/* DOCUMENTS */}

      <div className="project-details-card">

        <div className="details-card-title">

          <div>
            <FileText size={19} />

            <h3>
              مستندات پروژه
            </h3>
          </div>

        </div>


        {project.documents
          .length > 0 ? (

          <div className="project-documents-list">

            {project.documents.map(
              (document) => (

                <div
                  className="project-document-item"
                  key={
                    document.id
                  }
                >

                  <div className="project-document-icon">

                    <FileText
                      size={18}
                    />

                  </div>

                  <span>
                    {
                      document.name
                    }
                  </span>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="details-empty-state">
            مستندی برای این پروژه ثبت نشده است.
          </div>

        )}

      </div>

    </section>
  );
}


export default ProjectDetails;