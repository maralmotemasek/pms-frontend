import {
  useEffect,
  useMemo,
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
  Building2,
  FileText,
  Save,
  Search,
  Trash2,
  UploadCloud,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  getCurrentUser,
} from "../../../services/authService";

import {
  getMyOrganizations,
} from "../../../services/organizationService";

import {
  loadOrganizationMembers,
} from "../../../data/organizationUiMockData";

import {
  ORGANIZATION_ROLES,
  PROJECT_ROLES,
  PROJECT_ROLE_LABELS,
} from "../../../constants/roles";

import {
  createWorkspaceProject,
  getWorkspaceProjectById,
  updateWorkspaceProject,
} from "../../../data/projectWorkspaceStore";

import "../CreateProject.css";


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


function getOrganizationRole(
  organization,
  user
) {
  if (
    !organization ||
    !user
  ) {
    return null;
  }


  const members =
    loadOrganizationMembers(
      organization,
      user
    );


  return (
    members.find(
      (member) =>
        Number(
          member.user_id
        ) ===
        Number(user.id)
    )?.role || null
  );
}


function ProjectFormPage({
  mode = "create",
}) {
  const navigate =
    useNavigate();

  const {
    id,
  } = useParams();


  const isEditing =
    mode === "edit";


  const existingProject =
    isEditing
      ? getWorkspaceProjectById(
          id
        )
      : null;


  const fileInputRef =
    useRef(null);


  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);


  const [
    organizations,
    setOrganizations,
  ] = useState([]);


  const [
    loadingAccess,
    setLoadingAccess,
  ] = useState(true);


  const [
    selectedOrganizationId,
    setSelectedOrganizationId,
  ] = useState(
    existingProject
      ?.organizationId
      ? String(
          existingProject
            .organizationId
        )
      : ""
  );


  const [
    selectedMembers,
    setSelectedMembers,
  ] = useState(
    existingProject?.members ||
    []
  );


  const [
    memberSearch,
    setMemberSearch,
  ] = useState("");


  const [
    documents,
    setDocuments,
  ] = useState(
    existingProject?.documents ||
    []
  );


  const [
    fileError,
    setFileError,
  ] = useState("");


  const [
    formMessage,
    setFormMessage,
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
        existingProject?.title ||
        "",

      description:
        existingProject
          ?.description ||
        "",

      budget:
        existingProject?.budget ||
        "",

      startDate:
        existingProject
          ?.startDate ||
        null,

      endDate:
        existingProject
          ?.endDate ||
        null,
    },
  });


  const startDate =
    watch("startDate");


  useEffect(() => {
    const loadAccess =
      async () => {

        setLoadingAccess(true);


        try {
          const [
            user,
            organizationList,
          ] =
            await Promise.all([
              getCurrentUser(),
              getMyOrganizations(),
            ]);


          setCurrentUser(
            user
          );


          const allowedOrganizations =
            organizationList.filter(
              (organization) => {

                const role =
                  getOrganizationRole(
                    organization,
                    user
                  );


                return (
                  role ===
                    ORGANIZATION_ROLES.OWNER ||
                  role ===
                    ORGANIZATION_ROLES.ADMIN
                );
              }
            );


          setOrganizations(
            allowedOrganizations
          );


          if (
            !selectedOrganizationId &&
            allowedOrganizations
              .length === 1
          ) {
            setSelectedOrganizationId(
              String(
                allowedOrganizations[0]
                  .id
              )
            );
          }
        } catch (error) {
          console.error(
            "Project access error:",
            error
          );
        } finally {
          setLoadingAccess(false);
        }
      };


    loadAccess();
  }, []);


  const selectedOrganization =
    useMemo(
      () =>
        organizations.find(
          (organization) =>
            String(
              organization.id
            ) ===
            String(
              selectedOrganizationId
            )
        ) || null,
      [
        organizations,
        selectedOrganizationId,
      ]
    );


  const organizationMembers =
    useMemo(
      () => {

        if (
          !selectedOrganization ||
          !currentUser
        ) {
          return [];
        }


        return loadOrganizationMembers(
          selectedOrganization,
          currentUser
        );
      },
      [
        selectedOrganization,
        currentUser,
      ]
    );


  const availableMembers =
    useMemo(
      () => {

        const selectedIds =
          new Set(
            selectedMembers.map(
              (member) =>
                Number(
                  member.userId
                )
            )
          );


        const search =
          memberSearch
            .trim()
            .toLowerCase();


        return organizationMembers.filter(
          (member) => {

            if (
              selectedIds.has(
                Number(
                  member.user_id
                )
              )
            ) {
              return false;
            }


            if (!search) {
              return true;
            }


            return (
              member.username
                ?.toLowerCase()
                .includes(search) ||
              member.full_name
                ?.toLowerCase()
                .includes(search)
            );
          }
        );
      },
      [
        organizationMembers,
        selectedMembers,
        memberSearch,
      ]
    );


  const handleOrganizationChange =
    (event) => {

      setSelectedOrganizationId(
        event.target.value
      );

      setSelectedMembers([]);
      setMemberSearch("");
    };


  const addMember =
    (member) => {

      setSelectedMembers(
        (
          previousMembers
        ) => [
          ...previousMembers,
          {
            userId:
              member.user_id,

            fullName:
              member.full_name ||
              member.username,

            username:
              member.username ||
              "",

            role:
              PROJECT_ROLES.PR_MEMBER,
          },
        ]
      );
    };


  const removeMember =
    (userId) => {

      setSelectedMembers(
        (
          previousMembers
        ) =>
          previousMembers.filter(
            (member) =>
              Number(
                member.userId
              ) !==
              Number(userId)
          )
      );
    };


  const changeMemberRole =
    (
      userId,
      role
    ) => {

      setSelectedMembers(
        (
          previousMembers
        ) =>
          previousMembers.map(
            (member) =>
              Number(
                member.userId
              ) ===
              Number(userId)
                ? {
                    ...member,
                    role,
                  }
                : member
          )
      );
    };


  const handleFiles =
    (fileList) => {

      const selectedFiles =
        Array.from(
          fileList || []
        );


      const validFiles = [];

      const messages = [];


      selectedFiles.forEach(
        (file) => {

          if (
            !isAllowedFile(file)
          ) {
            messages.push(
              `فرمت فایل «${file.name}» مجاز نیست.`
            );

            return;
          }


          if (
            file.size >
            MAX_FILE_SIZE
          ) {
            messages.push(
              `حجم فایل «${file.name}» بیشتر از ۱۰ مگابایت است.`
            );

            return;
          }


          validFiles.push(
            file
          );
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
        messages.join(" ")
      );
    };


  const formatDate =
    (value) => {

      if (!value) {
        return null;
      }


      if (
        typeof value ===
        "string"
      ) {
        return value;
      }


      return (
        value.format?.(
          "YYYY/MM/DD"
        ) || null
      );
    };


  const onSubmit =
    async (data) => {

      setFormMessage("");


      if (
        !selectedOrganization
      ) {
        setFormMessage(
          "انتخاب سازمان الزامی است."
        );

        return;
      }


      const projectData = {
        organizationId:
          selectedOrganization.id,

        organizationName:
          selectedOrganization.name,

        title:
          data.title.trim(),

        description:
          data.description?.trim() ||
          "",

        budget:
          data.budget || "0",

        startDate:
          formatDate(
            data.startDate
          ),

        endDate:
          formatDate(
            data.endDate
          ),

        members:
          selectedMembers,

        documents:
          documents.map(
            (
              document,
              index
            ) => ({
              id:
                document.id ||
                `${Date.now()}-${index}`,

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


      let savedProject;


      if (isEditing) {
        savedProject =
          updateWorkspaceProject(
            existingProject.id,
            projectData
          );
      } else {
        savedProject =
          createWorkspaceProject(
            projectData
          );
      }


      setFormMessage(
        isEditing
          ? "تغییرات پروژه ذخیره شد."
          : "پروژه با موفقیت ایجاد شد."
      );


      setTimeout(() => {
        navigate(
          `/projects/${savedProject.id}`
        );
      }, 500);
    };


  if (
    isEditing &&
    !existingProject
  ) {
    return (
      <section className="create-project-page">

        <div className="create-project-card">
          پروژه موردنظر پیدا نشد.
        </div>

      </section>
    );
  }


  if (loadingAccess) {
    return (
      <section className="create-project-page">

        <div className="create-project-card">
          در حال بررسی دسترسی سازمان...
        </div>

      </section>
    );
  }


  if (
    organizations.length ===
    0
  ) {
    return (
      <section className="create-project-page">

        <div className="create-project-card">

          <h2>
            دسترسی ایجاد پروژه ندارید
          </h2>

          <p>
            برای ایجاد یا مدیریت پروژه باید مالک یا مدیر یک سازمان باشید.
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
            بازگشت
          </button>

        </div>

      </section>
    );
  }


  return (
    <section className="create-project-page">

      <div className="create-project-header">

        <div>
          <h2>
            {isEditing
              ? "ویرایش پروژه"
              : "ایجاد پروژه جدید"}
          </h2>

          <p>
            پروژه را به سازمان متصل کنید و اعضای تیم را با نقش پروژه‌ای مشخص کنید.
          </p>
        </div>


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


      <div className="create-project-card">

        <form
          className="create-project-form"
          onSubmit={handleSubmit(
            onSubmit
          )}
          noValidate
        >

          <div className="project-form-group project-form-full">

            <label>
              سازمان
              <span>*</span>
            </label>


            <div className="project-organization-select">

              <Building2
                size={19}
              />

              <select
                value={
                  selectedOrganizationId
                }
                onChange={
                  handleOrganizationChange
                }
              >
                <option value="">
                  انتخاب سازمان
                </option>

                {organizations.map(
                  (organization) => (
                    <option
                      key={
                        organization.id
                      }
                      value={
                        organization.id
                      }
                    >
                      {
                        organization.name
                      }
                    </option>
                  )
                )}
              </select>

            </div>

          </div>


          <div className="project-form-group project-form-full">

            <label>
              عنوان پروژه
              <span>*</span>
            </label>

            <input
              type="text"
              placeholder="عنوان پروژه را وارد کنید"
              {...register(
                "title",
                {
                  required:
                    "عنوان پروژه الزامی است.",

                  minLength: {
                    value: 3,
                    message:
                      "عنوان پروژه باید حداقل ۳ کاراکتر باشد.",
                  },
                }
              )}
            />

            {errors.title && (
              <small className="project-form-error">
                {errors.title.message}
              </small>
            )}

          </div>


          <div className="project-form-group project-form-full">

            <label>
              توضیحات پروژه
            </label>

            <textarea
              rows="5"
              placeholder="هدف و توضیحات پروژه..."
              {...register(
                "description"
              )}
            />

          </div>


          <div className="project-form-group project-form-full">

            <div className="project-team-section-title">

              <div>
                <Users
                  size={20}
                />

                <div>
                  <strong>
                    اعضای پروژه
                  </strong>

                  <span>
                    هر عضو می‌تواند در پروژه‌های مختلف نقش متفاوت داشته باشد.
                  </span>
                </div>
              </div>

            </div>


            {!selectedOrganization ? (
              <div className="project-team-empty">
                ابتدا سازمان را انتخاب کنید.
              </div>
            ) : (
              <div className="project-team-builder">

                <div className="project-team-source">

                  <div className="project-team-search">

                    <Search
                      size={17}
                    />

                    <input
                      type="text"
                      value={
                        memberSearch
                      }
                      onChange={(
                        event
                      ) =>
                        setMemberSearch(
                          event.target.value
                        )
                      }
                      placeholder="جستجوی عضو سازمان..."
                    />

                  </div>


                  <div className="project-team-candidates">

                    {availableMembers.length ===
                    0 ? (
                      <div className="project-team-empty">
                        عضو دیگری برای افزودن وجود ندارد.
                      </div>
                    ) : (
                      availableMembers.map(
                        (member) => (
                          <div
                            className="project-team-candidate"
                            key={
                              member.user_id
                            }
                          >

                            <div>
                              <strong>
                                {member.full_name ||
                                  member.username}
                              </strong>

                              <span>
                                @{member.username}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                addMember(
                                  member
                                )
                              }
                            >
                              <UserPlus
                                size={16}
                              />

                              افزودن
                            </button>

                          </div>
                        )
                      )
                    )}

                  </div>

                </div>


                <div className="project-selected-team">

                  <div className="project-selected-team-header">
                    تیم پروژه
                    <span>
                      {selectedMembers.length}
                      {" "}
                      عضو
                    </span>
                  </div>


                  {selectedMembers.length ===
                  0 ? (
                    <div className="project-team-empty">
                      هنوز عضوی انتخاب نشده است.
                    </div>
                  ) : (
                    selectedMembers.map(
                      (member) => (
                        <div
                          className="project-selected-member"
                          key={
                            member.userId
                          }
                        >

                          <div className="project-selected-member-info">

                            <strong>
                              {
                                member.fullName
                              }
                            </strong>

                            <span>
                              @{member.username}
                            </span>

                          </div>


                          <select
                            value={
                              member.role
                            }
                            onChange={(
                              event
                            ) =>
                              changeMemberRole(
                                member.userId,
                                event
                                  .target
                                  .value
                              )
                            }
                          >

                            {Object.values(
                              PROJECT_ROLES
                            ).map(
                              (role) => (
                                <option
                                  key={
                                    role
                                  }
                                  value={
                                    role
                                  }
                                >
                                  {
                                    PROJECT_ROLE_LABELS[
                                      role
                                    ]
                                  }
                                </option>
                              )
                            )}

                          </select>


                          <button
                            type="button"
                            className="project-remove-team-member"
                            onClick={() =>
                              removeMember(
                                member.userId
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>
                      )
                    )
                  )}

                </div>

              </div>
            )}

          </div>


          <div className="project-form-group">

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
                      "بودجه نمی‌تواند منفی باشد.",
                  },
                }
              )}
            />

          </div>


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
                  "تاریخ شروع الزامی است.",
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

          </div>


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
                  "تاریخ پایان الزامی است.",

                validate: (
                  value
                ) => {

                  const start =
                    getValues(
                      "startDate"
                    );


                  if (
                    !value ||
                    !start ||
                    typeof value.toDate !==
                      "function" ||
                    typeof start.toDate !==
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
                    "تاریخ پایان باید بعد از تاریخ شروع باشد."
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

          </div>


          <div className="project-form-group project-form-full">

            <label>
              مستندات پروژه
            </label>

            <div
              className="documents-dropzone"
              onClick={() =>
                fileInputRef.current
                  ?.click()
              }
              onDragOver={(
                event
              ) =>
                event.preventDefault()
              }
              onDrop={(
                event
              ) => {
                event.preventDefault();

                handleFiles(
                  event.dataTransfer
                    .files
                );
              }}
            >

              <UploadCloud
                size={34}
              />

              <strong>
                فایل را انتخاب یا اینجا رها کنید
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
                onChange={(
                  event
                ) => {
                  handleFiles(
                    event.target.files
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

                        <strong>
                          {
                            document.name
                          }
                        </strong>

                      </div>

                      <button
                        type="button"
                        className="remove-document-button"
                        onClick={() =>
                          setDocuments(
                            (
                              previous
                            ) =>
                              previous.filter(
                                (
                                  _,
                                  itemIndex
                                ) =>
                                  itemIndex !==
                                  index
                              )
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


          {formMessage && (
            <div className="project-form-message">
              {formMessage}
            </div>
          )}


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

              {isEditing
                ? "ذخیره تغییرات"
                : "ایجاد پروژه"}
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}


export default ProjectFormPage;
