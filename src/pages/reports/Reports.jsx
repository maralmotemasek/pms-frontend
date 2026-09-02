import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CheckCircle2,
  Download,
  FolderKanban,
  ListChecks,
  TrendingUp,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getCurrentUser,
} from "../../services/authService";

import {
  getMyOrganizations,
} from "../../services/organizationService";

import {
  getWorkspaceProjects,
} from "../../data/projectWorkspaceStore";

import {
  canViewWorkspaceProject,
} from "../../utils/projectAccess";

import "./Reports.css";


const COMPLETED_STATUSES = new Set([
  "done",
  "completed",
  "انجام شده",
  "تکمیل شده",
]);


function Reports() {
  const [currentUser, setCurrentUser] =
    useState(null);

  const [organizations, setOrganizations] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);

      try {
        const [
          user,
          organizationList,
        ] = await Promise.all([
          getCurrentUser(),
          getMyOrganizations(),
        ]);

        const workspaceProjects =
          getWorkspaceProjects();

        setCurrentUser(user);

        setOrganizations(
          Array.isArray(organizationList)
            ? organizationList
            : []
        );

        setProjects(
          Array.isArray(workspaceProjects)
            ? workspaceProjects
            : []
        );
      } catch (error) {
        console.error(
          "Reports loading error:",
          error
        );

        setProjects(
          getWorkspaceProjects()
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);


  const visibleProjects = useMemo(() => {
    if (!currentUser) {
      return projects;
    }

    return projects.filter(
      (project) =>
        canViewWorkspaceProject(
          currentUser,
          project,
          organizations
        )
    );
  }, [
    currentUser,
    organizations,
    projects,
  ]);


  const allTasks = useMemo(
    () =>
      visibleProjects.flatMap(
        (project) =>
          Array.isArray(project.tasks)
            ? project.tasks
            : []
      ),
    [visibleProjects]
  );


  const completedTasks = useMemo(
    () =>
      allTasks.filter(
        (task) =>
          COMPLETED_STATUSES.has(
            String(
              task.status || ""
            ).toLowerCase()
          )
      ),
    [allTasks]
  );


  const averageProgress = useMemo(() => {
    if (visibleProjects.length === 0) {
      return 0;
    }

    const total =
      visibleProjects.reduce(
        (sum, project) =>
          sum +
          Number(
            project.progress || 0
          ),
        0
      );

    return Math.round(
      total /
        visibleProjects.length
    );
  }, [visibleProjects]);


  const projectChartData = useMemo(
    () =>
      visibleProjects.map(
        (project) => ({
          name:
            project.title ||
            `پروژه ${project.id}`,
          progress:
            Number(
              project.progress || 0
            ),
        })
      ),
    [visibleProjects]
  );


  const exportCsv = () => {
    const header = [
      "نام پروژه",
      "سازمان",
      "وضعیت",
      "پیشرفت",
      "تعداد وظایف",
      "بودجه",
    ];

    const rows =
      visibleProjects.map(
        (project) => [
          project.title || "",
          project.organizationName || "",
          project.statusLabel ||
            project.status ||
            "",
          `${Number(
            project.progress || 0
          )}%`,
          Array.isArray(project.tasks)
            ? project.tasks.length
            : 0,
          project.budget || "0",
        ]
      );

    const csv =
      "\uFEFF" +
      [header, ...rows]
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(value).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "pms-report.csv";

    document.body.appendChild(
      anchor
    );

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };


  if (loading) {
    return (
      <section className="reports-page">
        <div className="reports-loading">
          در حال آماده‌سازی گزارش...
        </div>
      </section>
    );
  }


  return (
    <section
      className="reports-page"
      dir="rtl"
    >
      <div className="reports-heading">
        <div>
          <h1>گزارش‌ها</h1>

          <p>
            نمای تحلیلی از وضعیت
            پروژه‌ها و وظایف
          </p>
        </div>

        <button
          type="button"
          className="reports-export-button"
          onClick={exportCsv}
        >
          <Download size={18} />
          خروجی CSV
        </button>
      </div>


      <div className="reports-kpis">
        <article className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <FolderKanban size={22} />
          </div>

          <div>
            <span>
              پروژه‌های قابل مشاهده
            </span>

            <strong>
              {visibleProjects.length}
            </strong>
          </div>
        </article>


        <article className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <ListChecks size={22} />
          </div>

          <div>
            <span>
              کل وظایف
            </span>

            <strong>
              {allTasks.length}
            </strong>
          </div>
        </article>


        <article className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>
              وظایف تکمیل‌شده
            </span>

            <strong>
              {completedTasks.length}
            </strong>
          </div>
        </article>


        <article className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>
              میانگین پیشرفت
            </span>

            <strong>
              {averageProgress}%
            </strong>
          </div>
        </article>
      </div>


      <div className="reports-grid">
        <article className="reports-panel reports-chart-panel">
          <div className="reports-panel-title">
            <BarChart3 size={20} />

            <div>
              <h2>
                پیشرفت پروژه‌ها
              </h2>

              <p>
                درصد پیشرفت ثبت‌شده
                برای هر پروژه
              </p>
            </div>
          </div>

          {projectChartData.length ===
          0 ? (
            <div className="reports-empty">
              هنوز داده‌ای برای
              گزارش وجود ندارد.
            </div>
          ) : (
            <div className="reports-chart">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    projectChartData
                  }
                  margin={{
                    top: 10,
                    right: 0,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="progress"
                    fill="#2563eb"
                    radius={[
                      7,
                      7,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>


        <article className="reports-panel reports-summary-panel">
          <h2>
            خلاصه عملکرد
          </h2>

          <div className="reports-summary-row">
            <span>
              نرخ تکمیل وظایف
            </span>

            <strong>
              {allTasks.length
                ? Math.round(
                    (completedTasks.length /
                      allTasks.length) *
                      100
                  )
                : 0}
              %
            </strong>
          </div>

          <div className="reports-progress-track">
            <div
              className="reports-progress-fill"
              style={{
                width: `${
                  allTasks.length
                    ? Math.round(
                        (completedTasks.length /
                          allTasks.length) *
                          100
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="reports-summary-row">
            <span>
              میانگین پیشرفت پروژه‌ها
            </span>

            <strong>
              {averageProgress}%
            </strong>
          </div>

          <div className="reports-progress-track">
            <div
              className="reports-progress-fill"
              style={{
                width:
                  `${averageProgress}%`,
              }}
            />
          </div>

          <div className="reports-backend-note">
            خروجی PDF و Excel پس از
            آماده‌شدن API گزارش‌گیری
            Backend متصل می‌شود.
          </div>
        </article>
      </div>


      <article className="reports-panel">
        <div className="reports-panel-title">
          <FolderKanban size={20} />

          <div>
            <h2>
              گزارش پروژه‌ها
            </h2>

            <p>
              وضعیت کلی پروژه‌های
              قابل مشاهده برای شما
            </p>
          </div>
        </div>

        {visibleProjects.length === 0 ? (
          <div className="reports-empty">
            پروژه‌ای برای نمایش وجود
            ندارد.
          </div>
        ) : (
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>پروژه</th>
                  <th>سازمان</th>
                  <th>وضعیت</th>
                  <th>پیشرفت</th>
                  <th>وظایف</th>
                </tr>
              </thead>

              <tbody>
                {visibleProjects.map(
                  (project) => (
                    <tr
                      key={
                        project.id
                      }
                    >
                      <td>
                        {project.title}
                      </td>

                      <td>
                        {project.organizationName ||
                          "-"}
                      </td>

                      <td>
                        {project.statusLabel ||
                          project.status ||
                          "-"}
                      </td>

                      <td>
                        <div className="reports-table-progress">
                          <span>
                            {Number(
                              project.progress ||
                                0
                            )}
                            %
                          </span>

                          <div>
                            <i
                              style={{
                                width:
                                  `${Number(
                                    project.progress ||
                                      0
                                  )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        {Array.isArray(
                          project.tasks
                        )
                          ? project.tasks
                              .length
                          : 0}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}


export default Reports;