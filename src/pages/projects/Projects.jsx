import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Download,
  Filter,
  Pencil,
  Plus,
} from "lucide-react";

import {
  currentUser,
  mockProjects,
  PROJECT_ROLES,
} from "../../data/projectMockData";

import {
  canCreateProject,
  canEditProject,
  canViewProject,
  getProjectManager,
  getProjectMembership,
  getProjectRoleLabel,
} from "../../utils/projectPermissions";

import "./Projects.css";


function Projects() {
  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  /*
    فقط پروژه‌هایی که User
    در آنها ProjectMember است.
  */
  const userProjects =
    mockProjects.filter(
      (project) =>
        canViewProject(
          currentUser,
          project
        )
    );


  const filteredProjects =
    statusFilter === "all"
      ? userProjects
      : userProjects.filter(
          (project) =>
            project.status ===
            statusFilter
        );


  return (
    <section className="projects-page">

      {/* =====================
          TOOLBAR
      ====================== */}

      <div className="projects-toolbar">

        <div className="projects-filter-section">

          <div className="projects-list-info">

            <span className="projects-count-label">
              پروژه‌های من
            </span>

            <span className="projects-total-count">
              {userProjects.length} پروژه
            </span>

          </div>


          <div className="status-filter">

            <Filter size={17} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                همه وضعیت‌ها
              </option>

              <option value="in-progress">
                در حال انجام
              </option>

              <option value="delayed">
                به تعویق افتاده
              </option>

              <option value="review">
                در انتظار تایید
              </option>

              <option value="completed">
                تکمیل شده
              </option>
            </select>

          </div>

        </div>


        <div className="projects-actions">

          <button
            type="button"
            className="pdf-button"
          >
            <Download size={17} />

            <span>
              خروجی گزارش PDF
            </span>
          </button>


          {canCreateProject(
            currentUser
          ) && (

            <Link
              to="/projects/create"
              className="create-project-button"
            >
              <Plus size={19} />

              <span>
                ایجاد پروژه جدید
              </span>
            </Link>

          )}

        </div>

      </div>


      {/* =====================
          TABLE
      ====================== */}

      <div className="projects-table-card">

        <div className="projects-table-wrapper">

          <table className="projects-table">

            <thead>

              <tr>
                <th>
                  عنوان پروژه
                </th>

                <th>
                  وضعیت پروژه
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

                <th>
                  عملیات
                </th>
              </tr>

            </thead>


            <tbody>

              {filteredProjects.map(
                (project) => {

                  const manager =
                    getProjectManager(
                      project
                    );


                  const membership =
                    getProjectMembership(
                      project,
                      currentUser.id
                    );


                  const userCanEdit =
                    canEditProject(
                      currentUser,
                      project
                    );


                  return (
                    <tr
                      key={
                        project.id
                      }
                    >

                      {/* TITLE */}

                      <td>

                        <Link
                          to={`/projects/${project.id}`}
                          className="project-title-link"
                        >
                          {
                            project.title
                          }
                        </Link>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`project-status status-${project.status}`}
                        >
                          {
                            project.statusLabel
                          }
                        </span>

                      </td>


                      {/* PROGRESS */}

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
                              className={`progress-fill progress-${project.status}`}
                              style={{
                                width:
                                  `${project.progress}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>


                      {/* MANAGER */}

                      <td>
                        {manager
                          ?.fullName ||
                          "تعیین نشده"}
                      </td>


                      {/* MY ROLE */}

                      <td>

                        <span
                          className={
                            membership
                              ?.role ===
                            PROJECT_ROLES.PROJECT_MANAGER
                              ? "project-user-role role-manager"
                              : "project-user-role role-member"
                          }
                        >
                          {
                            getProjectRoleLabel(
                              membership
                                ?.role
                            )
                          }
                        </span>

                      </td>


                      {/* START DATE */}

                      <td>
                        {
                          project.startDate
                        }
                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="project-row-actions">

                          {userCanEdit ? (

                            <Link
                              to={`/projects/${project.id}/edit`}
                              className="edit-project-button"
                            >
                              <Pencil
                                size={16}
                              />

                              <span>
                                ویرایش
                              </span>
                            </Link>

                          ) : (

                            <span className="project-no-edit">
                              فقط مشاهده
                            </span>

                          )}

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>


        {filteredProjects.length ===
          0 && (

          <div className="projects-empty">

            {userProjects.length ===
            0
              ? "در حال حاضر عضو هیچ پروژه‌ای نیستید."
              : "پروژه‌ای با این وضعیت وجود ندارد."}

          </div>

        )}

      </div>

    </section>
  );
}


export default Projects;