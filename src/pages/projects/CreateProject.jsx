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
} from "../../data/projectMockData";

import {
  canCreateProject,
} from "../../utils/projectPermissions";

import "./CreateProject.css";


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


function CreateProject() {
  const navigate =
    useNavigate();


  const fileInputRef =
    useRef(null);


  const successTimerRef =
    useRef(null);


  const [
    documents,
    setDocuments,
  ] = useState([]);


  const [
    fileError,
    setFileError,
  ] = useState("");


  const [
    isDragging,
    setIsDragging,
  ] = useState(false);


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
      title: "",
      description: "",
      budget: "",
      startDate: null,
      endDate: null,
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

    const errorMessages = [];


    selectedFiles.forEach(
      (file) => {

        if (
          !isAllowedFile(file)
        ) {
          errorMessages.push(
            `فرمت فایل «${file.name}» مجاز نیست.`
          );

          return;
        }


        if (
          file.size >
          MAX_FILE_SIZE
        ) {
          errorMessages.push(
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
      ) => {

        const existingFiles =
          new Set(
            previousDocuments.map(
              (file) =>
                `${file.name}-${file.size}-${file.lastModified}`
            )
          );


        const newFiles =
          validFiles.filter(
            (file) =>
              !existingFiles.has(
                `${file.name}-${file.size}-${file.lastModified}`
              )
          );


        return [
          ...previousDocuments,
          ...newFiles,
        ];
      }
    );


    setFileError(
      errorMessages.join(" ")
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
        "پروژه با موفقیت ایجاد شد."
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


  const onSubmit = async (
    data
  ) => {
    const projectData = {
      title:
        data.title,

      description:
        data.description,

      budget:
        data.budget,

      startDate:
        data.startDate
          ?.format?.(
            "YYYY/MM/DD"
          ) || null,

      endDate:
        data.endDate
          ?.format?.(
            "YYYY/MM/DD"
          ) || null,

      documents:
        documents.map(
          (file) => ({
            name:
              file.name,

            size:
              file.size,

            type:
              file.type,
          })
        ),
    };


    console.log(
      "Create Project:",
      projectData
    );


    /*
      فعلاً Mock است.

      بعداً وقتی Backend Project API آماده شد:

      POST /projects

      نکته مهم:
      اینجا هیچ PROJECT_MANAGER
      انتخاب نمی‌کنیم.

      مدیریت ProjectMember و Role
      در بخش Members انجام خواهد شد.
    */


    showSuccessMessage();
  };


  /*
    فعلاً فقط OWNER
    طبق مستند صریحاً
    Create Project دارد.
  */
  if (
    !canCreateProject(
      currentUser
    )
  ) {
    return (
      <section className="create-project-page">

        <div className="create-project-card">

          <h2>
            دسترسی غیرمجاز
          </h2>

          <p>
            شما اجازه ایجاد پروژه جدید را ندارید.
          </p>


          <button
            type="button"
            className="back-projects-button"
            onClick={() =>
              navigate("/projects")
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


  return (
    <section className="create-project-page">

      {/* =====================
          HEADER
      ====================== */}

      <div className="create-project-header">

        <div>

          <h2>
            ایجاد پروژه جدید
          </h2>

          <p>
            اطلاعات اولیه پروژه را وارد کنید.
          </p>

        </div>


        <button
          type="button"
          className="back-projects-button"
          onClick={() =>
            navigate("/projects")
          }
        >
          <ArrowRight
            size={18}
          />

          بازگشت به پروژه‌ها
        </button>

      </div>


      {/* =====================
          FORM
      ====================== */}

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
              placeholder="مثلاً طراحی سایت شرکت"
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
              placeholder="توضیح کوتاهی درباره اهداف و جزئیات پروژه وارد کنید..."
              {...register(
                "description"
              )}
            />

          </div>


          {/* BUDGET */}

          <div className="project-form-group project-form-full">

            <label>
              بودجه پروژه
            </label>


            <input
              type="number"
              min="0"
              placeholder="مثلاً 500000000"
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
                  placeholder="تاریخ شروع را انتخاب کنید"
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

                  const currentStartDate =
                    getValues(
                      "startDate"
                    );


                  if (
                    !currentStartDate ||
                    !value
                  ) {
                    return true;
                  }


                  return (
                    value
                      .toDate()
                      .getTime() >=
                      currentStartDate
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
                  placeholder="تاریخ پایان را انتخاب کنید"
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
              مستندات اولیه پروژه
            </label>


            <div
              className={
                isDragging
                  ? "documents-dropzone dragging"
                  : "documents-dropzone"
              }
              onClick={() =>
                fileInputRef.current?.click()
              }
              onDragOver={(
                event
              ) => {
                event.preventDefault();

                setIsDragging(
                  true
                );
              }}
              onDragLeave={() =>
                setIsDragging(
                  false
                )
              }
              onDrop={(
                event
              ) => {
                event.preventDefault();

                setIsDragging(
                  false
                );

                handleFiles(
                  event
                    .dataTransfer
                    .files
                );
              }}
            >

              <UploadCloud
                size={34}
                strokeWidth={1.7}
              />


              <strong>
                فایل‌ها را اینجا رها کنید یا برای انتخاب کلیک کنید
              </strong>


              <span>
                PDF، Word، Excel، تصویر یا ZIP — حداکثر ۱۰ مگابایت
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
                    file,
                    index
                  ) => (

                    <div
                      className="uploaded-document"
                      key={`${file.name}-${file.size}-${index}`}
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
                              file.name
                            }
                          </strong>

                          <span>
                            {
                              formatFileSize(
                                file.size
                              )
                            }
                          </span>

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
                  "/projects"
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

              ایجاد پروژه
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}


export default CreateProject;