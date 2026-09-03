import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import DatePickerModule from "react-multi-date-picker";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Gauge,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  getCurrentUser,
} from "../../services/authService";

import {
  getMyOrganizations,
} from "../../services/organizationService";

import {
  getWorkspaceProjectById,
} from "../../data/projectWorkspaceStore";

import {
  getOrganizationResources,
  RESOURCE_STATUS_LABELS,
  RESOURCE_TYPE_LABELS,
} from "../../data/resourceWorkspaceStore";

import {
  calculateAssignmentCost,
  createResourceAssignment,
  deleteResourceAssignment,
  getProjectResourceAssignments,
  getResourceAllocatedPercent,
  updateResourceAssignment,
} from "../../data/resourceAssignmentStore";

import {
  canManageWorkspaceProject,
  canViewWorkspaceProject,
} from "../../utils/projectAccess";

import "./ProjectResources.css";


const DatePicker =
  DatePickerModule?.default ??
  DatePickerModule;


const EMPTY_FORM = {
  resourceId: "",
  memberId: "",
  allocation: "100",
  estimatedHours: "0",
  startDate: "",
  endDate: "",
  note: "",
};


function ProjectResources() {
  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const [
    project,
    setProject,
  ] = useState(null);


  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);


  const [
    organizations,
    setOrganizations,
  ] = useState([]);


  const [
    resources,
    setResources,
  ] = useState([]);


  const [
    assignments,
    setAssignments,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    formOpen,
    setFormOpen,
  ] = useState(false);


  const [
    editingAssignment,
    setEditingAssignment,
  ] = useState(null);


  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );


  const [
    formError,
    setFormError,
  ] = useState("");


  useEffect(() => {
    const loadPage =
      async () => {

        setLoading(true);
        setError("");


        try {
          const [
            user,
            organizationList,
          ] =
            await Promise.all([
              getCurrentUser(),
              getMyOrganizations(),
            ]);


          const loadedProject =
            getWorkspaceProjectById(
              id
            );


          const safeOrganizations =
            Array.isArray(
              organizationList
            )
              ? organizationList
              : [];


          if (!loadedProject) {
            setError(
              "پروژه موردنظر پیدا نشد."
            );

            return;
          }


          if (
            !canViewWorkspaceProject(
              user,
              loadedProject,
              safeOrganizations
            )
          ) {
            setError(
              "شما به این پروژه دسترسی ندارید."
            );

            return;
          }


          setCurrentUser(
            user
          );

          setOrganizations(
            safeOrganizations
          );

          setProject(
            loadedProject
          );


          setResources(
            getOrganizationResources(
              loadedProject
                .organizationId
            )
          );


          setAssignments(
            getProjectResourceAssignments(
              loadedProject.id
            )
          );
        } catch (requestError) {
          console.error(
            "Load project resources error:",
            requestError
          );

          setError(
            "دریافت منابع پروژه با خطا مواجه شد."
          );
        } finally {
          setLoading(false);
        }
      };


    loadPage();
  }, [id]);


  const canManage =
    useMemo(
      () =>
        Boolean(
          project &&
          currentUser &&
          canManageWorkspaceProject(
            currentUser,
            project,
            organizations
          )
        ),
      [
        project,
        currentUser,
        organizations,
      ]
    );


  const availableResources =
    useMemo(
      () =>
        resources.filter(
          (resource) =>
            resource.status !==
            "UNAVAILABLE"
        ),
      [resources]
    );


  const selectedResource =
    useMemo(
      () =>
        resources.find(
          (resource) =>
            String(
              resource.id
            ) ===
            String(
              form.resourceId
            )
        ) || null,
      [
        resources,
        form.resourceId,
      ]
    );


  const selectedMember =
    useMemo(
      () =>
        project?.members?.find(
          (member) =>
            String(
              member.userId
            ) ===
            String(
              form.memberId
            )
        ) || null,
      [
        project,
        form.memberId,
      ]
    );


  const estimatedCost =
    Number(
      form.estimatedHours ||
      0
    ) *
    Number(
      selectedResource
        ?.hourlyCost ||
      0
    );


  const openCreateForm =
    () => {

      setEditingAssignment(
        null
      );

      setForm({
        ...EMPTY_FORM,
      });

      setFormError("");
      setFormOpen(true);
    };


  const openEditForm =
    (assignment) => {

      setEditingAssignment(
        assignment
      );


      setForm({
        resourceId:
          String(
            assignment.resourceId
          ),

        memberId:
          assignment.memberId
            ? String(
                assignment.memberId
              )
            : "",

        allocation:
          String(
            assignment.allocation
          ),

        estimatedHours:
          String(
            assignment.estimatedHours
          ),

        startDate:
          assignment.startDate ||
          "",

        endDate:
          assignment.endDate ||
          "",

        note:
          assignment.note ||
          "",
      });


      setFormError("");
      setFormOpen(true);
    };


  const closeForm =
    () => {

      setFormOpen(false);

      setEditingAssignment(
        null
      );

      setFormError("");
    };


  const handleChange =
    (event) => {

      const {
        name,
        value,
      } =
        event.target;


      setForm(
        (previous) => ({
          ...previous,

          [name]:
            value,
        })
      );
    };


  const handleSubmit =
    (event) => {

      event.preventDefault();

      setFormError("");


      if (
        !project ||
        !canManage
      ) {
        return;
      }


      if (!selectedResource) {
        setFormError(
          "انتخاب منبع الزامی است."
        );

        return;
      }


      const allocation =
        Number(
          form.allocation
        );


      if (
        allocation <= 0 ||
        allocation > 100
      ) {
        setFormError(
          "درصد تخصیص باید بین ۱ تا ۱۰۰ باشد."
        );

        return;
      }


      const alreadyAllocated =
        getResourceAllocatedPercent(
          selectedResource.id,
          editingAssignment?.id
        );


      const resourceCapacity =
        Number(
          selectedResource.capacity ??
          100
        );


      if (
        alreadyAllocated +
          allocation >
        resourceCapacity
      ) {
        const remainingCapacity =
          Math.max(
            0,
            resourceCapacity -
              alreadyAllocated
          );


        setFormError(
          `ظرفیت کل این منبع ${resourceCapacity}٪ است و فقط ${remainingCapacity}٪ ظرفیت آزاد باقی مانده است.`
        );

        return;
      }


      if (
        Number(
          form.estimatedHours
        ) < 0
      ) {
        setFormError(
          "ساعت تخمینی نمی‌تواند منفی باشد."
        );

        return;
      }


      if (
        form.startDate &&
        form.endDate &&
        form.endDate <
          form.startDate
      ) {
        setFormError(
          "تاریخ پایان باید بعد از تاریخ شروع باشد."
        );

        return;
      }


      const assignmentData = {
        projectId:
          project.id,

        projectName:
          project.title,

        organizationId:
          project.organizationId,

        resourceId:
          selectedResource.id,

        resourceName:
          selectedResource.name,

        memberId:
          selectedMember?.userId ||
          null,

        memberName:
          selectedMember
            ?.fullName ||
          "",

        allocation,

        estimatedHours:
          Number(
            form.estimatedHours
          ),

        hourlyCost:
          Number(
            selectedResource
              .hourlyCost ||
            0
          ),

        startDate:
          form.startDate,

        endDate:
          form.endDate,

        note:
          form.note.trim(),
      };


      if (editingAssignment) {
        updateResourceAssignment(
          editingAssignment.id,
          assignmentData
        );
      } else {
        createResourceAssignment(
          assignmentData
        );
      }


      setAssignments(
        getProjectResourceAssignments(
          project.id
        )
      );


      closeForm();
    };


  const handleDelete =
    (assignment) => {

      if (!canManage) {
        return;
      }


      deleteResourceAssignment(
        assignment.id
      );


      setAssignments(
        getProjectResourceAssignments(
          project.id
        )
      );
    };


  if (loading) {
    return (
      <section className="project-resources-page">

        <div className="project-resources-state">
          در حال دریافت منابع پروژه...
        </div>

      </section>
    );
  }


  if (
    error ||
    !project
  ) {
    return (
      <section className="project-resources-page">

        <div className="project-resources-state">

          <h2>
            منابع پروژه در دسترس نیست
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
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
    <section className="project-resources-page">

      <div className="project-resources-header">

        <div>

          <button
            type="button"
            className="project-resources-back"
            onClick={() =>
              navigate(
                `/projects/${project.id}`
              )
            }
          >
            <ArrowRight
              size={17}
            />

            بازگشت به پروژه
          </button>


          <h2>
            منابع پروژه
          </h2>

          <p>
            {project.title}
            {" "}
            —
            {" "}
            {project.organizationName}
          </p>

        </div>


        {canManage && (
          <button
            type="button"
            className="assignment-create-button"
            onClick={
              openCreateForm
            }
          >
            <Plus
              size={18}
            />

            تخصیص منبع
          </button>
        )}

      </div>


      <div className="assignment-summary-grid">

        <div className="assignment-summary-card">

          <Gauge
            size={21}
          />

          <div>
            <span>
              منابع سازمان
            </span>

            <strong>
              {resources.length}
            </strong>
          </div>

        </div>


        <div className="assignment-summary-card">

          <Gauge
            size={21}
          />

          <div>
            <span>
              تخصیص‌های پروژه
            </span>

            <strong>
              {assignments.length}
            </strong>
          </div>

        </div>


        <div className="assignment-summary-card">

          <CircleDollarSign
            size={21}
          />

          <div>
            <span>
              هزینه تخمینی
            </span>

            <strong>
              {assignments
                .reduce(
                  (
                    total,
                    assignment
                  ) =>
                    total +
                    calculateAssignmentCost(
                      assignment
                    ),
                  0
                )
                .toLocaleString(
                  "fa-IR"
                )}
              {" "}
              تومان
            </strong>
          </div>

        </div>

      </div>


      {assignments.length ===
      0 ? (
        <div className="project-resources-empty">

          <Gauge
            size={42}
          />

          <strong>
            هنوز منبعی به پروژه تخصیص داده نشده است
          </strong>

          <p>
            منابع ثبت‌شده در سازمان را می‌توانید به این پروژه اختصاص دهید.
          </p>

        </div>
      ) : (
        <div className="assignment-grid">

          {assignments.map(
            (assignment) => (

              <article
                className="assignment-card"
                key={
                  assignment.id
                }
              >

                <div className="assignment-card-header">

                  <div className="assignment-card-icon">
                    <Gauge
                      size={20}
                    />
                  </div>


                  {canManage && (
                    <div className="assignment-actions">

                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(
                            assignment
                          )
                        }
                      >
                        <Pencil
                          size={15}
                        />
                      </button>


                      <button
                        type="button"
                        className="assignment-delete"
                        onClick={() =>
                          handleDelete(
                            assignment
                          )
                        }
                      >
                        <Trash2
                          size={15}
                        />
                      </button>

                    </div>
                  )}

                </div>


                <h3>
                  {assignment.resourceName}
                </h3>


                <div className="assignment-allocation">

                  <div>
                    <span>
                      درصد تخصیص
                    </span>

                    <strong>
                      {assignment.allocation}
                      %
                    </strong>
                  </div>


                  <div className="assignment-progress">

                    <div
                      style={{
                        width:
                          `${assignment.allocation}%`,
                      }}
                    />

                  </div>

                </div>


                <div className="assignment-details">

                  <div>
                    <UserRound
                      size={15}
                    />

                    <span>
                      {assignment.memberName ||
                        "بدون عضو مرتبط"}
                    </span>
                  </div>


                  <div>
                    <CalendarDays
                      size={15}
                    />

                    <span>
                      {assignment.startDate ||
                        "-"}
                      {" "}
                      تا
                      {" "}
                      {assignment.endDate ||
                        "-"}
                    </span>
                  </div>


                  <div>
                    <Gauge
                      size={15}
                    />

                    <span>
                      {assignment.estimatedHours}
                      {" "}
                      ساعت تخمینی
                    </span>
                  </div>


                  <div>
                    <CircleDollarSign
                      size={15}
                    />

                    <span>
                      {calculateAssignmentCost(
                        assignment
                      ).toLocaleString(
                        "fa-IR"
                      )}
                      {" "}
                      تومان
                    </span>
                  </div>

                </div>


                {assignment.note && (
                  <p className="assignment-note">
                    {assignment.note}
                  </p>
                )}

              </article>
            )
          )}

        </div>
      )}


      {formOpen && (

        <div
          className="assignment-modal-backdrop"
          onMouseDown={
            closeForm
          }
        >

          <div
            className="assignment-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="assignment-modal-header">

              <div>

                <h3>
                  {editingAssignment
                    ? "ویرایش تخصیص"
                    : "تخصیص منبع به پروژه"}
                </h3>

                <p>
                  منبع، ظرفیت، بازه زمانی و عضو مرتبط را مشخص کنید.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeForm
                }
              >
                <X
                  size={19}
                />
              </button>

            </div>


            <form
              className="assignment-form"
              onSubmit={
                handleSubmit
              }
            >

              <label className="assignment-form-full">
                منبع
                <span>*</span>

                <select
                  name="resourceId"
                  value={
                    form.resourceId
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    انتخاب منبع
                  </option>

                  {availableResources.map(
                    (resource) => {

                      const allocated =
                        getResourceAllocatedPercent(
                          resource.id,
                          editingAssignment
                            ?.id
                        );


                      return (
                        <option
                          key={
                            resource.id
                          }
                          value={
                            resource.id
                          }
                        >
                          {resource.name}
                          {" — "}
                          {
                            RESOURCE_TYPE_LABELS[
                              resource.type
                            ]
                          }
                          {" — "}
                          {
                            RESOURCE_STATUS_LABELS[
                              resource.status
                            ]
                          }
                          {" — ظرفیت آزاد "}
                          {Math.max(
                            0,
                            Number(
                              resource.capacity ??
                              100
                            ) -
                              allocated
                          )}
                          %
                        </option>
                      );
                    }
                  )}

                </select>

              </label>


              <label>
                درصد تخصیص
                <span>*</span>

                <input
                  type="number"
                  name="allocation"
                  min="1"
                  max="100"
                  value={
                    form.allocation
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>
                عضو مرتبط پروژه

                <select
                  name="memberId"
                  value={
                    form.memberId
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    بدون عضو مرتبط
                  </option>

                  {project.members.map(
                    (member) => (
                      <option
                        key={
                          member.userId
                        }
                        value={
                          member.userId
                        }
                      >
                        {
                          member.fullName
                        }
                      </option>
                    )
                  )}
                </select>

              </label>


              <label>
                ساعت تخمینی

                <input
                  type="number"
                  name="estimatedHours"
                  min="0"
                  value={
                    form.estimatedHours
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>
                هزینه تخمینی

                <input
                  type="text"
                  value={`${estimatedCost.toLocaleString(
                    "fa-IR"
                  )} تومان`}
                  readOnly
                  disabled
                />

              </label>


              <label>
                تاریخ شروع

                <DatePicker
                  value={
                    form.startDate
                  }
                  onChange={(value) =>
                    setForm(
                      (previous) => ({
                        ...previous,

                        startDate:
                          value?.format?.(
                            "YYYY/MM/DD"
                          ) || "",
                      })
                    )
                  }
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  calendarPosition="bottom-right"
                  inputClass="assignment-persian-date-input"
                  containerClassName="assignment-persian-date-container"
                  placeholder="تاریخ شروع"
                />

              </label>


              <label>
                تاریخ پایان

                <DatePicker
                  value={
                    form.endDate
                  }
                  onChange={(value) =>
                    setForm(
                      (previous) => ({
                        ...previous,

                        endDate:
                          value?.format?.(
                            "YYYY/MM/DD"
                          ) || "",
                      })
                    )
                  }
                  calendar={persian}
                  locale={persian_fa}
                  format="YYYY/MM/DD"
                  calendarPosition="bottom-right"
                  inputClass="assignment-persian-date-input"
                  containerClassName="assignment-persian-date-container"
                  placeholder="تاریخ پایان"
                />

              </label>


              <label className="assignment-form-full">
                توضیحات

                <textarea
                  name="note"
                  value={
                    form.note
                  }
                  onChange={
                    handleChange
                  }
                  rows="4"
                  placeholder="توضیحات تخصیص..."
                />

              </label>


              {formError && (
                <div className="assignment-form-error">
                  {formError}
                </div>
              )}


              <div className="assignment-form-actions">

                <button
                  type="button"
                  className="assignment-cancel-button"
                  onClick={
                    closeForm
                  }
                >
                  انصراف
                </button>


                <button
                  type="submit"
                  className="assignment-save-button"
                >
                  {editingAssignment
                    ? "ذخیره تغییرات"
                    : "ثبت تخصیص"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}


export default ProjectResources;




