import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Filter,
  GripVertical,
  Plus,
  UserRound,
} from "lucide-react";

import "./Tasks.css";


const initialTasks = [
  {
    id: 1,
    title: "ایجاد ماژول پروفایل کاربران نهایی",
    project: "رابط کاربری",
    status: "todo",
    priority: "medium",
    priorityLabel: "اولویت متوسط",
    assignee: "علی رضایی",
  },

  {
    id: 2,
    title: "تنظیم تست‌های واحد سیستم پرداخت",
    project: "تست تضمین کیفیت",
    status: "todo",
    priority: "low",
    priorityLabel: "اولویت پایین",
    assignee: "سارا محمدی",
  },

  {
    id: 3,
    title: "یکپارچه‌سازی متدهای پرداخت نقدی",
    project: "اتوماسیون مالی",
    status: "doing",
    priority: "high",
    priorityLabel: "اولویت بالا",
    assignee: "رضا احمدی",
  },

  {
    id: 4,
    title: "اصلاح فرم ورود و استایل دکمه‌ها",
    project: "رابط کاربری",
    status: "doing",
    priority: "high",
    priorityLabel: "اولویت بالا",
    assignee: "مریم حسینی",
  },

  {
    id: 5,
    title: "تنظیم ساختار دیتابیس لوکال",
    project: "پشتیبانی فنی",
    status: "done",
    priority: "low",
    priorityLabel: "اولویت پایین",
    assignee: "امیر کریمی",
  },

  {
    id: 6,
    title: "ارتقا پکیج‌های توسعه وب",
    project: "تکنولوژی",
    status: "done",
    priority: "medium",
    priorityLabel: "اولویت متوسط",
    assignee: "نگار محمدی",
  },
];


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
    key: "done",
    title: "تکمیل شده",
    englishTitle: "Done",
  },
];


