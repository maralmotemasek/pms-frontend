import {
  useEffect,
  useState,
} from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import DatePickerModule from "react-multi-date-picker";
import DateObject from "react-date-object";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  ArrowRight,
  Save,
  CalendarDays,
} from "lucide-react";

import {
  assignTask,
  getMyTasks,
  getProjectTasks,
  getTask,
  getTaskOrganizations,
  getTaskProjectMembers,
  getTaskProjects,
  updateTask,
} from "../../services/taskService";

import "./CreateTask.css";


const DatePicker =
  DatePickerModule?.default ??
  DatePickerModule;


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


const getOrganizationName = (
  organization
) => {
  return (
    organization?.name ||
    organization?.title ||
    `سازمان #${organization?.id}`
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


const getMemberName = (
  member
) => {
  return (
    member?.full_name ||
    member?.username ||
    member?.user?.full_name ||
    member?.user?.username ||
    (
      member?.user_id
        ? `کاربر #${member.user_id}`
        : "کاربر"
    )
  );
};


const createPersianDate = (
  value
) => {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return new DateObject({
    date,
  }).convert(
    persian,
    persian_fa
  );
};


const datePickerToGregorian = (
  value
) => {
  if (!value) {
    return null;
  }

  const date =
    value?.toDate?.();

  if (
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};


function EditTask() {
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
    members,
    setMembers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    apiError,
    setApiError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
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


  // =========================
  // FIND TASK CONTEXT
  // =========================

  useEffect(() => {
    let active = true;

    const loadTask =
      async () => {

        setLoading(true);
        setApiError("");

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

          let taskSummary =
            null;


          // First try the user's own task list.
          const myTasks =
            await getMyTasks();

          taskSummary =
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


          // Fallback for a task that is not in /users/me/tasks.
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
                    "Could not inspect project tasks while resolving task context:",
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
            projectMembers,
          ] = await Promise.all([
            getTask(
              resolvedOrganization.id,
              resolvedProject.id,
              taskId
            ),

            getTaskProjectMembers(
              resolvedOrganization.id,
              resolvedProject.id
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

          setMembers(
            Array.isArray(
              projectMembers
            )
              ? projectMembers
              : []
          );


          reset({
            title:
              fullTask.title || "",

            description:
              fullTask.description || "",

            project:
              String(
                resolvedProject.id
              ),

            assignee:
              fullTask.assigneeId ===
                null ||
              fullTask.assigneeId ===
                undefined
                ? ""
                : String(
                    fullTask.assigneeId
                  ),

            priority:
              fullTask.priority ||
              "medium",

            status:
              fullTask.status ||
              "todo",

            deadline:
              createPersianDate(
                fullTask.dueDate ||
                fullTask.deadline
              ),

            estimatedHours:
              fullTask.estimatedHours ===
                "" ||
              fullTask.estimatedHours ===
                null ||
              fullTask.estimatedHours ===
                undefined
                ? ""
                : String(
                    fullTask.estimatedHours
                  ),
          });

        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            "Failed to load task for editing:",
            error
          );

          setApiError(
            getApiErrorMessage(
              error
            )
          );

          setTask(null);
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
    reset,
  ]);


  // =========================
  // UPDATE TASK
  // =========================

  const onSubmit =
    async (data) => {

      if (
        !task ||
        !taskOrganization ||
        !taskProject
      ) {
        return;
      }

      setSubmitting(true);
      setApiError("");

      try {
        const deadline =
          datePickerToGregorian(
            data.deadline
          );


        await updateTask(
          taskOrganization.id,
          taskProject.id,
          taskId,
          {
            title:
              data.title,

            description:
              data.description,

            priority:
              data.priority,

            status:
              data.status,

            dueDate:
              deadline,

            estimatedHours:
              data.estimatedHours === ""
                ? null
                : Number(
                    data.estimatedHours
                  ),
          }
        );


        const nextAssigneeId =
          data.assignee
            ? Number(
                data.assignee
              )
            : null;

        const currentAssigneeId =
          task.assigneeId ??
          null;


        if (
          nextAssigneeId !==
          currentAssigneeId
        ) {
          await assignTask(
            taskOrganization.id,
            taskProject.id,
            taskId,
            nextAssigneeId
          );
        }


        navigate(
          "/tasks",
          {
            replace: true,
          }
        );

      } catch (error) {
        console.error(
          "Update task failed:",
          error
        );

        setApiError(
          getApiErrorMessage(
            error
          )
        );
      } finally {
        setSubmitting(false);
      }
    };


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <section className="create-task-page">
        <div className="create-task-card">
          <h2>
            در حال دریافت اطلاعات وظیفه...
          </h2>
        </div>
      </section>
    );
  }


  // =========================
  // NOT FOUND / ERROR
  // =========================

  if (!task) {
    return (
      <section className="create-task-page">
        <div className="create-task-card">

          <h2>
            وظیفه مورد نظر در دسترس نیست.
          </h2>

          {apiError && (
            <div
              className="task-form-error"
              role="alert"
            >
              {apiError}
            </div>
          )}

          <button
            type="button"
            className="back-to-tasks-button"
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
    <section className="create-task-page">

      {/* HEADER */}

      <div className="create-task-header">

        <div>
          <h2>
            ویرایش وظیفه
          </h2>

          <p>
            اطلاعات وظیفه را ویرایش کرده و تغییرات را در سرور ذخیره کنید.
          </p>
        </div>


        <button
          type="button"
          className="back-to-tasks-button"
          onClick={() =>
            navigate(
              "/tasks"
            )
          }
        >
          <ArrowRight
            size={18}
          />

          بازگشت به وظایف
        </button>

      </div>


      {apiError && (
        <div
          className="task-form-error"
          role="alert"
          style={{
            marginBottom:
              "16px",
          }}
        >
          {apiError}
        </div>
      )}


      {/* FORM */}

      <div className="create-task-card">

        <form
          className="create-task-form"
          onSubmit={
            handleSubmit(
              onSubmit
            )
          }
        >

          {/* TITLE */}

          <div className="task-form-group task-form-full">

            <label>
              عنوان وظیفه
              <span>*</span>
            </label>

            <input
              type="text"
              disabled={
                submitting
              }
              {...register(
                "title",
                {
                  required:
                    "عنوان وظیفه الزامی است",

                  minLength: {
                    value: 2,

                    message:
                      "عنوان وظیفه حداقل باید ۲ کاراکتر باشد",
                  },

                  maxLength: {
                    value: 200,

                    message:
                      "عنوان وظیفه حداکثر می‌تواند ۲۰۰ کاراکتر باشد",
                  },
                }
              )}
            />

            {errors.title && (
              <small className="task-form-error">
                {
                  errors.title
                    .message
                }
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
              disabled={
                submitting
              }
              {...register(
                "description"
              )}
            />

          </div>


          {/* ORGANIZATION */}

          <div className="task-form-group">

            <label>
              سازمان
            </label>

            <input
              type="text"
              value={
                getOrganizationName(
                  taskOrganization
                )
              }
              disabled
              readOnly
            />

          </div>


          {/* PROJECT */}

          <div className="task-form-group">

            <label>
              پروژه
            </label>

            <select
              disabled
              {...register(
                "project"
              )}
            >
              <option
                value={
                  taskProject.id
                }
              >
                {
                  getProjectName(
                    taskProject
                  )
                }
              </option>
            </select>

          </div>


          {/* ASSIGNEE */}

          <div className="task-form-group">

            <label>
              مسئول انجام
            </label>

            <select
              disabled={
                submitting
              }
              {...register(
                "assignee"
              )}
            >

              <option value="">
                بدون مسئول
              </option>

              {members.map(
                (member) => (
                  <option
                    value={
                      member.user_id
                    }
                    key={
                      member.id ??
                      member.user_id
                    }
                  >
                    {
                      getMemberName(
                        member
                      )
                    }
                  </option>
                )
              )}

            </select>

          </div>


          {/* PRIORITY */}

          <div className="task-form-group">

            <label>
              اولویت
              <span>*</span>
            </label>

            <select
              disabled={
                submitting
              }
              {...register(
                "priority",
                {
                  required:
                    "انتخاب اولویت الزامی است",
                }
              )}
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

              <option value="urgent">
                فوری
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
              disabled={
                submitting
              }
              {...register(
                "status",
                {
                  required:
                    "انتخاب وضعیت الزامی است",
                }
              )}
            >

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


          {/* DEADLINE */}

          <div className="task-form-group">

            <label>
              مهلت انجام
            </label>

            <div className="task-date-wrapper">

              <CalendarDays
                size={17}
                className="task-date-icon"
              />

              <Controller
                name="deadline"

                control={
                  control
                }

                render={({
                  field,
                }) => (
                  <DatePicker
                    value={
                      field.value
                    }

                    onChange={
                      field.onChange
                    }

                    disabled={
                      submitting
                    }

                    calendar={
                      persian
                    }

                    locale={
                      persian_fa
                    }

                    format="YYYY/MM/DD"

                    calendarPosition="bottom-right"

                    inputClass="task-persian-date-input"

                    containerClassName="task-persian-date-container"

                    placeholder="تاریخ را انتخاب کنید"
                  />
                )}
              />

            </div>

          </div>


          {/* ESTIMATED HOURS */}

          <div className="task-form-group">

            <label>
              زمان تخمینی
            </label>

            <div className="estimated-hours-wrapper">

              <input
                type="number"
                min="1"
                step="0.5"
                disabled={
                  submitting
                }
                {...register(
                  "estimatedHours",
                  {
                    min: {
                      value: 1,

                      message:
                        "زمان تخمینی باید حداقل یک ساعت باشد",
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
              disabled={
                submitting
              }
              onClick={() =>
                navigate(
                  "/tasks"
                )
              }
            >
              انصراف
            </button>


            <button
              type="submit"
              className="save-task-button"
              disabled={
                submitting
              }
            >
              <Save
                size={18}
              />

              {
                submitting
                  ? "در حال ذخیره..."
                  : "ذخیره تغییرات"
              }
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}


export default EditTask;
