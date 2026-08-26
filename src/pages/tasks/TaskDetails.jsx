import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

import "./TaskDetails.css";


const mockTasks = [
  {
    id: 1,
    title: "ایجاد ماژول پروفایل کاربران نهایی",
    project: "رابط کاربری",
    description:
      "طراحی و پیاده‌سازی صفحه پروفایل کاربران شامل اطلاعات شخصی، تصویر پروفایل و بخش ویرایش اطلاعات.",
    status: "todo",
    statusLabel: "در انتظار",
    priority: "medium",
    priorityLabel: "اولویت متوسط",
    assignee: "علی رضایی",
    deadline: "۱۴۰۵/۰۷/۱۵",
    estimatedHours: 10,
  },

  {
    id: 2,
    title: "تنظیم تست‌های واحد سیستم پرداخت",
    project: "تست تضمین کیفیت",
    description:
      "نوشتن تست‌های واحد برای بخش‌های اصلی سیستم پرداخت و بررسی سناریوهای خطا.",
    status: "todo",
    statusLabel: "در انتظار",
    priority: "low",
    priorityLabel: "اولویت پایین",
    assignee: "سارا محمدی",
    deadline: "۱۴۰۵/۰۷/۱۸",
    estimatedHours: 8,
  },

  {
    id: 3,
    title: "یکپارچه‌سازی متدهای پرداخت نقدی",
    project: "اتوماسیون مالی",
    description:
      "اتصال متدهای پرداخت نقدی به جریان اصلی ثبت پرداخت و بررسی پاسخ سرویس‌ها.",
    status: "doing",
    statusLabel: "در حال انجام",
    priority: "high",
    priorityLabel: "اولویت بالا",
    assignee: "رضا احمدی",
    deadline: "۱۴۰۵/۰۷/۱۲",
    estimatedHours: 14,
  },

  {
    id: 4,
    title: "اصلاح فرم ورود و استایل دکمه‌ها",
    project: "رابط کاربری",
    description:
      "اصلاح جزئیات رابط کاربری فرم ورود و هماهنگ کردن رنگ و اندازه دکمه‌ها.",
    status: "doing",
    statusLabel: "در حال انجام",
    priority: "high",
    priorityLabel: "اولویت بالا",
    assignee: "مریم حسینی",
    deadline: "۱۴۰۵/۰۷/۱۰",
    estimatedHours: 6,
  },

  {
    id: 5,
    title: "تنظیم ساختار دیتابیس لوکال",
    project: "پشتیبانی فنی",
    description:
      "تنظیم محیط محلی دیتابیس برای اجرای پروژه در سیستم توسعه.",
    status: "done",
    statusLabel: "تکمیل شده",
    priority: "low",
    priorityLabel: "اولویت پایین",
    assignee: "امیر کریمی",
    deadline: "۱۴۰۵/۰۷/۰۵",
    estimatedHours: 5,
  },

  {
    id: 6,
    title: "ارتقا پکیج‌های توسعه وب",
    project: "تکنولوژی",
    description:
      "بررسی و ارتقا پکیج‌های Frontend و اطمینان از سازگاری نسخه‌های جدید.",
    status: "done",
    statusLabel: "تکمیل شده",
    priority: "medium",
    priorityLabel: "اولویت متوسط",
    assignee: "نگار محمدی",
    deadline: "۱۴۰۵/۰۷/۰۸",
    estimatedHours: 4,
  },
];


const initialSubtasks = [
  {
    id: 1,
    title: "طراحی بخش اطلاعات شخصی",
    completed: true,
  },

  {
    id: 2,
    title: "پیاده‌سازی فرم ویرایش اطلاعات",
    completed: true,
  },

  {
    id: 3,
    title: "اضافه کردن بخش تصویر پروفایل",
    completed: false,
  },

  {
    id: 4,
    title: "بررسی Responsive صفحه",
    completed: false,
  },
];


