import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  createSubtask,
  deleteTask,
  getMyTasks,
  getProjectTasks,
  getSubtasks,
  getTask,
  getTaskOrganizations,
  getTaskProjects,
  updateTask,
} from "../../services/taskService";

import "./TaskDetails.css";


const statusLabels = {
  todo: "در انتظار",
  doing: "در حال انجام",
  review: "در حال بررسی",
  done: "تکمیل شده",
  cancelled: "لغو شده",
};


const priorityLabels = {
  low: "اولویت پایین",
  medium: "اولویت متوسط",
  high: "اولویت بالا",
  urgent: "فوری",
};


const getApiErrorMessage = (
  error
) => {
  const detail =
    error?.response?.data?.detail;

  if (
    typeof detail === "string"
  ) {
    return detail;
  }

  if (
    Array.isArray(detail)
  ) {
    return detail
      .map(
        (item) =>
          item?.msg
      )
      .filter(Boolean)
      .join(" - ");
  }

  return (
    error?.message ||
    "خطایی در ارتباط با سرور رخ داد."
  );
};


const getProjectName = (
  project
) => {
  return (
    project?.name ||
    project?.title ||
    `پروژه #${project?.id}`
  );
};


const formatDate = (
  date
) => {
  if (!date) {
    return "تعیین نشده";
  }

  const value =
    new Date(
      `${date}T00:00:00`
    );

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {
    return date;
  }

  return value.toLocaleDateString(
    "fa-IR"
  );
};


