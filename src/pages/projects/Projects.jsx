import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Plus,
  Download,
  Filter,
} from "lucide-react";

import "./Projects.css";


const mockProjects = [
  {
    id: 1,
    title: "سیستم یکپارچه‌سازی انبارداری",
    status: "in-progress",
    statusLabel: "در حال انجام",
    progress: 80,
    manager: "سهراب سپهری",
    startDate: "۱۴۰۴/۰۶/۱۵",
  },
  {
    id: 2,
    title: "بازطراحی پنل مشتریان تجارت الکترونیک",
    status: "delayed",
    statusLabel: "به تعویق افتاده",
    progress: 35,
    manager: "مهرداد بهرامی",
    startDate: "۱۴۰۴/۰۷/۱۰",
  },
  {
    id: 3,
    title: "پورتال جدید خدمات پس از فروش",
    status: "review",
    statusLabel: "در انتظار تایید",
    progress: 95,
    manager: "رویا رضایی",
    startDate: "۱۴۰۴/۰۵/۰۱",
  },
  {
    id: 4,
    title: "توسعه نرم‌افزار موبایل سازمان",
    status: "completed",
    statusLabel: "تکمیل شده",
    progress: 100,
    manager: "آرش کمالگیر",
    startDate: "۱۴۰۴/۰۴/۱۸",
  },
];


function Projects() {
  const [statusFilter, setStatusFilter] = useState("all");


  const filteredProjects =
    statusFilter === "all"
      ? mockProjects
      : mockProjects.filter(
          (project) => project.status === statusFilter
        );


  return (
    <section className="projects-page">

      {/* Toolbar */}
      <div className="projects-toolbar">

        <div className="projects-filter-section">

          <span className="projects-count-label">
            نمایش کل پروژه‌ها
          </span>


          <div className="status-filter">
            <Filter size={17} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">
                فیلتر بر اساس وضعیت
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


          <Link
            to="/projects/create"
            className="create-project-button"
          >
            <Plus size={19} />

            <span>
              ایجاد پروژه جدید
            </span>
          </Link>

        </div>

      </div>


      {/* Projects table */}
      <div className="projects-table-card">

        <div className="projects-table-wrapper">

          <table className="projects-table">

            <thead>
              <tr>
                <th>عنوان پروژه</th>
                <th>وضعیت پروژه</th>
                <th>پیشرفت</th>
                <th>مدیر پروژه</th>
                <th>تاریخ شروع</th>
              </tr>
            </thead>


            <tbody>

              {filteredProjects.map((project) => (

                <tr key={project.id}>

                  <td>
                    <Link
                      to={`/projects/${project.id}`}
                      className="project-title-link"
                    >
                      {project.title}
                    </Link>
                  </td>


                  <td>
                    <span
                      className={`project-status status-${project.status}`}
                    >
                      {project.statusLabel}
                    </span>
                  </td>


                  <td>

                    <div className="progress-cell">

                      <span className="progress-number">
                        {project.progress}%
                      </span>


                      <div className="progress-track">

                        <div
                          className={`progress-fill progress-${project.status}`}
                          style={{
                            width: `${project.progress}%`,
                          }}
                        />

                      </div>

                    </div>

                  </td>


                  <td>
                    {project.manager}
                  </td>


                  <td>
                    {project.startDate}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>


        {filteredProjects.length === 0 && (
          <div className="projects-empty">
            پروژه‌ای با این وضعیت وجود ندارد.
          </div>
        )}

      </div>

    </section>
  );
}


export default Projects;