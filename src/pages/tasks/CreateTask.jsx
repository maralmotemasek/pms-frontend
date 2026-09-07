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
} from "react-router-dom";

import DatePickerModule from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  ArrowRight,
  Save,
  CalendarDays,
} from "lucide-react";

import {
  createTask,
  getTaskOrganizations,
  getTaskProjects,
  getTaskProjectMembers,
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


const datePickerToGregorian =
  (value) => {

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

    return (
      `${year}-${month}-${day}`
    );
  };


const getOrganizationName =
  (organization) => {

    return (
      organization?.name ||
      organization?.title ||
      `سازمان #${organization?.id}`
    );
  };


const getProjectName =
  (project) => {

    return (
      project?.name ||
      project?.title ||
      `پروژه #${project?.id}`
    );
  };


const getMemberName =
  (member) => {

    return (
      member?.full_name ||
      member?.username ||
      (
        member?.user_id
          ? `کاربر #${member.user_id}`
          : "کاربر"
      )
    );
  };


function CreateTask() {
  const navigate =
    useNavigate();


  const [
    organizations,
    setOrganizations,
  ] = useState([]);


  const [
    projects,
    setProjects,
  ] = useState([]);


  const [
    members,
    setMembers,
  ] = useState([]);


  const [
    loadingOrganizations,
    setLoadingOrganizations,
  ] = useState(true);


  const [
    loadingProjects,
    setLoadingProjects,
  ] = useState(false);


  const [
    loadingMembers,
    setLoadingMembers,
  ] = useState(false);


  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const [
    apiError,
    setApiError,
  ] = useState("");


  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: {
      errors,
    },
  } = useForm({
    defaultValues: {
      organization: "",
      project: "",
      assignee: "",
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      deadline: null,
      estimatedHours: "",
    },
  });


  const selectedOrganization =
    watch(
      "organization"
    );


  const selectedProject =
    watch(
      "project"
    );


  // =========================
  // LOAD ORGANIZATIONS
  // =========================

  useEffect(() => {
    let active = true;

    const loadOrganizations =
      async () => {

        setLoadingOrganizations(
          true
        );

        setApiError("");

        try {
          const data =
            await getTaskOrganizations();

          if (!active) {
            return;
          }

          setOrganizations(
            data
          );
        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            "Failed to load organizations:",
            error
          );

          setApiError(
            getApiErrorMessage(
              error
            )
          );

          setOrganizations([]);
        } finally {
          if (active) {
            setLoadingOrganizations(
              false
            );
          }
        }
      };

    loadOrganizations();

    return () => {
      active = false;
    };
  }, []);


  // =========================
  // LOAD PROJECTS
  // =========================

  useEffect(() => {
    let active = true;

    setProjects([]);
    setMembers([]);

    setValue(
      "project",
      ""
    );

    setValue(
      "assignee",
      ""
    );

    if (
      !selectedOrganization
    ) {
      setLoadingProjects(
        false
      );

      return () => {
        active = false;
      };
    }

    const loadProjects =
      async () => {

        setLoadingProjects(
          true
        );

        setApiError("");

        try {
          const data =
            await getTaskProjects(
              selectedOrganization
            );

          if (!active) {
            return;
          }

          setProjects(
            data
          );
        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            "Failed to load projects:",
            error
          );

          setApiError(
            getApiErrorMessage(
              error
            )
          );

          setProjects([]);
        } finally {
          if (active) {
            setLoadingProjects(
              false
            );
          }
        }
      };

    loadProjects();

    return () => {
      active = false;
    };
  }, [
    selectedOrganization,
    setValue,
  ]);


  // =========================
  // LOAD PROJECT MEMBERS
  // =========================

  useEffect(() => {
    let active = true;

    setMembers([]);

    setValue(
      "assignee",
      ""
    );

    if (
      !selectedOrganization ||
      !selectedProject
    ) {
      setLoadingMembers(
        false
      );

      return () => {
        active = false;
      };
    }

    const loadMembers =
      async () => {

        setLoadingMembers(
          true
        );

        setApiError("");

        try {
          const data =
            await getTaskProjectMembers(
              selectedOrganization,
              selectedProject
            );

          if (!active) {
            return;
          }

          setMembers(
            data
          );
        } catch (error) {
          if (!active) {
            return;
          }

          console.error(
            "Failed to load project members:",
            error
          );

          setApiError(
            getApiErrorMessage(
              error
            )
          );

          setMembers([]);
        } finally {
          if (active) {
            setLoadingMembers(
              false
            );
          }
        }
      };

    loadMembers();

    return () => {
      active = false;
    };
  }, [
    selectedOrganization,
    selectedProject,
    setValue,
  ]);


  // =========================
  // CREATE TASK
  // =========================

  const onSubmit =
    async (data) => {

      setSubmitting(true);
      setApiError("");

      try {
        const organizationId =
          Number(
            data.organization
          );

        const projectId =
          Number(
            data.project
          );

        const deadline =
          datePickerToGregorian(
            data.deadline
          );

        const createdTask =
          await createTask(
            organizationId,
            projectId,
            {
              title:
                data.title,

              description:
                data.description,

              assigneeId:
                data.assignee
                  ? Number(
                      data.assignee
                    )
                  : null,

              priority:
                data.priority,

              status:
                data.status,

              progress:
                data.status ===
                  "done"
                  ? 100
                  : 0,

              dueDate:
                deadline,

              estimatedHours:
                data.estimatedHours
                  ? Number(
                      data.estimatedHours
                    )
                  : undefined,
            }
          );

        console.log(
          "Task created:",
          createdTask
        );

        navigate(
          "/tasks",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Create task failed:",
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


      {/* =========================
          ERROR
      ========================== */}

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


      {/* =========================
          FORM
      ========================== */}

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
              placeholder="مثلاً طراحی صفحه پروفایل کاربران"
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
              placeholder="توضیحات مربوط به وظیفه را وارد کنید..."
              {...register(
                "description"
              )}
            />

          </div>


          {/* ORGANIZATION */}

          <div className="task-form-group">

            <label>
              سازمان
              <span>*</span>
            </label>


            <select
              disabled={
                loadingOrganizations
              }
              {...register(
                "organization",
                {
                  required:
                    "انتخاب سازمان الزامی است",
                }
              )}
            >

              <option value="">
                {
                  loadingOrganizations
                    ? "در حال دریافت سازمان‌ها..."
                    : "سازمان را انتخاب کنید"
                }
              </option>


              {organizations.map(
                (
                  organization
                ) => (
                  <option
                    value={
                      organization.id
                    }
                    key={
                      organization.id
                    }
                  >
                    {
                      getOrganizationName(
                        organization
                      )
                    }
                  </option>
                )
              )}

            </select>


            {errors.organization && (
              <small className="task-form-error">
                {
                  errors
                    .organization
                    .message
                }
              </small>
            )}

          </div>


          {/* PROJECT */}

          <div className="task-form-group">

            <label>
              پروژه
              <span>*</span>
            </label>


            <select
              disabled={
                !selectedOrganization ||
                loadingProjects
              }
              {...register(
                "project",
                {
                  required:
                    "انتخاب پروژه الزامی است",
                }
              )}
            >

              <option value="">
                {
                  !selectedOrganization
                    ? "ابتدا سازمان را انتخاب کنید"
                    : loadingProjects
                    ? "در حال دریافت پروژه‌ها..."
                    : "پروژه را انتخاب کنید"
                }
              </option>


              {projects.map(
                (
                  project
                ) => (
                  <option
                    value={
                      project.id
                    }
                    key={
                      project.id
                    }
                  >
                    {
                      getProjectName(
                        project
                      )
                    }
                  </option>
                )
              )}

            </select>


            {errors.project && (
              <small className="task-form-error">
                {
                  errors.project
                    .message
                }
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
              disabled={
                !selectedProject ||
                loadingMembers
              }
              {...register(
                "assignee",
                {
                  required:
                    "انتخاب مسئول وظیفه الزامی است",
                }
              )}
            >

              <option value="">
                {
                  !selectedProject
                    ? "ابتدا پروژه را انتخاب کنید"
                    : loadingMembers
                    ? "در حال دریافت اعضای پروژه..."
                    : "مسئول وظیفه را انتخاب کنید"
                }
              </option>


              {members.map(
                (
                  member
                ) => (
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


            {errors.assignee && (
              <small className="task-form-error">
                {
                  errors.assignee
                    .message
                }
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

            </select>

          </div>


          {/* STATUS */}

          <div className="task-form-group">

            <label>
              وضعیت
              <span>*</span>
            </label>


            <select
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
              <span>*</span>
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

                rules={{
                  required:
                    "تعیین مهلت انجام الزامی است",
                }}

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


            {errors.deadline && (
              <small className="task-form-error">
                {
                  errors.deadline
                    .message
                }
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
                min="1"
                step="0.5"
                placeholder="مثلاً 8"
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
                  ? "در حال ایجاد..."
                  : "ایجاد وظیفه"
              }
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}


export default CreateTask;
