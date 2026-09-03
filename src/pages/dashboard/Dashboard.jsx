import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FolderKanban,
  TriangleAlert,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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

import "./Dashboard.css";


const TASK_COLORS = [
  "#f59e0b",
  "#2563eb",
  "#10b981",
];


const PROJECT_STATUS_LABELS = {
  "in-progress": "در حال انجام",
  delayed: "با تأخیر",
  review: "در انتظار تأیید",
  completed: "تکمیل شده",
};


function normalizeTaskStatus(status) {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    [
      "done",
      "completed",
      "انجام شده",
      "تکمیل شده",
      "تکمیل‌شده",
    ].includes(normalized)
  ) {
    return "done";
  }

  if (
    [
      "doing",
      "in-progress",
      "in_progress",
      "در حال انجام",
    ].includes(normalized)
  ) {
    return "doing";
  }

  return "todo";
}


function shortenTitle(title) {
  if (!title) {
    return "پروژه";
  }

  return title.length > 18
    ? `${title.slice(0, 18)}…`
    : title;
}


function Dashboard() {
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
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    const loadDashboard =
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

          setCurrentUser(user);

          setOrganizations(
            Array.isArray(
              organizationList
            )
              ? organizationList
              : []
          );

          setProjects(
            getWorkspaceProjects()
          );
        } catch (loadError) {
          console.error(
            "Load dashboard error:",
            loadError
          );

          setError(
            "دریافت اطلاعات داشبورد با خطا مواجه شد."
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);


  const visibleProjects =
    useMemo(() => {

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
    }, [
      currentUser,
      projects,
      organizations,
    ]);


  const dashboardData =
    useMemo(() => {

      const tasks =
        visibleProjects.flatMap(
          (project) =>
            Array.isArray(
              project.tasks
            )
              ? project.tasks
              : []
        );

      const completedTasks =
        tasks.filter(
          (task) =>
            normalizeTaskStatus(
              task.status
            ) === "done"
        ).length;

      const doingTasks =
        tasks.filter(
          (task) =>
            normalizeTaskStatus(
              task.status
            ) === "doing"
        ).length;

      const todoTasks =
        tasks.length -
        completedTasks -
        doingTasks;

      const delayedProjects =
        visibleProjects.filter(
          (project) =>
            project.status ===
            "delayed"
        ).length;

      const averageProgress =
        visibleProjects.length > 0
          ? Math.round(
              visibleProjects.reduce(
                (
                  total,
                  project
                ) =>
                  total +
                  Number(
                    project.progress ||
                    0
                  ),
                0
              ) /
                visibleProjects.length
            )
          : 0;

      const progressChart =
        visibleProjects.map(
          (project) => ({
            name:
              shortenTitle(
                project.title
              ),
            progress:
              Number(
                project.progress ||
                0
              ),
          })
        );

      const taskStatusChart = [
        {
          name: "در انتظار",
          value: todoTasks,
        },
        {
          name: "در حال انجام",
          value: doingTasks,
        },
        {
          name: "تکمیل شده",
          value: completedTasks,
        },
      ];

      return {
        totalProjects:
          visibleProjects.length,

        totalTasks:
          tasks.length,

        completedTasks,

        delayedProjects,

        averageProgress,

        progressChart,

        taskStatusChart,
      };
    }, [
      visibleProjects,
    ]);


  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-state">
          در حال بارگذاری داشبورد...
        </div>
      </section>
    );
  }


  if (error) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-state dashboard-error">
          {error}
        </div>
      </section>
    );
  }


  return (
    <section className="dashboard-page">

      <div className="dashboard-heading">

        <div>
          <h2>
            داشبورد
          </h2>

          <p>
            نمای کلی پروژه‌ها، وظایف و وضعیت پیشرفت
          </p>
        </div>

        <div className="dashboard-average-progress">
          <span>
            میانگین پیشرفت پروژه‌ها
          </span>

          <strong>
            {dashboardData.averageProgress}%
          </strong>
        </div>

      </div>


      <div className="dashboard-stats">

        <article className="dashboard-stat-card">

          <div className="dashboard-stat-icon blue">
            <FolderKanban
              size={21}
            />
          </div>

          <div>
            <span>
              کل پروژه‌ها
            </span>

            <strong>
              {dashboardData.totalProjects}
            </strong>
          </div>

        </article>


        <article className="dashboard-stat-card">

          <div className="dashboard-stat-icon purple">
            <ClipboardList
              size={21}
            />
          </div>

          <div>
            <span>
              کل وظایف
            </span>

            <strong>
              {dashboardData.totalTasks}
            </strong>
          </div>

        </article>


        <article className="dashboard-stat-card">

          <div className="dashboard-stat-icon green">
            <CheckCircle2
              size={21}
            />
          </div>

          <div>
            <span>
              وظایف تکمیل شده
            </span>

            <strong>
              {dashboardData.completedTasks}
            </strong>
          </div>

        </article>


        <article className="dashboard-stat-card">

          <div className="dashboard-stat-icon orange">
            <TriangleAlert
              size={21}
            />
          </div>

          <div>
            <span>
              پروژه‌های با تأخیر
            </span>

            <strong>
              {dashboardData.delayedProjects}
            </strong>
          </div>

        </article>

      </div>


      <div className="dashboard-charts">

        <article className="dashboard-panel progress-panel">

          <div className="dashboard-panel-heading">

            <div>
              <h3>
                پیشرفت پروژه‌ها
              </h3>

              <p>
                درصد پیشرفت پروژه‌های قابل مشاهده
              </p>
            </div>

            <BarChart3
              size={21}
            />

          </div>


          {dashboardData.progressChart.length >
          0 ? (

            <div className="dashboard-chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    dashboardData.progressChart
                  }
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
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="dashboard-chart-empty">
              هنوز پروژه‌ای برای نمایش وجود ندارد.
            </div>

          )}

        </article>


        <article className="dashboard-panel task-status-panel">

          <div className="dashboard-panel-heading">

            <div>
              <h3>
                وضعیت وظایف
              </h3>

              <p>
                توزیع وظایف پروژه‌های قابل مشاهده
              </p>
            </div>

          </div>


          {dashboardData.totalTasks >
          0 ? (

            <>
              <div className="dashboard-pie-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={
                        dashboardData.taskStatusChart
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                    >

                      {dashboardData.taskStatusChart.map(
                        (
                          item,
                          index
                        ) => (

                          <Cell
                            key={
                              item.name
                            }
                            fill={
                              TASK_COLORS[
                                index
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              </div>


              <div className="dashboard-chart-legend">

                {dashboardData.taskStatusChart.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={
                        item.name
                      }
                      className="dashboard-legend-item"
                    >

                      <span
                        className="dashboard-legend-dot"
                        style={{
                          backgroundColor:
                            TASK_COLORS[
                              index
                            ],
                        }}
                      />

                      <span>
                        {item.name}
                      </span>

                      <strong>
                        {item.value}
                      </strong>

                    </div>

                  )
                )}

              </div>
            </>

          ) : (

            <div className="dashboard-chart-empty">
              هنوز وظیفه‌ای برای نمایش وجود ندارد.
            </div>

          )}

        </article>

      </div>


      <article className="dashboard-panel dashboard-projects-panel">

        <div className="dashboard-panel-heading">

          <div>
            <h3>
              خلاصه پروژه‌ها
            </h3>

            <p>
              آخرین وضعیت پروژه‌های قابل دسترس شما
            </p>
          </div>

        </div>


        {visibleProjects.length ===
        0 ? (

          <div className="dashboard-chart-empty">
            پروژه‌ای برای نمایش وجود ندارد.
          </div>

        ) : (

          <div className="dashboard-table-wrapper">

            <table className="dashboard-table">

              <thead>
                <tr>
                  <th>
                    پروژه
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
                    اعضا
                  </th>
                </tr>
              </thead>


              <tbody>

                {visibleProjects
                  .slice(0, 6)
                  .map(
                    (project) => (

                      <tr
                        key={
                          project.id
                        }
                      >

                        <td>
                          {
                            project.title
                          }
                        </td>

                        <td>
                          {
                            project.organizationName ||
                            "سازمان"
                          }
                        </td>

                        <td>
                          <span
                            className={`dashboard-project-status status-${project.status}`}
                          >
                            {
                              PROJECT_STATUS_LABELS[
                                project.status
                              ] ||
                              "در حال انجام"
                            }
                          </span>
                        </td>

                        <td>

                          <div className="dashboard-progress-cell">

                            <span>
                              {
                                Number(
                                  project.progress ||
                                  0
                                )
                              }
                              %
                            </span>

                            <div className="dashboard-progress-track">

                              <div
                                className="dashboard-progress-fill"
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
                          {
                            Array.isArray(
                              project.members
                            )
                              ? project.members.length
                              : 0
                          }
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


export default Dashboard;
