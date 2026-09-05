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
  getOrganizationMembers,
} from "../../../services/organizationService";

import {
  addProjectMember,
  createProject,
  getOrganizationProjects,
  getProjectMembers,
  normalizeProject,
  normalizeProjectMember,
  removeProjectMember,
  updateProject,
  updateProjectMemberRole,
} from "../../../services/projectService";

import {
  ORGANIZATION_ROLES,
  PROJECT_ROLES,
  PROJECT_ROLE_LABELS,
} from "../../../constants/roles";

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


const UNIQUE_PROJECT_ROLES =
  new Set([
    PROJECT_ROLES.MANAGER,
    PROJECT_ROLES.TEAM_LEAD,
  ]);


function isAllowedFile(
  file
) {
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
  members,
  user
) {
  if (
    !organization ||
    !user
  ) {
    return null;
  }


  if (
    Number(
      organization.owner_id
    ) ===
    Number(
      user.id
    )
  ) {
    return ORGANIZATION_ROLES.OWNER;
  }


  return (
    members.find(
      (member) =>
        Number(
          member.user_id
        ) ===
        Number(
          user.id
        )
    )?.role ||
    null
  );
}


function getOrganizationMemberUser(
  member,
  currentUser
) {
  if (!member) {
    return null;
  }


  if (
    Number(
      member.user_id
    ) ===
    Number(
      currentUser?.id
    )
  ) {
    return currentUser;
  }


  return {
    full_name:
      member.full_name ||
      member.user?.full_name ||
      member.username ||
      member.user?.username ||
      `کاربر #${member.user_id}`,

    username:
      member.username ||
      member.user?.username ||
      "",
  };
}


function backendDateToDate(
  value
) {
  if (!value) {
    return null;
  }


  const parts =
    String(value)
      .split("-")
      .map(Number);


  if (
    parts.length !== 3 ||
    parts.some(
      (part) =>
        Number.isNaN(part)
    )
  ) {
    return null;
  }


  return new Date(
    parts[0],
    parts[1] - 1,
    parts[2]
  );
}


