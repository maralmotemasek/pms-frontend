import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import DatePickerModule from "react-multi-date-picker";
import DateObject from "react-date-object";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  ArrowRight,
  Save,
  CalendarDays,
} from "lucide-react";

import "./CreateTask.css";


const DatePicker =
  DatePickerModule?.default ?? DatePickerModule;


const mockProjects = [
  {
    id: "1",
    title: "سامانه مدیریت پروژه",
  },
  {
    id: "2",
    title: "پرتال سازمانی",
  },
  {
    id: "3",
    title: "سیستم انبارداری",
  },
];


const mockMembers = [
  {
    id: "1",
    name: "علی رضایی",
  },
  {
    id: "2",
    name: "سارا محمدی",
  },
  {
    id: "3",
    name: "رضا احمدی",
  },
  {
    id: "4",
    name: "مریم حسینی",
  },
  {
    id: "5",
    name: "امیر کریمی",
  },
  {
    id: "6",
    name: "نگار محمدی",
  },
];


const mockTasks = [
  {
    id: 1,
    title: "ایجاد ماژول پروفایل کاربران نهایی",
    description:
      "طراحی و پیاده‌سازی صفحه پروفایل کاربران شامل اطلاعات شخصی، تصویر پروفایل و امکان ویرایش اطلاعات.",
    project: "1",
    assignee: "1",
    priority: "medium",
    status: "todo",
    deadline: "1405/07/15",
    estimatedHours: "10",
  },

  {
    id: 2,
    title: "تنظیم تست‌های واحد سیستم پرداخت",
    description:
      "نوشتن تست‌های واحد برای بخش‌های اصلی سیستم پرداخت.",
    project: "2",
    assignee: "2",
    priority: "low",
    status: "todo",
    deadline: "1405/07/18",
    estimatedHours: "8",
  },

  {
    id: 3,
    title: "یکپارچه‌سازی متدهای پرداخت نقدی",
    description:
      "اتصال متدهای پرداخت نقدی به جریان اصلی ثبت پرداخت.",
    project: "3",
    assignee: "3",
    priority: "high",
    status: "doing",
    deadline: "1405/07/12",
    estimatedHours: "14",
  },

  {
    id: 4,
    title: "اصلاح فرم ورود و استایل دکمه‌ها",
    description:
      "اصلاح رابط کاربری فرم ورود و هماهنگ کردن استایل دکمه‌ها.",
    project: "1",
    assignee: "4",
    priority: "high",
    status: "doing",
    deadline: "1405/07/10",
    estimatedHours: "6",
  },

  {
    id: 5,
    title: "تنظیم ساختار دیتابیس لوکال",
    description:
      "تنظیم محیط محلی دیتابیس برای اجرای پروژه.",
    project: "3",
    assignee: "5",
    priority: "low",
    status: "done",
    deadline: "1405/07/05",
    estimatedHours: "5",
  },

  {
    id: 6,
    title: "ارتقا پکیج‌های توسعه وب",
    description:
      "بررسی و ارتقا پکیج‌های Frontend.",
    project: "2",
    assignee: "6",
    priority: "medium",
    status: "done",
    deadline: "1405/07/08",
    estimatedHours: "4",
  },
];


function createPersianDate(date) {
  if (!date) {
    return null;
  }

  return new DateObject({
    date,
    format: "YYYY/MM/DD",
    calendar: persian,
    locale: persian_fa,
  });
}