function TaskDetails() {
  const { id } = useParams();

  const navigate = useNavigate();


  const task = mockTasks.find(
    (item) => item.id === Number(id)
  );


  const [subtasks, setSubtasks] =
    useState(initialSubtasks);

  const [newSubtask, setNewSubtask] =
    useState("");


  const completedSubtasks = useMemo(() => {
    return subtasks.filter(
      (subtask) => subtask.completed
    ).length;
  }, [subtasks]);


  const progress = useMemo(() => {
    if (subtasks.length === 0) {
      return 0;
    }

    return Math.round(
      (completedSubtasks / subtasks.length) * 100
    );
  }, [
    completedSubtasks,
    subtasks.length,
  ]);


  const toggleSubtask = (subtaskId) => {
    setSubtasks((previousSubtasks) =>
      previousSubtasks.map((subtask) =>
        subtask.id === subtaskId
          ? {
              ...subtask,
              completed: !subtask.completed,
            }
          : subtask
      )
    );
  };


  const addSubtask = (event) => {
    event.preventDefault();

    const title = newSubtask.trim();

    if (!title) {
      return;
    }


    const newItem = {
      id: Date.now(),
      title,
      completed: false,
    };


    setSubtasks((previousSubtasks) => [
      ...previousSubtasks,
      newItem,
    ]);

    setNewSubtask("");
  };


  const removeSubtask = (subtaskId) => {
    setSubtasks((previousSubtasks) =>
      previousSubtasks.filter(
        (subtask) =>
          subtask.id !== subtaskId
      )
    );
  };


  if (!task) {
    return (
      <section className="task-details-page">

        <div className="task-not-found">

          <ListChecks size={40} />

          <h2>
            وظیفه پیدا نشد
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/tasks")
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

      {/* =========================
          TOP
      ========================== */}

      <div className="task-details-top">

        <div>

          <span className="task-details-project">
            {task.project}
          </span>

          <h2>
            {task.title}
          </h2>

        </div>


        <button
          type="button"
          className="task-details-back-button"
          onClick={() =>
            navigate("/tasks")
          }
        >

          <ArrowRight size={18} />

          بازگشت به برد وظایف

        </button>

      </div>


      {/* =========================
          MAIN GRID
      ========================== */}

      <div className="task-details-grid">

        {/* =========================
            MAIN CONTENT
        ========================== */}

        <div className="task-details-main">

          {/* DESCRIPTION */}

          <div className="task-details-card">

            <div className="task-details-card-header">

              <h3>
                توضیحات وظیفه
              </h3>

            </div>


            <p className="task-description">
              {task.description}
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


            {/* PROGRESS */}

            <div className="subtasks-progress-track">

              <div
                className="subtasks-progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>


            {/* ADD SUBTASK */}

            <form
              className="add-subtask-form"
              onSubmit={addSubtask}
            >

              <input
                type="text"
                value={newSubtask}
                onChange={(event) =>
                  setNewSubtask(
                    event.target.value
                  )
                }
                placeholder="عنوان زیر وظیفه جدید..."
              />


              <button type="submit">

                <Plus size={17} />

                افزودن

              </button>

            </form>


            {/* SUBTASK LIST */}

            <div className="subtasks-list">

              {subtasks.map((subtask) => (

                <div
                  className={
                    subtask.completed
                      ? "subtask-item completed"
                      : "subtask-item"
                  }
                  key={subtask.id}
                >

                  <button
                    type="button"
                    className="subtask-check-button"
                    onClick={() =>
                      toggleSubtask(
                        subtask.id
                      )
                    }
                    aria-label="تغییر وضعیت زیر وظیفه"
                  >

                    {subtask.completed ? (
                      <Check size={15} />
                    ) : (
                      <Circle size={15} />
                    )}

                  </button>


                  <span className="subtask-title">
                    {subtask.title}
                  </span>


                  <button
                    type="button"
                    className="remove-subtask-button"
                    onClick={() =>
                      removeSubtask(
                        subtask.id
                      )
                    }
                    aria-label="حذف زیر وظیفه"
                  >

                    <Trash2 size={15} />

                  </button>

                </div>

              ))}


              {subtasks.length === 0 && (

                <div className="subtasks-empty">
                  هنوز زیر وظیفه‌ای تعریف نشده است.
                </div>

              )}

            </div>

          </div>

        </div>


        {/* =========================
            LEFT SIDEBAR
        ========================== */}

        <aside className="task-details-sidebar">

          {/* TASK INFO */}

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
                {task.statusLabel}
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
                {task.priorityLabel}
              </span>

            </div>


            {/* ASSIGNEE */}

            <div className="task-info-row">

              <span className="task-info-label">
                مسئول
              </span>


              <div className="task-details-assignee">

                <div className="task-details-avatar">

                  <UserRound size={15} />

                </div>


                <strong>
                  {task.assignee}
                </strong>

              </div>

            </div>


            {/* DEADLINE */}

            <div className="task-info-row">

              <span className="task-info-label">
                مهلت انجام
              </span>


              <div className="task-meta-value">

                <CalendarDays size={16} />

                <strong>
                  {task.deadline}
                </strong>

              </div>

            </div>


            {/* ESTIMATED HOURS */}

            <div className="task-info-row">

              <span className="task-info-label">
                زمان تخمینی
              </span>


              <div className="task-meta-value">

                <Clock3 size={16} />

                <strong>
                  {task.estimatedHours}
                  {" "}
                  ساعت
                </strong>

              </div>

            </div>

          </div>


          {/* =========================
              PROGRESS
          ========================== */}

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
                  width: `${progress}%`,
                }}
              />

            </div>


            <small>
              پیشرفت براساس زیر وظیفه‌های انجام شده محاسبه می‌شود.
            </small>

          </div>


          {/* =========================
              EDIT TASK
          ========================== */}

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

                <Pencil size={17} />

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