function formatDateForApi(
  value
) {
  if (!value) {
    return null;
  }


  if (
    typeof value ===
      "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return value;
  }


  let date = null;


  if (
    typeof value?.toDate ===
    "function"
  ) {
    date =
      value.toDate();
  } else if (
    value instanceof Date
  ) {
    date =
      value;
  }


  if (
    !date ||
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
    organizationMembers,
    setOrganizationMembers,
  ] = useState([]);


  const [
    existingProject,
    setExistingProject,
  ] = useState(null);


  const [
    originalMembers,
    setOriginalMembers,
  ] = useState([]);


  const [
    loadingAccess,
    setLoadingAccess,
  ] = useState(true);


  const [
    selectedOrganizationId,
    setSelectedOrganizationId,
  ] = useState("");


  const [
    selectedMembers,
    setSelectedMembers,
  ] = useState([]);


  const [
    memberSearch,
    setMemberSearch,
  ] = useState("");


  const [
    documents,
    setDocuments,
  ] = useState([]);


  const [
    fileError,
    setFileError,
  ] = useState("");


  const [
    formMessage,
    setFormMessage,
  ] = useState("");


  const [
    requestError,
    setRequestError,
  ] = useState("");


  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    reset,

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
    watch(
      "startDate"
    );


  useEffect(() => {
    const loadAccess =
      async () => {
        setLoadingAccess(true);
        setRequestError("");


        try {
          const [
            user,
            organizationList,
          ] =
            await Promise.all([
              getCurrentUser(),
              getMyOrganizations(),
            ]);


          const safeOrganizations =
            Array.isArray(
              organizationList
            )
              ? organizationList
              : [];


          setCurrentUser(
            user
          );


          const organizationData =
            await Promise.all(
              safeOrganizations.map(
                async (
                  organization
                ) => {
                  try {
                    const members =
                      await getOrganizationMembers(
                        organization.id
                      );

                    return {
                      organization,
                      members:
                        Array.isArray(
                          members
                        )
                          ? members
                          : [],
                    };
                  } catch (error) {
                    console.error(
                      `Load organization ${organization.id} members error:`,
                      error
                    );

                    return {
                      organization,
                      members: [],
                    };
                  }
                }
              )
            );


          const allowedOrganizations =
            organizationData
              .filter(
                ({
                  organization,
                  members,
                }) => {
                  const role =
                    getOrganizationRole(
                      organization,
                      members,
                      user
                    );

                  return (
                    role ===
                      ORGANIZATION_ROLES.OWNER ||
                    role ===
                      ORGANIZATION_ROLES.ADMIN
                  );
                }
              )
              .map(
                ({
                  organization,
                }) =>
                  organization
              );


          setOrganizations(
            allowedOrganizations
          );


          if (!isEditing) {
            if (
              allowedOrganizations.length ===
              1
            ) {
              const organization =
                allowedOrganizations[0];

              setSelectedOrganizationId(
                String(
                  organization.id
                )
              );

              const found =
                organizationData.find(
                  (item) =>
                    Number(
                      item.organization.id
                    ) ===
                    Number(
                      organization.id
                    )
                );

              setOrganizationMembers(
                found?.members ||
                []
              );
            }

            return;
          }


          let foundProject =
            null;

          let foundOrganization =
            null;

          let foundOrganizationMembers =
            [];


          for (
            const organization
            of allowedOrganizations
          ) {
            try {
              const projects =
                await getOrganizationProjects(
                  organization.id
                );

              const matched =
                (
                  Array.isArray(
                    projects
                  )
                    ? projects
                    : []
                ).find(
                  (project) =>
                    String(
                      project.id
                    ) ===
                    String(
                      id
                    )
                );


              if (matched) {
                foundProject =
                  matched;

                foundOrganization =
                  organization;

                foundOrganizationMembers =
                  organizationData.find(
                    (item) =>
                      Number(
                        item.organization.id
                      ) ===
                      Number(
                        organization.id
                      )
                  )?.members ||
                  [];

                break;
              }
            } catch (error) {
              console.error(
                `Find project ${id} in organization ${organization.id} error:`,
                error
              );
            }
          }


          if (
            !foundProject ||
            !foundOrganization
          ) {
            setRequestError(
              "پروژه موردنظر پیدا نشد یا اجازه ویرایش آن را ندارید."
            );

            return;
          }


          const rawMembers =
            await getProjectMembers(
              foundOrganization.id,
              foundProject.id
            );


          const normalizedMembers =
            (
              Array.isArray(
                rawMembers
              )
                ? rawMembers
                : []
            ).map(
              (member) => {
                const organizationMember =
                  foundOrganizationMembers.find(
                    (item) =>
                      Number(
                        item.user_id
                      ) ===
                      Number(
                        member.user_id
                      )
                  );


                return normalizeProjectMember(
                  member,
                  getOrganizationMemberUser(
                    organizationMember,
                    user
                  )
                );
              }
            );


          const normalizedProject =
            normalizeProject(
              foundProject,
              {
                organizationName:
                  foundOrganization.name,

                members:
                  normalizedMembers,
              }
            );


          setExistingProject(
            normalizedProject
          );

          setSelectedOrganizationId(
            String(
              foundOrganization.id
            )
          );

          setOrganizationMembers(
            foundOrganizationMembers
          );

          setSelectedMembers(
            normalizedMembers
          );

          setOriginalMembers(
            normalizedMembers
          );


          reset({
            title:
              normalizedProject.title ||
              "",

            description:
              normalizedProject.description ||
              "",

            budget:
              normalizedProject.budget ??
              "",

            startDate:
              backendDateToDate(
                normalizedProject.startDate
              ),

            endDate:
              backendDateToDate(
                normalizedProject.endDate
              ),
          });
        } catch (error) {
          console.error(
            "Project form load error:",
            error
          );

          setRequestError(
            "دریافت اطلاعات پروژه با خطا مواجه شد."
          );
        } finally {
          setLoadingAccess(false);
        }
      };


    loadAccess();
  }, [
    id,
    isEditing,
    reset,
  ]);


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
        ) ||
        null,
      [
        organizations,
        selectedOrganizationId,
      ]
    );


  useEffect(() => {
    if (
      !selectedOrganization ||
      isEditing
    ) {
      return;
    }


    const loadMembers =
      async () => {
        try {
          const members =
            await getOrganizationMembers(
              selectedOrganization.id
            );

          setOrganizationMembers(
            Array.isArray(
              members
            )
              ? members
              : []
          );
        } catch (error) {
          console.error(
            "Load selected organization members error:",
            error
          );

          setOrganizationMembers(
            []
          );
        }
      };


    loadMembers();
  }, [
    selectedOrganization,
    isEditing,
  ]);


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


            const fullName =
              member.full_name ||
              member.user?.full_name ||
              "";

            const username =
              member.username ||
              member.user?.username ||
              "";


            return (
              fullName
                .toLowerCase()
                .includes(
                  search
                ) ||
              username
                .toLowerCase()
                .includes(
                  search
                ) ||
              String(
                member.user_id
              ).includes(
                search
              )
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
    async (
      event
    ) => {
      const value =
        event.target.value;


      setSelectedOrganizationId(
        value
      );

      setSelectedMembers([]);
      setOriginalMembers([]);
      setMemberSearch("");
      setOrganizationMembers([]);


      if (!value) {
        return;
      }


      try {
        const members =
          await getOrganizationMembers(
            value
          );

        setOrganizationMembers(
          Array.isArray(
            members
          )
            ? members
            : []
        );
      } catch (error) {
        console.error(
          "Load organization members error:",
          error
        );
      }
    };


  const addMember =
    (member) => {
      const userData =
        getOrganizationMemberUser(
          member,
          currentUser
        );


      setSelectedMembers(
        (
          previousMembers
        ) => [
          ...previousMembers,
          {
            userId:
              member.user_id,

            fullName:
              userData?.full_name ||
              `کاربر #${member.user_id}`,

            username:
              userData?.username ||
              "",

            role:
              PROJECT_ROLES.PR_MEMBER,
          },
        ]
      );
    };


  const removeMember =
    (
      userId
    ) => {
      setSelectedMembers(
        (
          previousMembers
        ) =>
          previousMembers.filter(
            (member) =>
              Number(
                member.userId
              ) !==
              Number(
                userId
              )
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
              Number(
                userId
              )
                ? {
                    ...member,
                    role,
                  }
                : member
          )
      );
    };


  const handleFiles =
    (
      fileList
    ) => {
      const selectedFiles =
        Array.from(
          fileList ||
          []
        );


      const validFiles = [];
      const messages = [];


      selectedFiles.forEach(
        (file) => {
          if (
            !isAllowedFile(
              file
            )
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
        messages.join(
          " "
        )
      );
    };


  const validateUniqueRoles =
    () => {
      for (
        const role
        of UNIQUE_PROJECT_ROLES
      ) {
        const count =
          selectedMembers.filter(
            (member) =>
              member.role ===
              role
          ).length;


        if (
          count > 1
        ) {
          setFormMessage(
            role ===
              PROJECT_ROLES.MANAGER
              ? "هر پروژه فقط می‌تواند یک مدیر پروژه داشته باشد."
              : "هر پروژه فقط می‌تواند یک سرپرست تیم داشته باشد."
          );

          return false;
        }
      }


      return true;
    };


  const syncEditedMembers =
    async (
      organizationId,
      projectId
    ) => {
      const originalMap =
        new Map(
          originalMembers.map(
            (member) => [
              Number(
                member.userId
              ),
              member,
            ]
          )
        );


      const selectedMap =
        new Map(
          selectedMembers.map(
            (member) => [
              Number(
                member.userId
              ),
              member,
            ]
          )
        );


      const removedMembers =
        originalMembers.filter(
          (member) =>
            !selectedMap.has(
              Number(
                member.userId
              )
            )
        );


      for (
        const member
        of removedMembers
      ) {
        await removeProjectMember(
          organizationId,
          projectId,
          member.userId
        );
      }


      const demotions =
        selectedMembers.filter(
          (member) => {
            const original =
              originalMap.get(
                Number(
                  member.userId
                )
              );


            if (!original) {
              return false;
            }


            return (
              original.role !==
                member.role &&
              UNIQUE_PROJECT_ROLES.has(
                original.role
              ) &&
              !UNIQUE_PROJECT_ROLES.has(
                member.role
              )
            );
          }
        );


      for (
        const member
        of demotions
      ) {
        await updateProjectMemberRole(
          organizationId,
          projectId,
          member.userId,
          member.role
        );
      }


      const otherRoleChanges =
        selectedMembers.filter(
          (member) => {
            const original =
              originalMap.get(
                Number(
                  member.userId
                )
              );


            if (!original) {
              return false;
            }


            if (
              original.role ===
              member.role
            ) {
              return false;
            }


            return !demotions.some(
              (item) =>
                Number(
                  item.userId
                ) ===
                Number(
                  member.userId
                )
            );
          }
        );


      for (
        const member
        of otherRoleChanges
      ) {
        await updateProjectMemberRole(
          organizationId,
          projectId,
          member.userId,
          member.role
        );
      }


      const addedMembers =
        selectedMembers.filter(
          (member) =>
            !originalMap.has(
              Number(
                member.userId
              )
            )
        );


      for (
        const member
        of addedMembers
      ) {
        await addProjectMember(
          organizationId,
          projectId,
          member.userId,
          member.role
        );
      }
    };


  const onSubmit =
    async (
      data
    ) => {
      setFormMessage("");


      if (
        !selectedOrganization
      ) {
        setFormMessage(
          "انتخاب سازمان الزامی است."
        );

        return;
      }


      if (
        !validateUniqueRoles()
      ) {
        return;
      }


      const projectData = {
        title:
          data.title.trim(),

        description:
          data.description
            ?.trim() ||
          "",

        budget:
          data.budget ===
          ""
            ? null
            : data.budget,

        startDate:
          formatDateForApi(
            data.startDate
          ),

        endDate:
          formatDateForApi(
            data.endDate
          ),
      };


      try {
        let savedProject;


        if (
          isEditing
        ) {
          if (
            !existingProject
          ) {
            setFormMessage(
              "پروژه موردنظر برای ویرایش پیدا نشد."
            );

            return;
          }


          savedProject =
            await updateProject(
              selectedOrganization.id,
              existingProject.id,
              projectData
            );


          await syncEditedMembers(
            selectedOrganization.id,
            existingProject.id
          );


          setFormMessage(
            "تغییرات پروژه با موفقیت ذخیره شد."
          );
        } else {
          savedProject =
            await createProject(
              selectedOrganization.id,
              projectData
            );


          for (
            const member
            of selectedMembers
          ) {
            await addProjectMember(
              selectedOrganization.id,
              savedProject.id,
              member.userId,
              member.role
            );
          }


          setFormMessage(
            "پروژه با موفقیت ایجاد شد."
          );
        }


        if (
          documents.length >
          0
        ) {
          console.warn(
            "Project documents were selected, but the backend currently has no project attachment endpoint."
          );
        }


        window.setTimeout(
          () => {
            navigate(
              `/projects/${savedProject.id}`
            );
          },
          500
        );
      } catch (error) {
        console.error(
          "Save project error:",
          error
        );


        const detail =
          error?.response
            ?.data
            ?.detail;


        if (
          error?.response
            ?.status ===
          409
        ) {
          setFormMessage(
            detail ||
            "این نقش پروژه‌ای قبلاً به عضو دیگری اختصاص داده شده است."
          );

          return;
        }


        if (
          error?.response
            ?.status ===
          403
        ) {
          setFormMessage(
            "شما اجازه انجام این عملیات را ندارید."
          );

          return;
        }


        setFormMessage(
          detail ||
          "ذخیره پروژه با خطا مواجه شد."
        );
      }
    };


  if (
    loadingAccess
  ) {
    return (
      <section className="create-project-page">

        <div className="create-project-card">
          در حال دریافت اطلاعات پروژه...
        </div>

      </section>
    );
  }


  if (
    requestError
  ) {
    return (
      <section className="create-project-page">

        <div className="create-project-card">

          <h2>
            پروژه در دسترس نیست
          </h2>

          <p>
            {requestError}
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
                disabled={
                  isEditing
                }
              >
                <option value="">
                  انتخاب سازمان
                </option>

                {organizations.map(
                  (
                    organization
                  ) => (
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
                    value: 2,
                    message:
                      "عنوان پروژه باید حداقل ۲ کاراکتر باشد.",
                  },

                  maxLength: {
                    value: 150,
                    message:
                      "عنوان پروژه حداکثر می‌تواند ۱۵۰ کاراکتر باشد.",
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


          <div className="project-form-group project-form-full">

            <label>
              توضیحات پروژه
            </label>

            <textarea
              rows="5"
              maxLength="2000"
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
                          event.target
                            .value
                        )
                      }
                      placeholder="جستجو با نام، نام کاربری یا شناسه..."
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
                        (
                          member
                        ) => {
                          const userData =
                            getOrganizationMemberUser(
                              member,
                              currentUser
                            );


                          return (
                            <div
                              className="project-team-candidate"
                              key={
                                member.user_id
                              }
                            >

                              <div>

                                <strong>
                                  {
                                    userData?.full_name ||
                                    `کاربر #${member.user_id}`
                                  }
                                </strong>

                                <span>
                                  {userData?.username
                                    ? `@${userData.username}`
                                    : `شناسه کاربر: ${member.user_id}`}
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
                          );
                        }
                      )
                    )}

                  </div>

                </div>


                <div className="project-selected-team">

                  <div className="project-selected-team-header">
                    تیم پروژه

                    <span>
                      {
                        selectedMembers.length
                      }
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
                      (
                        member
                      ) => (
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
                              {member.username
                                ? `@${member.username}`
                                : `شناسه کاربر: ${member.userId}`}
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
                                event.target
                                  .value
                              )
                            }
                          >

                            {Object.values(
                              PROJECT_ROLES
                            ).map(
                              (
                                role
                              ) => (
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
              step="any"
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

            {errors.budget && (
              <small className="project-form-error">
                {
                  errors.budget
                    .message
                }
              </small>
            )}

          </div>


          <div className="project-form-group">

            <label>
              تاریخ شروع
              <span>*</span>
            </label>

            <Controller
              name="startDate"
              control={
                control
              }
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

            {errors.startDate && (
              <small className="project-form-error">
                {
                  errors.startDate
                    .message
                }
              </small>
            )}

          </div>


          <div className="project-form-group">

            <label>
              تاریخ پایان
              <span>*</span>
            </label>

            <Controller
              name="endDate"
              control={
                control
              }
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
                    !start
                  ) {
                    return true;
                  }


                  const endDateValue =
                    typeof value.toDate ===
                    "function"
                      ? value.toDate()
                      : value;

                  const startDateValue =
                    typeof start.toDate ===
                    "function"
                      ? start.toDate()
                      : start;


                  if (
                    !(
                      endDateValue
                      instanceof Date
                    ) ||
                    !(
                      startDateValue
                      instanceof Date
                    )
                  ) {
                    return true;
                  }


                  return (
                    endDateValue.getTime() >=
                      startDateValue.getTime() ||
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

            {errors.endDate && (
              <small className="project-form-error">
                {
                  errors.endDate
                    .message
                }
              </small>
            )}

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
                    event.target
                      .files
                  );

                  event.target.value =
                    "";
                }}
              />

            </div>


            <small className="project-form-hint">
              فعلاً endpoint ذخیره مستندات پروژه در بک‌اند وجود ندارد؛ انتخاب فایل فقط در همین فرم باقی می‌ماند.
            </small>


            {fileError && (
              <small className="project-form-error">
                {
                  fileError
                }
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
              {
                formMessage
              }
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

              {isSubmitting
                ? "در حال ذخیره..."
                : isEditing
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