function Tasks() {
  const navigate = useNavigate();


  const [tasks, setTasks] =
    useState(initialTasks);

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [draggingTaskId, setDraggingTaskId] =
    useState(null);

  const [activeColumn, setActiveColumn] =
    useState(null);


  /* =========================
     FILTER TASKS
  ========================== */

  const filteredTasks = useMemo(() => {
    if (priorityFilter === "all") {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.priority === priorityFilter
    );
  }, [
    tasks,
    priorityFilter,
  ]);


  const getTasksByStatus = (status) => {
    return filteredTasks.filter(
      (task) =>
        task.status === status
    );
  };


  /* =========================
     DRAG START
  ========================== */

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


  /* =========================
     DRAG END
  ========================== */

  const handleDragEnd = () => {
    setDraggingTaskId(null);

    setActiveColumn(null);
  };


  /* =========================
     DRAG OVER
  ========================== */

  const handleDragOver = (
    event,
    columnStatus
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";

    setActiveColumn(columnStatus);
  };


  /* =========================
     DROP TASK
  ========================== */

  const handleDrop = (
    event,
    newStatus
  ) => {
    event.preventDefault();


    const droppedTaskId = Number(
      event.dataTransfer.getData(
        "text/plain"
      )
    );


    if (!droppedTaskId) {
      setDraggingTaskId(null);
      setActiveColumn(null);

      return;
    }


    setTasks((previousTasks) =>
      previousTasks.map((task) => {
        if (
          task.id !== droppedTaskId
        ) {
          return task;
        }


        return {
          ...task,
          status: newStatus,
        };
      })
    );


    setDraggingTaskId(null);

    setActiveColumn(null);


    /*
      بعداً وقتی API آماده شد:

      await updateTaskStatus(
        droppedTaskId,
        newStatus
      )
    */
  };


  return (
    <section className="tasks-page">

      {/* =========================
          TOOLBAR
      ========================== */}

      <div className="kanban-toolbar">

        <div className="kanban-toolbar-right">

          <span className="kanban-toolbar-title">
            برد کانبان پروژه
          </span>


          <div className="kanban-filter">

            <Filter size={16} />


            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                فیلتر بر اساس اولویت
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

        </div>


        <button
          type="button"
          className="add-task-button"
          onClick={() =>
            navigate("/tasks/create")
          }
        >

          <Plus size={18} />

          افزودن وظیفه جدید

        </button>

      </div>


      {/* =========================
          KANBAN BOARD
      ========================== */}

      <div className="kanban-board">

        {columns.map((column) => {

          const columnTasks =
            getTasksByStatus(
              column.key
            );


          return (
            <div
              key={column.key}

              className={
                activeColumn === column.key
                  ? `kanban-column kanban-column-${column.key} drag-over`
                  : `kanban-column kanban-column-${column.key}`
              }

              onDragOver={(event) =>
                handleDragOver(
                  event,
                  column.key
                )
              }

              onDragEnter={(event) => {
                event.preventDefault();

                setActiveColumn(
                  column.key
                );
              }}

              onDragLeave={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget
                  )
                ) {
                  setActiveColumn(null);
                }
              }}

              onDrop={(event) =>
                handleDrop(
                  event,
                  column.key
                )
              }
            >

              {/* =========================
                  COLUMN HEADER
              ========================== */}

              <div className="kanban-column-header">

                <div className="kanban-column-title">

                  <span>
                    {column.title}
                  </span>

                  <strong>
                    ({column.englishTitle})
                  </strong>

                </div>


                <span
                  className={`kanban-count kanban-count-${column.key}`}
                >
                  {columnTasks.length}
                </span>

              </div>


              {/* =========================
                  TASK CARDS
              ========================== */}

              <div className="kanban-column-content">

                {columnTasks.map((task) => (

                  <article
                    key={task.id}

                    className={
                      draggingTaskId === task.id
                        ? "kanban-task-card dragging"
                        : "kanban-task-card"
                    }

                    onClick={() =>
                      navigate(
                        `/tasks/${task.id}`
                      )
                    }

                    role="button"

                    tabIndex={0}

                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter"
                      ) {
                        navigate(
                          `/tasks/${task.id}`
                        );
                      }
                    }}
                  >

                    {/* =========================
                        CARD TOP
                    ========================== */}

                    <div className="task-card-top">

                      <span className="task-project-name">
                        {task.project}
                      </span>


                      <div
                        className="task-drag-handle"

                        draggable

                        role="button"

                        tabIndex={0}

                        title="برای جابه‌جایی بکشید"

                        aria-label="جابه‌جایی وظیفه"

                        onClick={(event) =>
                          event.stopPropagation()
                        }

                        onKeyDown={(event) =>
                          event.stopPropagation()
                        }

                        onDragStart={(event) => {
                          event.stopPropagation();

                          handleDragStart(
                            event,
                            task.id
                          );
                        }}

                        onDragEnd={(event) => {
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


                    {/* =========================
                        TITLE
                    ========================== */}

                    <h3>
                      {task.title}
                    </h3>


                    <div className="task-card-divider" />


                    {/* =========================
                        FOOTER
                    ========================== */}

                    <div className="task-card-footer">

                      <div className="task-assignee-info">

                        <div className="task-assignee-avatar">

                          <UserRound
                            size={14}
                            strokeWidth={2}
                          />

                        </div>


                        <span className="task-assignee-name">
                          {task.assignee}
                        </span>

                      </div>


                      <span
                        className={`task-priority task-priority-${task.priority}`}
                      >
                        {task.priorityLabel}
                      </span>

                    </div>

                  </article>

                ))}


                {/* EMPTY COLUMN */}

                {columnTasks.length === 0 && (

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


              {/* =========================
                  DROP HINT
              ========================== */}

              {activeColumn === column.key &&
                draggingTaskId && (

                  <div className="kanban-drop-hint">
                    وظیفه را اینجا رها کنید
                  </div>

                )}

            </div>
          );

        })}

      </div>

    </section>
  );
}


export default Tasks;