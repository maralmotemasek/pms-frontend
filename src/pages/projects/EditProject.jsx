import {
  useEffect,
  useRef,
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

import persian from "react-date-object/calendars/persian";

import persian_fa from "react-date-object/locales/persian_fa";

import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Save,
  UploadCloud,
  X,
} from "lucide-react";

import {
  currentUser,
  mockProjects,
} from "../../data/projectMockData";

import {
  canEditProject,
  getProjectManager,
} from "../../utils/projectPermissions";

import "./CreateProject.css";
import "./EditProject.css";


const DatePicker =
  DatePickerModule?.default ??
  DatePickerModule;


const MAX_FILE_SIZE =
  10 * 1024 * 1024;


const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".zip",
];


function isAllowedFile(file) {
  const fileName =
    file.name.toLowerCase();


  return ALLOWED_EXTENSIONS.some(
    (extension) =>
      fileName.endsWith(
        extension
      )
  );
}


function formatFileSize(size) {
  if (!size) {
    return "";
  }


  if (size < 1024) {
    return `${size} B`;
  }


  if (
    size <
    1024 * 1024
  ) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }


  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}


function EditProject() {
  const navigate =
    useNavigate();


  const { id } =
    useParams();


  const fileInputRef =
    useRef(null);


  const successTimerRef =
    useRef(null);


  const project =
    mockProjects.find(
      (item) =>
        String(item.id) ===
        String(id)
    ) || null;


  const manager =
    project
      ? getProjectManager(
          project
        )
      : null;


  const [
    documents,
    setDocuments,
  ] = useState(
    project?.documents || []
  );


  const [
    fileError,
    setFileError,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    defaultValues: {
      title:
        project?.title || "",

      description:
        project?.description ||
        "",

      budget:
        project?.budget || "",

      startDate:
        project?.startDate ||
        null,

      endDate:
        project?.endDate ||
        null,
    },
  });


  const startDate =
    watch("startDate");


  useEffect(() => {
    return () => {
      if (
        successTimerRef.current
      ) {
        clearTimeout(
          successTimerRef.current
        );
      }
    };
  }, []);


  const handleFiles = (
    fileList
  ) => {
    const selectedFiles =
      Array.from(
        fileList || []
      );


    if (
      selectedFiles.length ===
      0
    ) {
      return;
    }


    const validFiles = [];

    const errorsList = [];


    selectedFiles.forEach(
      (file) => {

        if (
          !isAllowedFile(file)
        ) {
          errorsList.push(
            `فرمت فایل «${file.name}» مجاز نیست.`
          );

          return;
        }


        if (
          file.size >
          MAX_FILE_SIZE
        ) {
          errorsList.push(
            `حجم فایل «${file.name}» بیشتر از ۱۰ مگابایت است.`
          );

          return;
        }


        validFiles.push(file);
      }
    );


    setDocuments(
      (
        previousDocuments
      ) => [
        ...previousDocuments,
        ...validFiles,
      ]
    );


    setFileError(
      errorsList.join(" ")
    );
  };


  const removeDocument = (
    indexToRemove
  ) => {
    setDocuments(
      (
        previousDocuments
      ) =>
        previousDocuments.filter(
          (_, index) =>
            index !==
            indexToRemove
        )
    );
  };


  const showSuccessMessage =
    () => {

      setSuccessMessage(
        "تغییرات پروژه با موفقیت ثبت شد."
      );


      if (
        successTimerRef.current
      ) {
        clearTimeout(
          successTimerRef.current
        );
      }


      successTimerRef.current =
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
    };


  const getFormattedDate = (
    value
  ) => {
    if (!value) {
      return null;
    }


    if (
      typeof value ===
      "string"
    ) {
      return value;
    }


    if (
      typeof value.format ===
      "function"
    ) {
      return value.format(
        "YYYY/MM/DD"
      );
    }


    return null;
  };


  const onSubmit = async (
    data
  ) => {
    const updatedProject = {
      id:
        project.id,

      title:
        data.title,

      description:
        data.description,

      budget:
        data.budget,

      startDate:
        getFormattedDate(
          data.startDate
        ),

      endDate:
        getFormattedDate(
          data.endDate
        ),

      /*
        Manager در این صفحه
        تغییر نمی‌کند.

        مدیریت Roleها بعداً
        داخل Members انجام می‌شود.
      */
      projectManager:
        manager
          ? {
              userId:
                manager.userId,

              fullName:
                manager.fullName,
            }
          : null,

      documents:
        documents.map(
          (document) => ({
            name:
              document.name,

            size:
              document.size,

            type:
              document.type,

            isExisting:
              Boolean(
                document.isExisting
              ),
          })
        ),
    };


    console.log(
      "Update Project:",
      updatedProject
    );


    /*
      بعداً به API واقعی
      Update Project وصل می‌شود.
    */


    showSuccessMessage();
  };


  if (!project) {
    return (
      <section className="create-project-page">

        <div className="create-project-card">

          <h2>
            پروژه پیدا نشد
          </h2>

          <p>
            پروژه موردنظر وجود ندارد.
          </p>


          <button
            type="button"
            className="back-projects-button"
            onClick={() =>
              navigate(
                "/projects"
              )
            }
          >
            <ArrowRight
              size={18}
            />

            بازگشت به پروژه‌ها
          </button>

        </div>

      </section>
    );
  }


  if (
    !canEditProject(
      currentUser,
      project
    )
  ) {
    return (
      <section className="create-project-page">

        <div className="create-project-card">

          <h2>
            دسترسی غیرمجاز
          </h2>

          <p>
            شما اجازه ویرایش این پروژه را ندارید.
          </p>


          <button
            type="button"
            className="back-projects-button"
            onClick={() =>
              navigate(
                `/projects/${project.id}`
              )
            }
          >
            <ArrowRight
              size={18}
            />

            بازگشت به پروژه
          </button>

        </div>

      </section>
    );
  }


  return (
    <section className="create-project-page">

      {/* HEADER */}

      <div className="create-project-header">

        <div>

          <h2>
            ویرایش پروژه
          </h2>

          <p>
            اطلاعات پروژه را ویرایش کنید.
          </p>

        </div>


        <button
          type="button"
          className="back-projects-button"
          onClick={() =>
            navigate(
              `/projects/${project.id}`
            )
          }
        >
          <ArrowRight
            size={18}
          />

          بازگشت به پروژه
        </button>

      </div>


      <div className="create-project-card">

        <form
          className="create-project-form"
          onSubmit={handleSubmit(
            onSubmit
          )}
          noValidate
        >

          {/* TITLE */}

          <div className="project-form-group project-form-full">

            <label>
              عنوان پروژه
              <span>*</span>
            </label>


            <input
              type="text"
              {...register(
                "title",
                {
                  required:
                    "عنوان پروژه الزامی است",

                  minLength: {
                    value: 3,

                    message:
                      "عنوان پروژه حداقل باید ۳ کاراکتر باشد",
                  },
                }
              )}
            />


            {errors.title && (

              <small className="project-form-error">
                {
                  errors.title
                    .message
                }
              </small>

            )}

          </div>


          {/* DESCRIPTION */}

          <div className="project-form-group project-form-full">

            <label>
              توضیحات پروژه
            </label>


            <textarea
              rows="5"
              {...register(
                "description"
              )}
            />

          </div>


          {/* MANAGER - READ ONLY */}

          <div className="project-form-group">

            <label>
              مدیر فعلی پروژه
            </label>


            <input
              type="text"
              value={
                manager
                  ?.fullName ||
                "هنوز تعیین نشده"
              }
              disabled
              readOnly
            />


            <small>
              تغییر Role اعضا بعداً از بخش اعضای پروژه انجام می‌شود.
            </small>

          </div>


          {/* BUDGET */}

          <div className="project-form-group">

            <label>
              بودجه پروژه
            </label>


            <input
              type="number"
              min="0"
              {...register(
                "budget",
                {
                  min: {
                    value: 0,

                    message:
                      "بودجه نمی‌تواند منفی باشد",
                  },
                }
              )}
            />


            {errors.budget && (

              <small className="project-form-error">
                {
                  errors.budget
                    .message
                }
              </small>

            )}

          </div>


          {/* START DATE */}

          <div className="project-form-group">

            <label>
              تاریخ شروع
              <span>*</span>
            </label>


            <Controller
              name="startDate"
              control={control}
              rules={{
                required:
                  "تاریخ شروع الزامی است",
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
                  inputClass="persian-date-input"
                  containerClassName="persian-date-container"
                />

              )}
            />


            {errors.startDate && (

              <small className="project-form-error">
                {
                  errors.startDate
                    .message
                }
              </small>

            )}

          </div>


          {/* END DATE */}

          <div className="project-form-group">

            <label>
              تاریخ پایان
              <span>*</span>
            </label>


            <Controller
              name="endDate"
              control={control}
              rules={{
                required:
                  "تاریخ پایان الزامی است",

                validate: (
                  value
                ) => {

                  const start =
                    getValues(
                      "startDate"
                    );


                  if (
                    !value ||
                    !start
                  ) {
                    return true;
                  }


                  /*
                    اگر تاریخ‌ها هنوز String باشند
                    فعلاً Validation را رد نمی‌کنیم.

                    بعد از انتخاب مجدد DatePicker
                    هر دو DateObject خواهند بود.
                  */
                  if (
                    typeof value
                      .toDate !==
                      "function" ||
                    typeof start
                      .toDate !==
                      "function"
                  ) {
                    return true;
                  }


                  return (
                    value
                      .toDate()
                      .getTime() >=
                      start
                        .toDate()
                        .getTime() ||
                    "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد"
                  );
                },
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
                  minDate={
                    startDate ||
                    undefined
                  }
                  calendarPosition="bottom-right"
                  inputClass="persian-date-input"
                  containerClassName="persian-date-container"
                />

              )}
            />


            {errors.endDate && (

              <small className="project-form-error">
                {
                  errors.endDate
                    .message
                }
              </small>

            )}

          </div>


          {/* DOCUMENTS */}

          <div className="project-form-group project-form-full">

            <label>
              مستندات پروژه
            </label>


            <div
              className="documents-dropzone"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              <UploadCloud
                size={32}
              />

              <strong>
                افزودن فایل جدید
              </strong>


              <span>
                حداکثر حجم هر فایل ۱۰ مگابایت
              </span>


              <input
                ref={
                  fileInputRef
                }
                type="file"
                multiple
                className="documents-file-input"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                onChange={(
                  event
                ) => {

                  handleFiles(
                    event.target
                      .files
                  );


                  event.target.value =
                    "";
                }}
              />

            </div>


            {fileError && (

              <small className="project-form-error">
                {fileError}
              </small>

            )}


            {documents.length >
              0 && (

              <div className="uploaded-documents">

                {documents.map(
                  (
                    document,
                    index
                  ) => (

                    <div
                      className="uploaded-document"
                      key={`${document.name}-${index}`}
                    >

                      <div className="uploaded-document-info">

                        <div className="uploaded-document-icon">

                          <FileText
                            size={19}
                          />

                        </div>


                        <div>

                          <strong>
                            {
                              document.name
                            }
                          </strong>


                          {document.size && (

                            <span>
                              {
                                formatFileSize(
                                  document.size
                                )
                              }
                            </span>

                          )}

                        </div>

                      </div>


                      <button
                        type="button"
                        className="remove-document-button"
                        onClick={() =>
                          removeDocument(
                            index
                          )
                        }
                      >
                        <X
                          size={17}
                        />
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* SUCCESS */}

          {successMessage && (

            <div className="create-project-success">

              <CheckCircle2
                size={19}
              />

              <span>
                {
                  successMessage
                }
              </span>

            </div>

          )}


          {/* ACTIONS */}

          <div className="project-form-actions">

            <button
              type="button"
              className="cancel-project-button"
              onClick={() =>
                navigate(
                  `/projects/${project.id}`
                )
              }
            >
              انصراف
            </button>


            <button
              type="submit"
              className="save-project-button"
              disabled={
                isSubmitting
              }
            >
              <Save
                size={18}
              />

              ذخیره تغییرات
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}


export default EditProject;