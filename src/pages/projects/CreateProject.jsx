import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import DatePickerModule from "react-multi-date-picker";

const DatePicker =
  DatePickerModule?.default ?? DatePickerModule;

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  ArrowRight,
  Save,
  UploadCloud,
  FileText,
  X,
} from "lucide-react";

import "./CreateProject.css";


const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
  const fileName = file.name.toLowerCase();

  return ALLOWED_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension)
  );
}


function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}


function CreateProject() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);


  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      manager: "",
      budget: "",
      startDate: null,
      endDate: null,
    },
  });


  const startDate = watch("startDate");


  const handleFiles = (fileList) => {
    const selectedFiles = Array.from(fileList || []);

    if (!selectedFiles.length) {
      return;
    }


    const validFiles = [];
    const errorMessages = [];


    selectedFiles.forEach((file) => {

      if (!isAllowedFile(file)) {
        errorMessages.push(
          `فرمت فایل «${file.name}» مجاز نیست.`
        );

        return;
      }


      if (file.size > MAX_FILE_SIZE) {
        errorMessages.push(
          `حجم فایل «${file.name}» بیشتر از ۱۰ مگابایت است.`
        );

        return;
      }


      validFiles.push(file);
    });


    setDocuments((previousDocuments) => {

      const existingFiles = new Set(
        previousDocuments.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`
        )
      );


      const newFiles = validFiles.filter(
        (file) =>
          !existingFiles.has(
            `${file.name}-${file.size}-${file.lastModified}`
          )
      );


      return [
        ...previousDocuments,
        ...newFiles,
      ];
    });


    setFileError(errorMessages.join(" "));
  };


  const handleFileInputChange = (event) => {
    handleFiles(event.target.files);

    event.target.value = "";
  };


  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    handleFiles(event.dataTransfer.files);
  };


  const handleDragOver = (event) => {
    event.preventDefault();

    setIsDragging(true);
  };


  const handleDragLeave = () => {
    setIsDragging(false);
  };


  const removeDocument = (indexToRemove) => {
    setDocuments((previousDocuments) =>
      previousDocuments.filter(
        (_, index) => index !== indexToRemove
      )
    );
  };


  const onSubmit = (data) => {

    const projectData = {
      ...data,

      startDate:
        data.startDate?.format?.("YYYY/MM/DD") || null,

      endDate:
        data.endDate?.format?.("YYYY/MM/DD") || null,

      documents: documents.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    };


    console.log(
      "Create project:",
      projectData
    );


    /*
      بعداً وقتی API آماده شد:

      1. اطلاعات پروژه برای Backend ارسال می‌شود.
      2. پروژه ساخته می‌شود.
      3. فایل‌ها با API آپلود مستندات ارسال می‌شوند.
      4. کاربر وارد Project Details می‌شود.
    */
  };


  return (
    <section className="create-project-page">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="create-project-header">

        <div>
          <h2>
            ایجاد پروژه جدید
          </h2>

          <p>
            اطلاعات مورد نیاز برای ایجاد پروژه را وارد کنید.
          </p>
        </div>


        <button
          type="button"
          className="back-projects-button"
          onClick={() =>
            navigate("/projects")
          }
        >
          <ArrowRight size={18} />

          بازگشت به پروژه‌ها
        </button>

      </div>


      {/* =========================
          FORM CARD
      ========================== */}

      <div className="create-project-card">

        <form
          className="create-project-form"
          onSubmit={handleSubmit(onSubmit)}
        >

          {/* =========================
              TITLE
          ========================== */}

          <div className="project-form-group project-form-full">

            <label>
              عنوان پروژه
              <span>*</span>
            </label>


            <input
              type="text"
              placeholder="مثلاً طراحی سایت شرکت"
              {...register("title", {

                required:
                  "عنوان پروژه الزامی است",

                minLength: {
                  value: 3,

                  message:
                    "عنوان پروژه حداقل باید ۳ کاراکتر باشد",
                },

              })}
            />


            {errors.title && (
              <small className="project-form-error">
                {errors.title.message}
              </small>
            )}

          </div>


          {/* =========================
              DESCRIPTION
          ========================== */}

          <div className="project-form-group project-form-full">

            <label>
              توضیحات پروژه
            </label>


            <textarea
              rows="5"
              placeholder="توضیح کوتاهی درباره اهداف و جزئیات پروژه وارد کنید..."
              {...register("description")}
            />

          </div>


          {/* =========================
              MANAGER
          ========================== */}

          <div className="project-form-group">

            <label>
              مدیر پروژه
              <span>*</span>
            </label>


            <select
              defaultValue=""
              {...register("manager", {

                required:
                  "انتخاب مدیر پروژه الزامی است",

              })}
            >

              <option
                value=""
                disabled
              >
                مدیر پروژه را انتخاب کنید
              </option>

              <option value="1">
                علیرضا نوری
              </option>

              <option value="2">
                سهراب سپهری
              </option>

              <option value="3">
                رویا رضایی
              </option>

              <option value="4">
                آرش کمالگیر
              </option>

            </select>


            {errors.manager && (
              <small className="project-form-error">
                {errors.manager.message}
              </small>
            )}

          </div>


          {/* =========================
              BUDGET
          ========================== */}

          <div className="project-form-group">

            <label>
              بودجه پروژه
            </label>


            <input
              type="number"
              min="0"
              placeholder="مثلاً 500000000"
              {...register("budget", {

                min: {
                  value: 0,

                  message:
                    "بودجه نمی‌تواند منفی باشد",
                },

              })}
            />


            {errors.budget && (
              <small className="project-form-error">
                {errors.budget.message}
              </small>
            )}

          </div>


          {/* =========================
              START DATE - PERSIAN
          ========================== */}

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
              render={({ field }) => (

                <DatePicker
                  value={field.value}
                  onChange={field.onChange}

                  calendar={persian}
                  locale={persian_fa}

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
                {errors.startDate.message}
              </small>
            )}

          </div>


          {/* =========================
              END DATE - PERSIAN
          ========================== */}

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

                validate: (value) => {

                  const currentStartDate =
                    getValues("startDate");


                  if (
                    !currentStartDate ||
                    !value
                  ) {
                    return true;
                  }


                  const startTimestamp =
                    currentStartDate
                      .toDate()
                      .getTime();


                  const endTimestamp =
                    value
                      .toDate()
                      .getTime();


                  return (
                    endTimestamp >= startTimestamp ||
                    "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد"
                  );
                },

              }}

              render={({ field }) => (

                <DatePicker
                  value={field.value}
                  onChange={field.onChange}

                  calendar={persian}
                  locale={persian_fa}

                  format="YYYY/MM/DD"

                  minDate={
                    startDate || undefined
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
                {errors.endDate.message}
              </small>
            )}

          </div>


          {/* =========================
              DOCUMENTS
          ========================== */}

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

              onDragOver={handleDragOver}

              onDragLeave={handleDragLeave}

              onDrop={handleDrop}

              role="button"

              tabIndex={0}

              onKeyDown={(event) => {

                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {

                  fileInputRef.current?.click();

                }

              }}
            >

              <UploadCloud
                size={34}
                strokeWidth={1.7}
              />


              <strong>
                فایل‌ها را اینجا رها کنید
                یا برای انتخاب کلیک کنید
              </strong>


              <span>
                PDF، Word، Excel، تصویر یا ZIP
                — حداکثر ۱۰ مگابایت برای هر فایل
              </span>


              <input
                ref={fileInputRef}

                type="file"

                multiple

                className="documents-file-input"

                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"

                onChange={handleFileInputChange}
              />

            </div>


            {fileError && (
              <small className="project-form-error">
                {fileError}
              </small>
            )}


            {documents.length > 0 && (

              <div className="uploaded-documents">

                {documents.map(
                  (file, index) => (

                    <div
                      className="uploaded-document"
                      key={`${file.name}-${file.size}-${index}`}
                    >

                      <div className="uploaded-document-info">

                        <div className="uploaded-document-icon">
                          <FileText size={19} />
                        </div>


                        <div>
                          <strong>
                            {file.name}
                          </strong>

                          <span>
                            {formatFileSize(
                              file.size
                            )}
                          </span>
                        </div>

                      </div>


                      <button
                        type="button"

                        className="remove-document-button"

                        onClick={() =>
                          removeDocument(index)
                        }

                        aria-label={`حذف ${file.name}`}
                      >
                        <X size={17} />
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* =========================
              ACTIONS
          ========================== */}

          <div className="project-form-actions">

            <button
              type="button"
              className="cancel-project-button"
              onClick={() =>
                navigate("/projects")
              }
            >
              انصراف
            </button>


            <button
              type="submit"
              className="save-project-button"
            >
              <Save size={18} />

              ایجاد پروژه
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}


export default CreateProject;