function EditTask() {
  const { id } = useParams();

  const navigate = useNavigate();


  const task = mockTasks.find(
    (item) => item.id === Number(id)
  );


  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      project: task?.project || "",
      assignee: task?.assignee || "",
      priority: task?.priority || "medium",
      status: task?.status || "todo",
      deadline: createPersianDate(
        task?.deadline
      ),
      estimatedHours:
        task?.estimatedHours || "",
    },
  });


  const onSubmit = (data) => {
    const updatedTask = {
      id: Number(id),

      ...data,

      deadline:
        data.deadline?.format?.(
          "YYYY/MM/DD"
        ) || null,
    };


    console.log(
      "Update Task:",
      updatedTask
    );


    /*
      بعداً وقتی API آماده شد:

      await updateTask(id, updatedTask)

      navigate(`/tasks/${id}`)
    */
  };


  if (!task) {
    return (
      <section className="create-task-page">

        <div className="create-task-card">

          <h2>
            وظیفه مورد نظر پیدا نشد.
          </h2>


          <button
            type="button"
            className="back-to-tasks-button"
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
    <section className="create-task-page">

      {/* HEADER */}

      <div className="create-task-header">

        <div>

          <h2>
            ویرایش وظیفه
          </h2>

          <p>
            اطلاعات وظیفه را ویرایش کرده و تغییرات را ذخیره کنید.
          </p>

        </div>


        <button
          type="button"
          className="back-to-tasks-button"
          onClick={() =>
            navigate(`/tasks/${id}`)
          }
        >

          <ArrowRight size={18} />

          بازگشت به جزئیات وظیفه

        </button>

      </div>


      {/* FORM */}

      <div className="create-task-card">

        <form
          className="create-task-form"
          onSubmit={handleSubmit(onSubmit)}
        >

          {/* TITLE */}

          <div className="task-form-group task-form-full">

            <label>
              عنوان وظیفه
              <span>*</span>
            </label>


            <input
              type="text"

              {...register("title", {
                required:
                  "عنوان وظیفه الزامی است",

                minLength: {
                  value: 3,

                  message:
                    "عنوان وظیفه حداقل باید ۳ کاراکتر باشد",
                },
              })}
            />


            {errors.title && (
              <small className="task-form-error">
                {errors.title.message}
              </small>
            )}

          </div>


          {/* DESCRIPTION */}

          <div className="task-form-group task-form-full">

            <label>
              توضیحات وظیفه
            </label>


            <textarea
              rows="5"
              {...register("description")}
            />

          </div>


          {/* PROJECT */}

          <div className="task-form-group">

            <label>
              پروژه
              <span>*</span>
            </label>


            <select
              {...register("project", {
                required:
                  "انتخاب پروژه الزامی است",
              })}
            >

              <option value="">
                پروژه را انتخاب کنید
              </option>


              {mockProjects.map(
                (project) => (

                  <option
                    value={project.id}
                    key={project.id}
                  >
                    {project.title}
                  </option>

                )
              )}

            </select>


            {errors.project && (
              <small className="task-form-error">
                {errors.project.message}
              </small>
            )}

          </div>


          {/* ASSIGNEE */}

          <div className="task-form-group">

            <label>
              مسئول انجام
              <span>*</span>
            </label>


            <select
              {...register("assignee", {
                required:
                  "انتخاب مسئول وظیفه الزامی است",
              })}
            >

              <option value="">
                مسئول وظیفه را انتخاب کنید
              </option>


              {mockMembers.map(
                (member) => (

                  <option
                    value={member.id}
                    key={member.id}
                  >
                    {member.name}
                  </option>

                )
              )}

            </select>


            {errors.assignee && (
              <small className="task-form-error">
                {errors.assignee.message}
              </small>
            )}

          </div>


          {/* PRIORITY */}

          <div className="task-form-group">

            <label>
              اولویت
              <span>*</span>
            </label>


            <select
              {...register("priority", {
                required:
                  "انتخاب اولویت الزامی است",
              })}
            >

              <option value="low">
                اولویت پایین
              </option>

              <option value="medium">
                اولویت متوسط
              </option>

              <option value="high">
                اولویت بالا
              </option>

            </select>

          </div>


          {/* STATUS */}

          <div className="task-form-group">

            <label>
              وضعیت
              <span>*</span>
            </label>


            <select
              {...register("status", {
                required:
                  "انتخاب وضعیت الزامی است",
              })}
            >

              <option value="todo">
                در انتظار
              </option>

              <option value="doing">
                در حال انجام
              </option>

              <option value="done">
                تکمیل شده
              </option>

            </select>

          </div>


          {/* DEADLINE */}

          <div className="task-form-group">

            <label>
              مهلت انجام
              <span>*</span>
            </label>


            <div className="task-date-wrapper">

              <CalendarDays
                size={17}
                className="task-date-icon"
              />


              <Controller
                name="deadline"

                control={control}

                rules={{
                  required:
                    "تعیین مهلت انجام الزامی است",
                }}

                render={({ field }) => (

                  <DatePicker
                    value={field.value}

                    onChange={
                      field.onChange
                    }

                    calendar={persian}

                    locale={persian_fa}

                    format="YYYY/MM/DD"

                    calendarPosition="bottom-right"

                    inputClass="task-persian-date-input"

                    containerClassName="task-persian-date-container"

                    placeholder="تاریخ را انتخاب کنید"
                  />

                )}
              />

            </div>


            {errors.deadline && (
              <small className="task-form-error">
                {errors.deadline.message}
              </small>
            )}

          </div>


          {/* HOURS */}

          <div className="task-form-group">

            <label>
              زمان تخمینی
            </label>


            <div className="estimated-hours-wrapper">

              <input
                type="number"

                min="0"

                {...register(
                  "estimatedHours",
                  {
                    min: {
                      value: 0,

                      message:
                        "زمان تخمینی نمی‌تواند منفی باشد",
                    },
                  }
                )}
              />


              <span>
                ساعت
              </span>

            </div>


            {errors.estimatedHours && (
              <small className="task-form-error">
                {
                  errors
                    .estimatedHours
                    .message
                }
              </small>
            )}

          </div>


          {/* ACTIONS */}

          <div className="task-form-actions">

            <button
              type="button"

              className="cancel-task-button"

              onClick={() =>
                navigate(`/tasks/${id}`)
              }
            >

              انصراف

            </button>


            <button
              type="submit"

              className="save-task-button"
            >

              <Save size={18} />

              ذخیره تغییرات

            </button>

          </div>

        </form>

      </div>

    </section>
  );
}


export default EditTask;