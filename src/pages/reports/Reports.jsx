import {
  useEffect,
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
  exportGeneralReportExcel,
  getReports,
} from "../../services/reportService";

import "./Reports.css";

const PROJECT_STATUS_LABELS = {
  TODO: "در انتظار",
  PLANNED: "برنامه‌ریزی‌شده",
  IN_PROGRESS: "در حال انجام",
  "in-progress": "در حال انجام",
  IN_REVIEW: "در حال بررسی",
  REVIEW: "در حال بررسی",
  COMPLETED: "تکمیل‌شده",
  DONE: "تکمیل‌شده",
  CANCELLED: "لغوشده",
  DELAYED: "با تأخیر",
  delayed: "با تأخیر",
};

const getProjectStatusLabel = (status) =>
  PROJECT_STATUS_LABELS[status] ||
  status ||
  "-";

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat(
      "fa-IR"
    ).format(new Date(date));
  } catch {
    return date;
  }
};

function Reports() {
  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [exporting, setExporting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getReports();

        setReport(data);
      } catch (requestError) {
        console.error(
          "Reports loading error:",
          requestError
        );

        const status =
          requestError?.response?.status;

        if (status === 403) {
          setError(
            "دسترسی به گزارش کلی فقط برای مالک یا مدیر سازمان مجاز است."
          );
        } else if (status === 401) {
          setError(
            "برای مشاهده گزارش‌ها باید وارد حساب کاربری شوید."
          );
        } else {
          setError(
            "دریافت اطلاعات گزارش‌ها با خطا مواجه شد."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const summary =
    report?.summary || {
      total_projects: 0,
      total_tasks: 0,
      completed_tasks: 0,
      average_project_progress: 0,
    };

  const performance =
    report?.performance || {
      task_completion_rate: 0,
      average_project_progress: 0,
    };

  const projects =
    Array.isArray(report?.projects)
      ? report.projects
      : [];

  const projectChartData =
    projects.map((project) => ({
      name:
        project.project_name ||
        `پروژه ${project.project_id}`,

      progress: Number(
        project.progress || 0
      ),
    }));

  const handleExportExcel =
    async () => {
      setExporting(true);
      setError("");

      try {
        const response =
          await exportGeneralReportExcel();

        const blob =
          new Blob(
            [response.data],
            {
              type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }
          );

        const url =
          URL.createObjectURL(blob);

        const anchor =
          document.createElement("a");

        anchor.href = url;

        anchor.download =
          "PMS_General_Project_Report.xlsx";

        document.body.appendChild(
          anchor
        );

        anchor.click();
        anchor.remove();

        URL.revokeObjectURL(url);
      } catch (requestError) {
        console.error(
          "Report export error:",
          requestError
        );

        const status =
          requestError?.response?.status;

        if (status === 403) {
          setError(
            "شما مجوز دریافت خروجی Excel گزارش کلی را ندارید."
          );
        } else if (status === 401) {
          setError(
            "برای دریافت گزارش باید وارد حساب کاربری شوید."
          );
        } else {
          setError(
            "دریافت فایل Excel با خطا مواجه شد."
          );
        }
      } finally {
        setExporting(false);
      }
    };

  if (loading) {
    return (
      <section
        className="reports-page"
        dir="rtl"
      >
        <div className="reports-loading">
          در حال آماده‌سازی گزارش...
        </div>
      </section>
    );
  }

  if (error && !report) {
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
        </div>

        <div className="reports-panel reports-empty">
          {error}
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
            نمای تحلیلی از وضعیت پروژه‌ها
            و وظایف
          </p>
        </div>

        <button
          type="button"
          className="reports-export-button"
          onClick={handleExportExcel}
          disabled={exporting}
        >
          <Download size={18} />

          {exporting
            ? "در حال دریافت..."
            : "خروجی Excel"}
        </button>
      </div>

      {error ? (
        <div className="reports-panel reports-empty">
          {error}
        </div>
      ) : null}

      <div className="reports-kpis">
        <article className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <FolderKanban
              size={22}
            />
          </div>

          <div>
            <span>
              کل پروژه‌ها
            </span>

            <strong>
              {
                summary.total_projects
              }
            </strong>
          </div>
        </article>

        <article className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <ListChecks
              size={22}
            />
          </div>

          <div>
            <span>
              کل وظایف
            </span>

            <strong>
              {summary.total_tasks}
            </strong>
          </div>
        </article>

        <article className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <CheckCircle2
              size={22}
            />
          </div>

          <div>
            <span>
              وظایف تکمیل‌شده
            </span>

            <strong>
              {
                summary.completed_tasks
              }
            </strong>
          </div>
        </article>

        <article className="reports-kpi-card">
          <div className="reports-kpi-icon">
            <TrendingUp
              size={22}
            />
          </div>

          <div>
            <span>
              میانگین پیشرفت
            </span>

            <strong>
              {Math.round(
                Number(
                  summary.average_project_progress ||
                    0
                )
              )}
              %
            </strong>
          </div>
        </article>
      </div>

      <div className="reports-grid">
        <article className="reports-panel reports-chart-panel">
          <div className="reports-panel-title">
            <BarChart3
              size={20}
            />

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
              هنوز داده‌ای برای گزارش
              وجود ندارد.
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
              {Math.round(
                Number(
                  performance.task_completion_rate ||
                    0
                )
              )}
              %
            </strong>
          </div>

          <div className="reports-progress-track">
            <div
              className="reports-progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      performance.task_completion_rate ||
                        0
                    )
                  )
                )}%`,
              }}
            />
          </div>

          <div className="reports-summary-row">
            <span>
              میانگین پیشرفت
              پروژه‌ها
            </span>

            <strong>
              {Math.round(
                Number(
                  performance.average_project_progress ||
                    0
                )
              )}
              %
            </strong>
          </div>

          <div className="reports-progress-track">
            <div
              className="reports-progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      performance.average_project_progress ||
                        0
                    )
                  )
                )}%`,
              }}
            />
          </div>

          <div className="reports-backend-note">
            اطلاعات این صفحه مستقیماً
            از API گزارش‌گیری Backend
            دریافت می‌شود و خروجی Excel
            نیز توسط Backend تولید
            می‌شود.
          </div>
        </article>
      </div>

      <article className="reports-panel">
        <div className="reports-panel-title">
          <FolderKanban
            size={20}
          />

          <div>
            <h2>
              گزارش پروژه‌ها
            </h2>

            <p>
              خلاصه وضعیت پروژه‌های
              قابل گزارش
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="reports-empty">
            پروژه‌ای برای نمایش
            وجود ندارد.
          </div>
        ) : (
          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>پروژه</th>
                  <th>وضعیت</th>
                  <th>پیشرفت</th>
                  <th>وظایف</th>
                  <th>
                    تکمیل‌شده
                  </th>
                  <th>
                    نرخ تکمیل
                  </th>
                  <th>موعد</th>
                </tr>
              </thead>

              <tbody>
                {projects.map(
                  (project) => (
                    <tr
                      key={
                        project.project_id
                      }
                    >
                      <td>
                        {
                          project.project_name
                        }
                      </td>

                      <td>
                        {getProjectStatusLabel(
                          project.status
                        )}
                      </td>

                      <td>
                        <div className="reports-table-progress">
                          <span>
                            {Math.round(
                              Number(
                                project.progress ||
                                  0
                              )
                            )}
                            %
                          </span>

                          <div>
                            <i
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(
                                      project.progress ||
                                        0
                                    )
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        {
                          project.total_tasks
                        }
                      </td>

                      <td>
                        {
                          project.completed_tasks
                        }
                      </td>

                      <td>
                        {Math.round(
                          Number(
                            project.task_completion_rate ||
                              0
                          )
                        )}
                        %
                      </td>

                      <td>
                        {formatDate(
                          project.due_date
                        )}
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
