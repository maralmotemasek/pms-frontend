import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import DatePickerModule from "react-multi-date-picker";
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


function CreateTask() {
  const navigate = useNavigate();


  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      project: "",
      assignee: "",
      priority: "medium",
      status: "todo",
      deadline: null,
      estimatedHours: "",
    },
  });


  const onSubmit = (data) => {
    const taskData = {
      ...data,

      deadline:
        data.deadline?.format?.("YYYY/MM/DD") || null,
    };


    console.log(
      "Create Task:",
      taskData
    );


    /*
      بعداً وقتی API آماده شد:

      await createTask(taskData)

      navigate("/tasks")
    */
  };


  return (
    <section className="create-task-page">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="create-task-header">

        <div>
          <h2>
            ایجاد وظیفه جدید
          </h2>

          <p>
            اطلاعات وظیفه را وارد کرده و مسئول و مهلت انجام آن را مشخص کنید.
          </p>
        </div>


        <button
          type="button"
          className="back-to-tasks-button"
          onClick={() =>
            navigate("/tasks")
          }
        >
          <ArrowRight size={18} />

          بازگشت به وظایف
        </button>

      </div>


      {/* =========================
          FORM
      ========================== */}

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
              placeholder="مثلاً طراحی صفحه پروفایل کاربران"
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
              placeholder="توضیحات مربوط به وظیفه را وارد کنید..."
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


              {mockProjects.map((project) => (

                <option
                  value={project.id}
                  key={project.id}
                >
                  {project.title}
                </option>

              ))}

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


              {mockMembers.map((member) => (

                <option
                  value={member.id}
                  key={member.id}
                >
                  {member.name}
                </option>

              ))}

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

                    onChange={field.onChange}

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


          {/* ESTIMATED HOURS */}

          <div className="task-form-group">

            <label>
              زمان تخمینی
            </label>


            <div className="estimated-hours-wrapper">

              <input
                type="number"
                min="0"
                placeholder="مثلاً 8"
                {...register("estimatedHours", {
                  min: {
                    value: 0,
                    message:
                      "زمان تخمینی نمی‌تواند منفی باشد",
                  },
                })}
              />

              <span>
                ساعت
              </span>

            </div>


            {errors.estimatedHours && (
              <small className="task-form-error">
                {errors.estimatedHours.message}
              </small>
            )}

          </div>


          {/* ACTIONS */}

          <div className="task-form-actions">

            <button
              type="button"
              className="cancel-task-button"
              onClick={() =>
                navigate("/tasks")
              }
            >
              انصراف
            </button>


            <button
              type="submit"
              className="save-task-button"
            >
              <Save size={18} />

              ایجاد وظیفه
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}


export default CreateTask;