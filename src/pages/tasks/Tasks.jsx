import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Filter,
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

  const [tasks] = useState(initialTasks);

  const [priorityFilter, setPriorityFilter] =
    useState("all");


  const filteredTasks = useMemo(() => {

    if (priorityFilter === "all") {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.priority === priorityFilter
    );

  }, [tasks, priorityFilter]);


  const getTasksByStatus = (status) => {
    return filteredTasks.filter(
      (task) =>
        task.status === status
    );
  };


  return (
    <section className="tasks-page">

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


      <div className="kanban-board">

        {columns.map((column) => {

          const columnTasks =
            getTasksByStatus(column.key);


          return (
            <div
              className={`kanban-column kanban-column-${column.key}`}
              key={column.key}
            >

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


              <div className="kanban-column-content">

                {columnTasks.map((task) => (

                  <article
                    className="kanban-task-card"
                    key={task.id}
                  >

                    <span className="task-project-name">
                      {task.project}
                    </span>


                    <h3>
                      {task.title}
                    </h3>


                    <div className="task-card-divider" />


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


                {columnTasks.length === 0 && (

                  <div className="kanban-empty">
                    وظیفه‌ای در این بخش وجود ندارد.
                  </div>

                )}

              </div>

            </div>
          );

        })}

      </div>

    </section>
  );
}


export default Tasks;