import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Filter,
  GripVertical,
  Plus,
  Search,
  UserRound,
} from "lucide-react";

import {
  getMyTasks,
  updateMyTask,
} from "../../services/taskService";

import "./Tasks.css";


const columns = [
  {
    key: "todo",
    title: "در انتظار",
    englishTitle: "To Do",
  },
  {
    key: "doing",
    title: "در حال انجام",
    englishTitle: "Doing",
  },
  {
    key: "review",
    title: "در حال بررسی",
    englishTitle: "Review",
  },
  {
    key: "done",
    title: "تکمیل شده",
    englishTitle: "Done",
  },
  {
    key: "cancelled",
    title: "لغو شده",
    englishTitle: "Cancelled",
  },
];


const priorityLabels = {
  high: "اولویت بالا",
  medium: "اولویت متوسط",
  low: "اولویت پایین",
};


const getPriorityLabel = (priority) => {
  return (
    priorityLabels[priority] ||
    priority ||
    "بدون اولویت"
  );
};


const getApiErrorMessage = (error) => {
  const detail =
    error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" - ");
  }

  if (error?.message) {
    return error.message;
  }

  return "خطایی در ارتباط با سرور رخ داد.";
};


function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    updatingTaskId,
    setUpdatingTaskId,
  ] = useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    deadlineFilter,
    setDeadlineFilter,
  ] = useState("all");

  const [
    draggingTaskId,
    setDraggingTaskId,
  ] = useState(null);

  const [
    activeColumn,
    setActiveColumn,
  ] = useState(null);


  // =========================
  // LOAD TASKS FROM BACKEND
  // =========================

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getMyTasks();

        if (!isMounted) {
          return;
        }

        setTasks(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Failed to load tasks:",
          loadError
        );

        setError(
          getApiErrorMessage(
            loadError
          )
        );

        setTasks([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);


  // =========================
  // DEADLINE HELPERS
  // =========================

  const isTaskOverdue = (task) => {
    if (
      !task.deadline ||
      task.status === "done" ||
      task.status === "cancelled"
    ) {
      return false;
    }

    const deadline =
      new Date(
        `${task.deadline}T23:59:59`
      );

    return (
      deadline.getTime() <
      Date.now()
    );
  };


  // =========================
  // FILTER TASKS
  // =========================

  const filteredTasks =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return tasks.filter(
        (task) => {
          const searchableText = [
            task.title,
            task.project,
            task.assignee,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            normalizedSearch === "" ||
            searchableText.includes(
              normalizedSearch
            );

          const matchesPriority =
            priorityFilter === "all" ||
            task.priority ===
              priorityFilter;

          const matchesStatus =
            statusFilter === "all" ||
            task.status ===
              statusFilter;

          const overdue =
            isTaskOverdue(task);

          const matchesDeadline =
            deadlineFilter === "all" ||
            (
              deadlineFilter ===
                "overdue" &&
              overdue
            ) ||
            (
              deadlineFilter ===
                "active" &&
              !overdue
            );

          return (
            matchesSearch &&
            matchesPriority &&
            matchesStatus &&
            matchesDeadline
          );
        }
      );
    }, [
      tasks,
      searchTerm,
      priorityFilter,
      statusFilter,
      deadlineFilter,
    ]);


  // =========================
  // PROJECT PROGRESS
  // =========================

  const completedTasksCount =
    tasks.filter(
      (task) =>
        task.status === "done"
    ).length;

  const projectProgress =
    tasks.length > 0
      ? Math.round(
          (
            completedTasksCount /
            tasks.length
          ) * 100
        )
      : 0;

  const overdueTasksCount =
    tasks.filter(
      isTaskOverdue
    ).length;


  // =========================
  // TASKS BY COLUMN
  // =========================

  const getTasksByStatus = (
    status
  ) => {
    return filteredTasks.filter(
      (task) =>
        task.status === status
    );
  };


  // =========================
  // DRAG & DROP
  // =========================

  const handleDragStart = (
    event,
    taskId
  ) => {
    setDraggingTaskId(taskId);

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      String(taskId)
    );
  };


  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setActiveColumn(null);
  };


  const handleDragOver = (
    event,
    columnStatus
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";

    setActiveColumn(
      columnStatus
    );
  };


  const handleDrop = async (
    event,
    newStatus
  ) => {
    event.preventDefault();

    const droppedTaskId =
      Number(
        event.dataTransfer.getData(
          "text/plain"
        )
      );

    setDraggingTaskId(null);
    setActiveColumn(null);

    if (!droppedTaskId) {
      return;
    }

    const currentTask =
      tasks.find(
        (task) =>
          task.id ===
          droppedTaskId
      );

    if (!currentTask) {
      return;
    }

    if (
      currentTask.status ===
      newStatus
    ) {
      return;
    }

    const previousStatus =
      currentTask.status;

    setError("");

    // Optimistic UI update
    setTasks(
      (previousTasks) =>
        previousTasks.map(
          (task) =>
            task.id ===
            droppedTaskId
              ? {
                  ...task,
                  status:
                    newStatus,
                }
              : task
        )
    );

    setUpdatingTaskId(
      droppedTaskId
    );

    try {
      const updatedTask =
        await updateMyTask(
          droppedTaskId,
          {
            status:
              newStatus,
          }
        );

      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (task) =>
              task.id ===
              droppedTaskId
                ? {
                    ...task,
                    ...updatedTask,
                  }
                : task
          )
      );
    } catch (updateError) {
      console.error(
        "Failed to update task:",
        updateError
      );

      // Roll back local change
      setTasks(
        (previousTasks) =>
          previousTasks.map(
            (task) =>
              task.id ===
              droppedTaskId
                ? {
                    ...task,
                    status:
                      previousStatus,
                  }
                : task
          )
      );

      setError(
        getApiErrorMessage(
          updateError
        )
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };


  return (
    <section className="tasks-page">

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="kanban-toolbar">
        <div className="kanban-toolbar-content">

          <h1 className="kanban-toolbar-title">
            برد کانبان وظایف من
          </h1>


          {/* SEARCH */}

          <div className="task-search-box">
            <Search
              size={18}
              strokeWidth={1.8}
              className="task-search-icon"
            />

            <input
              type="search"
              placeholder="جستجوی وظیفه..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              aria-label="جستجوی وظیفه"
            />
          </div>


          {/* FILTERS */}

          <div
            className="kanban-filters"
            aria-label="فیلتر وظایف"
          >
            <div className="kanban-filter-control">
              <Filter
                size={15}
                strokeWidth={1.8}
                className="filter-icon"
              />

              <select
                value={
                  priorityFilter
                }
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                aria-label="فیلتر اولویت"
              >
                <option value="all">
                  همه اولویت‌ها
                </option>

                <option value="high">
                  اولویت بالا
                </option>

                <option value="medium">
                  اولویت متوسط
                </option>

                <option value="low">
                  اولویت پایین
                </option>
              </select>
            </div>


            <div className="kanban-filter-control">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                aria-label="فیلتر وضعیت"
              >
                <option value="all">
                  همه وضعیت‌ها
                </option>

                <option value="todo">
                  در انتظار
                </option>

                <option value="doing">
                  در حال انجام
                </option>

                <option value="review">
                  در حال بررسی
                </option>

                <option value="done">
                  تکمیل شده
                </option>

                <option value="cancelled">
                  لغو شده
                </option>
              </select>
            </div>


            <div className="kanban-filter-control">
              <select
                value={
                  deadlineFilter
                }
                onChange={(event) =>
                  setDeadlineFilter(
                    event.target.value
                  )
                }
                aria-label="فیلتر مهلت"
              >
                <option value="all">
                  همه مهلت‌ها
                </option>

                <option value="overdue">
                  عقب‌افتاده‌ها
                </option>

                <option value="active">
                  مهلت‌دار فعال
                </option>
              </select>
            </div>
          </div>
        </div>


        {/* ADD TASK */}

        <button
          type="button"
          className="add-task-button"
          onClick={() =>
            navigate(
              "/tasks/create"
            )
          }
        >
          <Plus
            size={18}
            strokeWidth={2}
          />

          <span>
            افزودن وظیفه جدید
          </span>
        </button>
      </div>


      {/* =========================
          API STATE
      ========================= */}

      {error && (
        <div
          className="kanban-empty"
          role="alert"
        >
          {error}
        </div>
      )}


      {/* =========================
          PROJECT PROGRESS
      ========================= */}

      <div className="project-progress-card">
        <div className="project-progress-header">
          <div>
            <h2>
              پیشرفت وظایف
            </h2>

            <p>
              {completedTasksCount}
              {" "}
              وظیفه از
              {" "}
              {tasks.length}
              {" "}
              وظیفه تکمیل شده است
            </p>
          </div>

          <strong className="project-progress-percentage">
            {projectProgress}%
          </strong>
        </div>

        <div className="project-progress-track">
          <div
            className="project-progress-bar"
            style={{
              width:
                `${projectProgress}%`,
            }}
          />
        </div>

        <div className="project-progress-meta">
          <span>
            کل وظایف:
            {" "}
            {tasks.length}
          </span>

          <span>
            تکمیل شده:
            {" "}
            {completedTasksCount}
          </span>

          <span
            className={
              overdueTasksCount > 0
                ? "progress-overdue"
                : ""
            }
          >
            عقب‌افتاده:
            {" "}
            {overdueTasksCount}
          </span>
        </div>
      </div>


      {/* =========================
          LOADING
      ========================= */}

      {loading ? (
        <div className="kanban-empty">
          در حال دریافت وظایف...
        </div>
      ) : (

        /* =========================
            KANBAN BOARD
        ========================= */

        <div className="kanban-board">
          {columns.map(
            (column) => {
              const columnTasks =
                getTasksByStatus(
                  column.key
                );

              return (
                <div
                  key={column.key}
                  className={`kanban-column kanban-column-${column.key} ${
                    activeColumn ===
                    column.key
                      ? "drag-over"
                      : ""
                  }`}
                  onDragOver={(
                    event
                  ) =>
                    handleDragOver(
                      event,
                      column.key
                    )
                  }
                  onDragEnter={(
                    event
                  ) => {
                    event.preventDefault();

                    setActiveColumn(
                      column.key
                    );
                  }}
                  onDragLeave={(
                    event
                  ) => {
                    if (
                      !event.currentTarget.contains(
                        event.relatedTarget
                      )
                    ) {
                      setActiveColumn(
                        null
                      );
                    }
                  }}
                  onDrop={(
                    event
                  ) =>
                    handleDrop(
                      event,
                      column.key
                    )
                  }
                >

                  {/* COLUMN HEADER */}

                  <div className="kanban-column-header">
                    <div className="kanban-column-title">
                      <span>
                        {column.title}
                      </span>

                      <strong>
                        (
                        {
                          column.englishTitle
                        }
                        )
                      </strong>
                    </div>

                    <span
                      className={`kanban-count kanban-count-${column.key}`}
                    >
                      {
                        columnTasks.length
                      }
                    </span>
                  </div>


                  {/* TASKS */}

                  <div className="kanban-column-content">
                    {columnTasks.map(
                      (task) => {
                        const overdue =
                          isTaskOverdue(
                            task
                          );

                        return (
                          <article
                            key={
                              task.id
                            }
                            className={`kanban-task-card ${
                              draggingTaskId ===
                              task.id
                                ? "dragging"
                                : ""
                            }`}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                              navigate(
                                `/tasks/${task.id}`
                              )
                            }
                            onKeyDown={(
                              event
                            ) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key ===
                                  " "
                              ) {
                                event.preventDefault();

                                navigate(
                                  `/tasks/${task.id}`
                                );
                              }
                            }}
                          >

                            {/* CARD TOP */}

                            <div className="task-card-top">
                              <div className="task-card-labels">
                                <span className="task-project-name">
                                  {
                                    task.project
                                  }
                                </span>

                                {overdue && (
                                  <span className="task-overdue-badge">
                                    عقب‌افتاده
                                  </span>
                                )}
                              </div>

                              <div
                                className="task-drag-handle"
                                draggable={
                                  updatingTaskId !==
                                  task.id
                                }
                                role="button"
                                tabIndex={0}
                                title="برای جابه‌جایی بکشید"
                                aria-label="جابه‌جایی وظیفه"
                                onClick={(
                                  event
                                ) =>
                                  event.stopPropagation()
                                }
                                onKeyDown={(
                                  event
                                ) =>
                                  event.stopPropagation()
                                }
                                onDragStart={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  handleDragStart(
                                    event,
                                    task.id
                                  );
                                }}
                                onDragEnd={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  handleDragEnd();
                                }}
                              >
                                <GripVertical
                                  size={17}
                                  strokeWidth={2}
                                />
                              </div>
                            </div>


                            {/* TITLE */}

                            <h3 className="task-card-title">
                              {
                                task.title
                              }
                            </h3>


                            {/* DEADLINE */}

                            {task.deadline && (
                              <div
                                className={`task-deadline ${
                                  overdue
                                    ? "task-deadline-overdue"
                                    : ""
                                }`}
                              >
                                مهلت:
                                {" "}
                                {new Date(
                                  `${task.deadline}T00:00:00`
                                ).toLocaleDateString(
                                  "fa-IR"
                                )}
                              </div>
                            )}


                            <div className="task-card-divider" />


                            {/* FOOTER */}

                            <div className="task-card-footer">
                              <div className="task-assignee-info">
                                <div className="task-assignee-avatar">
                                  <UserRound
                                    size={14}
                                    strokeWidth={2}
                                  />
                                </div>

                                <span className="task-assignee-name">
                                  {
                                    task.assignee
                                  }
                                </span>
                              </div>

                              <span
                                className={`task-priority task-priority-${task.priority}`}
                              >
                                {
                                  getPriorityLabel(
                                    task.priority
                                  )
                                }
                              </span>
                            </div>
                          </article>
                        );
                      }
                    )}


                    {/* EMPTY COLUMN */}

                    {columnTasks.length ===
                      0 && (
                      <div className="kanban-empty">
                        <span>
                          وظیفه‌ای در این بخش وجود ندارد.
                        </span>

                        {draggingTaskId && (
                          <small>
                            وظیفه را اینجا رها کنید
                          </small>
                        )}
                      </div>
                    )}
                  </div>


                  {/* DROP HINT */}

                  {activeColumn ===
                    column.key &&
                    draggingTaskId && (
                      <div className="kanban-drop-hint">
                        وظیفه را اینجا رها کنید
                      </div>
                    )}
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}


export default Tasks;