function TaskDetails() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const taskId =
    Number(id);


  const [
    task,
    setTask,
  ] = useState(null);

  const [
    taskOrganization,
    setTaskOrganization,
  ] = useState(null);

  const [
    taskProject,
    setTaskProject,
  ] = useState(null);

  const [
    subtasks,
    setSubtasks,
  ] = useState([]);

  const [
    newSubtask,
    setNewSubtask,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    addingSubtask,
    setAddingSubtask,
  ] = useState(false);

  const [
    workingSubtaskId,
    setWorkingSubtaskId,
  ] = useState(null);


  // =========================
  // LOAD TASK + CONTEXT
  // =========================

  useEffect(() => {
    let active = true;

    const loadTask =
      async () => {

        setLoading(true);
        setError("");

        try {
          if (
            !Number.isInteger(taskId) ||
            taskId <= 0
          ) {
            throw new Error(
              "شناسه وظیفه نامعتبر است."
            );
          }


          const organizations =
            await getTaskOrganizations();

          let resolvedOrganization =
            null;

          let resolvedProject =
            null;


          const myTasks =
            await getMyTasks();

          const taskSummary =
            myTasks.find(
              (item) =>
                Number(item.id) ===
                taskId
            ) || null;


          if (
            taskSummary?.projectId
          ) {
            for (
              const organization
              of organizations
            ) {
              const projects =
                await getTaskProjects(
                  organization.id
                );

              const matchingProject =
                projects.find(
                  (project) =>
                    Number(project.id) ===
                    Number(
                      taskSummary.projectId
                    )
                );

              if (
                matchingProject
              ) {
                resolvedOrganization =
                  organization;

                resolvedProject =
                  matchingProject;

                break;
              }
            }
          }


          if (
            !resolvedOrganization ||
            !resolvedProject
          ) {
            outer:
            for (
              const organization
              of organizations
            ) {
              const projects =
                await getTaskProjects(
                  organization.id
                );

              for (
                const project
                of projects
              ) {
                try {
                  const projectTasks =
                    await getProjectTasks(
                      organization.id,
                      project.id
                    );

                  const matchingTask =
                    projectTasks.find(
                      (item) =>
                        Number(item.id) ===
                        taskId
                    );

                  if (
                    matchingTask
                  ) {
                    resolvedOrganization =
                      organization;

                    resolvedProject =
                      project;

                    break outer;
                  }
                } catch (
                  projectTaskError
                ) {
                  console.warn(
                    "Could not inspect project while resolving task:",
                    projectTaskError
                  );
                }
              }
            }
          }


          if (
            !resolvedOrganization ||
            !resolvedProject
          ) {
            throw new Error(
              "پروژه مربوط به این وظیفه پیدا نشد."
            );
          }


          const [
            fullTask,
            taskSubtasks,
          ] = await Promise.all([
            getTask(
              resolvedOrganization.id,
              resolvedProject.id,
              taskId
            ),

            getSubtasks(
              resolvedOrganization.id,
              resolvedProject.id,
              taskId
            ),
          ]);


          if (!active) {
            return;
          }


          setTask(
            fullTask
          );

          setTaskOrganization(
            resolvedOrganization
          );

          setTaskProject(
            resolvedProject
          );

          setSubtasks(
            Array.isArray(
              taskSubtasks
            )
              ? taskSubtasks
              : []
          );

        } catch (loadError) {
          if (!active) {
            return;
          }

          console.error(
            "Failed to load task details:",
            loadError
          );

          setError(
            getApiErrorMessage(
              loadError
            )
          );

          setTask(null);
          setSubtasks([]);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };


    loadTask();


    return () => {
      active = false;
    };
  }, [
    taskId,
  ]);


  // =========================
  // SUBTASK PROGRESS
  // =========================

  const completedSubtasks =
    useMemo(
      () =>
        subtasks.filter(
          (subtask) =>
            subtask.status === "done"
        ).length,
      [
        subtasks,
      ]
    );


  const progress =
    useMemo(
      () => {
        if (
          subtasks.length === 0
        ) {
          return (
            Number(
              task?.progress
            ) || 0
          );
        }

        return Math.round(
          (
            completedSubtasks /
            subtasks.length
          ) * 100
        );
      },
      [
        completedSubtasks,
        subtasks.length,
        task?.progress,
      ]
    );


  // =========================
  // TOGGLE SUBTASK
  // =========================

  const toggleSubtask =
    async (
      subtask
    ) => {

      if (
        !taskOrganization ||
        !taskProject
      ) {
        return;
      }

      const nextStatus =
        subtask.status === "done"
          ? "todo"
          : "done";

      const nextProgress =
        nextStatus === "done"
          ? 100
          : 0;


      setWorkingSubtaskId(
        subtask.id
      );

      setError("");

      try {
        const updated =
          await updateTask(
            taskOrganization.id,
            taskProject.id,
            subtask.id,
            {
              status:
                nextStatus,

              progress:
                nextProgress,
            }
          );


        setSubtasks(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                subtask.id
                  ? updated
                  : item
            )
        );

      } catch (updateError) {
        console.error(
          "Failed to update subtask:",
          updateError
        );

        setError(
          getApiErrorMessage(
            updateError
          )
        );
      } finally {
        setWorkingSubtaskId(
          null
        );
      }
    };


  // =========================
  // CREATE SUBTASK
  // =========================

  const addSubtask =
    async (
      event
    ) => {

      event.preventDefault();

      const title =
        newSubtask.trim();

      if (
        !title ||
        !task ||
        !taskOrganization ||
        !taskProject
      ) {
        return;
      }


      setAddingSubtask(true);
      setError("");

      try {
        const created =
          await createSubtask(
            taskOrganization.id,
            taskProject.id,
            task.id,
            {
              title,

              description:
                null,

              status:
                "todo",

              priority:
                task.priority ||
                "medium",

              progress:
                0,

              assigneeId:
                task.assigneeId ??
                null,
            }
          );


        setSubtasks(
          (previous) => [
            ...previous,
            created,
          ]
        );

        setNewSubtask("");

      } catch (createError) {
        console.error(
          "Failed to create subtask:",
          createError
        );

        setError(
          getApiErrorMessage(
            createError
          )
        );
      } finally {
        setAddingSubtask(false);
      }
    };


  // =========================
  // DELETE SUBTASK
  // =========================

  const removeSubtask =
    async (
      subtaskId
    ) => {

      if (
        !taskOrganization ||
        !taskProject
      ) {
        return;
      }


      setWorkingSubtaskId(
        subtaskId
      );

      setError("");

      try {
        await deleteTask(
          taskOrganization.id,
          taskProject.id,
          subtaskId
        );


        setSubtasks(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                subtaskId
            )
        );

      } catch (deleteError) {
        console.error(
          "Failed to delete subtask:",
          deleteError
        );

        setError(
          getApiErrorMessage(
            deleteError
          )
        );
      } finally {
        setWorkingSubtaskId(
          null
        );
      }
    };


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <section className="task-details-page">
        <div className="task-not-found">

          <ListChecks
            size={40}
          />

          <h2>
            در حال دریافت اطلاعات وظیفه...
          </h2>

        </div>
      </section>
    );
  }


  // =========================
  // NOT FOUND
  // =========================

  if (!task) {
    return (
      <section className="task-details-page">

        <div className="task-not-found">

          <ListChecks
            size={40}
          />

          <h2>
            وظیفه پیدا نشد
          </h2>

          {error && (
            <p>
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/tasks"
              )
            }
          >
            بازگشت به وظایف
          </button>

        </div>

      </section>
    );
  }


  return (
    <section className="task-details-page">

      {/* TOP */}

      <div className="task-details-top">

        <div>

          <span className="task-details-project">
            {
              getProjectName(
                taskProject
              )
            }
          </span>

          <h2>
            {task.title}
          </h2>

        </div>


        <button
          type="button"
          className="task-details-back-button"
          onClick={() =>
            navigate(
              "/tasks"
            )
          }
        >
          <ArrowRight
            size={18}
          />

          بازگشت به برد وظایف
        </button>

      </div>


      {error && (
        <div
          className="task-not-found"
          role="alert"
          style={{
            marginBottom:
              "16px",
          }}
        >
          {error}
        </div>
      )}


      {/* MAIN GRID */}

      <div className="task-details-grid">

        {/* MAIN CONTENT */}

        <div className="task-details-main">

          {/* DESCRIPTION */}

          <div className="task-details-card">

            <div className="task-details-card-header">
              <h3>
                توضیحات وظیفه
              </h3>
            </div>

            <p className="task-description">
              {
                task.description ||
                "توضیحاتی برای این وظیفه ثبت نشده است."
              }
            </p>

          </div>


          {/* SUBTASKS */}

          <div className="task-details-card">

            <div className="task-details-card-header">

              <div>
                <h3>
                  زیر وظیفه‌ها
                </h3>

                <span>
                  {completedSubtasks}
                  {" "}
                  از
                  {" "}
                  {subtasks.length}
                  {" "}
                  مورد انجام شده
                </span>
              </div>


              <div className="subtask-progress-number">
                {progress}%
              </div>

            </div>


            <div className="subtasks-progress-track">
              <div
                className="subtasks-progress-fill"
                style={{
                  width:
                    `${progress}%`,
                }}
              />
            </div>


            {/* ADD SUBTASK */}

            <form
              className="add-subtask-form"
              onSubmit={
                addSubtask
              }
            >

              <input
                type="text"
                value={
                  newSubtask
                }
                disabled={
                  addingSubtask
                }
                onChange={(
                  event
                ) =>
                  setNewSubtask(
                    event.target.value
                  )
                }
                placeholder="عنوان زیر وظیفه جدید..."
              />


              <button
                type="submit"
                disabled={
                  addingSubtask ||
                  !newSubtask.trim()
                }
              >
                <Plus
                  size={17}
                />

                {
                  addingSubtask
                    ? "در حال افزودن..."
                    : "افزودن"
                }
              </button>

            </form>


            {/* SUBTASK LIST */}

            <div className="subtasks-list">

              {subtasks.map(
                (subtask) => {

                  const completed =
                    subtask.status ===
                    "done";

                  const working =
                    workingSubtaskId ===
                    subtask.id;

                  return (
                    <div
                      className={
                        completed
                          ? "subtask-item completed"
                          : "subtask-item"
                      }
                      key={
                        subtask.id
                      }
                    >

                      <button
                        type="button"
                        className="subtask-check-button"
                        disabled={
                          working
                        }
                        onClick={() =>
                          toggleSubtask(
                            subtask
                          )
                        }
                        aria-label="تغییر وضعیت زیر وظیفه"
                      >
                        {
                          completed
                            ? (
                              <Check
                                size={15}
                              />
                            )
                            : (
                              <Circle
                                size={15}
                              />
                            )
                        }
                      </button>


                      <span className="subtask-title">
                        {
                          subtask.title
                        }
                      </span>


                      <button
                        type="button"
                        className="remove-subtask-button"
                        disabled={
                          working
                        }
                        onClick={() =>
                          removeSubtask(
                            subtask.id
                          )
                        }
                        aria-label="حذف زیر وظیفه"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>

                    </div>
                  );
                }
              )}


              {subtasks.length ===
                0 && (
                <div className="subtasks-empty">
                  هنوز زیر وظیفه‌ای تعریف نشده است.
                </div>
              )}

            </div>

          </div>

        </div>


        {/* SIDEBAR */}

        <aside className="task-details-sidebar">

          <div className="task-details-card task-info-card">

            <h3>
              اطلاعات وظیفه
            </h3>


            {/* STATUS */}

            <div className="task-info-row">

              <span className="task-info-label">
                وضعیت
              </span>

              <span
                className={`task-details-status status-${task.status}`}
              >
                {
                  statusLabels[
                    task.status
                  ] ||
                  task.status
                }
              </span>

            </div>


            {/* PRIORITY */}

            <div className="task-info-row">

              <span className="task-info-label">
                اولویت
              </span>

              <span
                className={`task-details-priority priority-${task.priority}`}
              >
                {
                  priorityLabels[
                    task.priority
                  ] ||
                  task.priority
                }
              </span>

            </div>


            {/* ASSIGNEE */}

            <div className="task-info-row">

              <span className="task-info-label">
                مسئول
              </span>

              <div className="task-details-assignee">

                <div className="task-details-avatar">
                  <UserRound
                    size={15}
                  />
                </div>

                <strong>
                  {
                    task.assignee ||
                    "بدون مسئول"
                  }
                </strong>

              </div>

            </div>


            {/* DEADLINE */}

            <div className="task-info-row">

              <span className="task-info-label">
                مهلت انجام
              </span>

              <div className="task-meta-value">

                <CalendarDays
                  size={16}
                />

                <strong>
                  {
                    formatDate(
                      task.dueDate ||
                      task.deadline
                    )
                  }
                </strong>

              </div>

            </div>


            {/* ESTIMATED HOURS */}

            <div className="task-info-row">

              <span className="task-info-label">
                زمان تخمینی
              </span>

              <div className="task-meta-value">

                <Clock3
                  size={16}
                />

                <strong>
                  {
                    task.estimatedHours ===
                      "" ||
                    task.estimatedHours ===
                      null ||
                    task.estimatedHours ===
                      undefined
                      ? "تعیین نشده"
                      : `${task.estimatedHours} ساعت`
                  }
                </strong>

              </div>

            </div>

          </div>


          {/* PROGRESS */}

          <div className="task-details-card">

            <div className="task-progress-header">

              <span>
                پیشرفت وظیفه
              </span>

              <strong>
                {progress}%
              </strong>

            </div>

            <div className="task-details-progress-track">
              <div
                className="task-details-progress-fill"
                style={{
                  width:
                    `${progress}%`,
                }}
              />
            </div>

            <small>
              {
                subtasks.length > 0
                  ? "پیشرفت براساس زیر وظیفه‌های انجام شده محاسبه می‌شود."
                  : "مقدار پیشرفت ثبت‌شده برای وظیفه نمایش داده می‌شود."
              }
            </small>

          </div>


          {/* EDIT */}

          <div className="task-details-card task-edit-card">

            <div className="task-edit-card-content">

              <div>
                <h3>
                  ویرایش وظیفه
                </h3>

                <p>
                  اطلاعات، مسئول، اولویت و مهلت انجام وظیفه را ویرایش کنید.
                </p>
              </div>


              <button
                type="button"
                className="edit-task-button"
                onClick={() =>
                  navigate(
                    `/tasks/${id}/edit`
                  )
                }
              >
                <Pencil
                  size={17}
                />

                ویرایش وظیفه
              </button>

            </div>

          </div>

        </aside>

      </div>

    </section>
  );
}


export default TaskDetails;
