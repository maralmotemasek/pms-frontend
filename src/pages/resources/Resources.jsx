import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Building2,
  CircleDollarSign,
  Gauge,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getCurrentUser,
} from "../../services/authService";

import {
  getMyOrganizations,
} from "../../services/organizationService";

import {
  ORGANIZATION_ROLES,
} from "../../constants/roles";

import {
  getUserOrganizationRole,
} from "../../utils/projectAccess";

import {
  createResource,
  deleteResource,
  getResources,
  RESOURCE_STATUSES,
  RESOURCE_STATUS_LABELS,
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  updateResource,
} from "../../data/resourceWorkspaceStore";

import "./Resources.css";


const EMPTY_FORM = {
  name: "",
  description: "",
  type:
    RESOURCE_TYPES.HUMAN,
  status:
    RESOURCE_STATUSES.AVAILABLE,
  capacity: "100",
  hourlyCost: "0",
  unit: "درصد",
};


function Resources() {
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
    loading,
    setLoading,
  ] = useState(true);


  const [
    searchValue,
    setSearchValue,
  ] = useState("");


  const [
    organizationFilter,
    setOrganizationFilter,
  ] = useState("all");


  const [
    typeFilter,
    setTypeFilter,
  ] = useState("all");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);


  const [
    editingResource,
    setEditingResource,
  ] = useState(null);


  const [
    selectedOrganizationId,
    setSelectedOrganizationId,
  ] = useState("");


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


          setOrganizations(
            Array.isArray(
              organizationList
            )
              ? organizationList
              : []
          );


          setResources(
            getResources()
          );
        } catch (error) {
          console.error(
            "Load resources error:",
            error
          );
        } finally {
          setLoading(false);
        }
      };


    loadPage();
  }, []);


  const manageableOrganizations =
    useMemo(
      () =>
        organizations.filter(
          (organization) => {

            const role =
              getUserOrganizationRole(
                organization,
                currentUser
              );


            return (
              role ===
                ORGANIZATION_ROLES.OWNER ||
              role ===
                ORGANIZATION_ROLES.ADMIN
            );
          }
        ),
      [
        organizations,
        currentUser,
      ]
    );


  const visibleResources =
    useMemo(
      () => {

        const organizationIds =
          new Set(
            organizations.map(
              (organization) =>
                String(
                  organization.id
                )
            )
          );


        return resources.filter(
          (resource) =>
            organizationIds.has(
              String(
                resource.organizationId
              )
            )
        );
      },
      [
        resources,
        organizations,
      ]
    );


  const filteredResources =
    useMemo(
      () => {

        const query =
          searchValue
            .trim()
            .toLowerCase();


        return visibleResources.filter(
          (resource) => {

            if (
              organizationFilter !==
                "all" &&
              String(
                resource.organizationId
              ) !==
                organizationFilter
            ) {
              return false;
            }


            if (
              typeFilter !==
                "all" &&
              resource.type !==
                typeFilter
            ) {
              return false;
            }


            if (
              statusFilter !==
                "all" &&
              resource.status !==
                statusFilter
            ) {
              return false;
            }


            if (!query) {
              return true;
            }


            return (
              resource.name
                ?.toLowerCase()
                .includes(query) ||
              resource.description
                ?.toLowerCase()
                .includes(query) ||
              resource.organizationName
                ?.toLowerCase()
                .includes(query)
            );
          }
        );
      },
      [
        visibleResources,
        searchValue,
        organizationFilter,
        typeFilter,
        statusFilter,
      ]
    );


  const canManageResource =
    (resource) => {

      const organization =
        organizations.find(
          (item) =>
            String(item.id) ===
            String(
              resource.organizationId
            )
        );


      const role =
        getUserOrganizationRole(
          organization,
          currentUser
        );


      return (
        role ===
          ORGANIZATION_ROLES.OWNER ||
        role ===
          ORGANIZATION_ROLES.ADMIN
      );
    };


  const openCreateForm =
    () => {

      setEditingResource(null);

      setForm({
        ...EMPTY_FORM,
      });

      setSelectedOrganizationId(
        manageableOrganizations
          .length === 1
          ? String(
              manageableOrganizations[0]
                .id
            )
          : ""
      );

      setFormError("");
      setIsFormOpen(true);
    };


  const openEditForm =
    (resource) => {

      setEditingResource(
        resource
      );

      setSelectedOrganizationId(
        String(
          resource.organizationId
        )
      );

      setForm({
        name:
          resource.name,

        description:
          resource.description ||
          "",

        type:
          resource.type,

        status:
          resource.status,

        capacity:
          String(
            resource.capacity ??
            100
          ),

        hourlyCost:
          String(
            resource.hourlyCost ??
            0
          ),

        unit:
          resource.unit ||
          "درصد",
      });

      setFormError("");
      setIsFormOpen(true);
    };


  const closeForm =
    () => {
      setIsFormOpen(false);
      setEditingResource(null);
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


      const organization =
        manageableOrganizations.find(
          (item) =>
            String(item.id) ===
            String(
              selectedOrganizationId
            )
        );


      if (!organization) {
        setFormError(
          "انتخاب سازمان الزامی است."
        );

        return;
      }


      if (
        form.name.trim().length <
        2
      ) {
        setFormError(
          "نام منبع باید حداقل ۲ کاراکتر باشد."
        );

        return;
      }


      if (
        Number(form.capacity) <
          0 ||
        Number(form.capacity) >
          100
      ) {
        setFormError(
          "ظرفیت باید بین ۰ تا ۱۰۰ باشد."
        );

        return;
      }


      const resourceData = {
        organizationId:
          organization.id,

        organizationName:
          organization.name,

        name:
          form.name.trim(),

        description:
          form.description.trim(),

        type:
          form.type,

        status:
          form.status,

        capacity:
          Number(
            form.capacity
          ),

        hourlyCost:
          Number(
            form.hourlyCost
          ),

        unit:
          form.unit.trim() ||
          "درصد",
      };


      if (editingResource) {
        updateResource(
          editingResource.id,
          resourceData
        );
      } else {
        createResource(
          resourceData
        );
      }


      setResources(
        getResources()
      );

      closeForm();
    };


  const handleDelete =
    (resource) => {

      if (
        !canManageResource(
          resource
        )
      ) {
        return;
      }


      deleteResource(
        resource.id
      );


      setResources(
        getResources()
      );
    };


  return (
    <section className="resources-page">

      <div className="resources-header">

        <div>
          <h2>
            منابع
          </h2>

          <p>
            مدیریت منابع سازمان و آماده‌سازی آن‌ها برای تخصیص به پروژه‌ها
          </p>
        </div>


        {manageableOrganizations
          .length > 0 && (

          <button
            type="button"
            className="resources-create-button"
            onClick={
              openCreateForm
            }
          >
            <Plus
              size={18}
            />

            افزودن منبع
          </button>
        )}

      </div>


      <div className="resources-toolbar">

        <div className="resources-search">

          <Search
            size={17}
          />

          <input
            type="text"
            value={
              searchValue
            }
            onChange={(
              event
            ) =>
              setSearchValue(
                event.target.value
              )
            }
            placeholder="جستجو در منابع..."
          />

        </div>


        <div className="resources-filters">

          <select
            value={
              organizationFilter
            }
            onChange={(
              event
            ) =>
              setOrganizationFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              همه سازمان‌ها
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


          <select
            value={
              typeFilter
            }
            onChange={(
              event
            ) =>
              setTypeFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              همه انواع
            </option>

            {Object.entries(
              RESOURCE_TYPE_LABELS
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {label}
                </option>
              )
            )}
          </select>


          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              همه وضعیت‌ها
            </option>

            {Object.entries(
              RESOURCE_STATUS_LABELS
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {label}
                </option>
              )
            )}
          </select>

        </div>

      </div>


      {loading ? (
        <div className="resources-empty">
          در حال بارگذاری منابع...
        </div>
      ) : filteredResources.length ===
        0 ? (
        <div className="resources-empty">

          <Gauge
            size={42}
          />

          <strong>
            هنوز منبعی ثبت نشده است
          </strong>

          <p>
            مالک یا مدیر سازمان می‌تواند اولین منبع را اضافه کند.
          </p>

        </div>
      ) : (
        <div className="resources-grid">

          {filteredResources.map(
            (resource) => {

              const canManage =
                canManageResource(
                  resource
                );


              return (
                <article
                  className="resource-card"
                  key={
                    resource.id
                  }
                >

                  <div className="resource-card-top">

                    <div className="resource-icon">
                      <Gauge
                        size={21}
                      />
                    </div>


                    <div className="resource-card-actions">

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                resource
                              )
                            }
                          >
                            <Pencil
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="resource-delete-button"
                            onClick={() =>
                              handleDelete(
                                resource
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </>
                      )}

                    </div>

                  </div>


                  <h3>
                    {resource.name}
                  </h3>


                  <p className="resource-description">
                    {resource.description ||
                      "توضیحی برای این منبع ثبت نشده است."}
                  </p>


                  <div className="resource-tags">

                    <span>
                      {
                        RESOURCE_TYPE_LABELS[
                          resource.type
                        ]
                      }
                    </span>

                    <span
                      className={`resource-status status-${resource.status.toLowerCase()}`}
                    >
                      {
                        RESOURCE_STATUS_LABELS[
                          resource.status
                        ]
                      }
                    </span>

                  </div>


                  <div className="resource-info">

                    <div>
                      <Building2
                        size={16}
                      />

                      <span>
                        {
                          resource.organizationName
                        }
                      </span>
                    </div>


                    <div>
                      <Gauge
                        size={16}
                      />

                      <span>
                        ظرفیت:
                        {" "}
                        {
                          resource.capacity
                        }
                        %
                      </span>
                    </div>


                    <div>
                      <CircleDollarSign
                        size={16}
                      />

                      <span>
                        {Number(
                          resource.hourlyCost
                        ).toLocaleString(
                          "fa-IR"
                        )}
                        {" "}
                        تومان / ساعت
                      </span>
                    </div>

                  </div>

                </article>
              );
            }
          )}

        </div>
      )}


      {isFormOpen && (

        <div
          className="resource-modal-backdrop"
          onMouseDown={
            closeForm
          }
        >

          <div
            className="resource-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="resource-modal-header">

              <div>
                <h3>
                  {editingResource
                    ? "ویرایش منبع"
                    : "افزودن منبع جدید"}
                </h3>

                <p>
                  مشخصات و ظرفیت منبع را ثبت کنید.
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
              className="resource-form"
              onSubmit={
                handleSubmit
              }
            >

              <label>
                سازمان
                <span>*</span>

                <select
                  value={
                    selectedOrganizationId
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedOrganizationId(
                      event.target.value
                    )
                  }
                  disabled={
                    Boolean(
                      editingResource
                    )
                  }
                >
                  <option value="">
                    انتخاب سازمان
                  </option>

                  {manageableOrganizations.map(
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

              </label>


              <label>
                نام منبع
                <span>*</span>

                <input
                  type="text"
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="مثلاً سرور تست یا طراح UI"
                />

              </label>


              <label>
                نوع منبع

                <select
                  name="type"
                  value={
                    form.type
                  }
                  onChange={
                    handleChange
                  }
                >
                  {Object.entries(
                    RESOURCE_TYPE_LABELS
                  ).map(
                    ([
                      value,
                      label,
                    ]) => (
                      <option
                        key={
                          value
                        }
                        value={
                          value
                        }
                      >
                        {label}
                      </option>
                    )
                  )}
                </select>

              </label>


              <label>
                وضعیت

                <select
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                >
                  {Object.entries(
                    RESOURCE_STATUS_LABELS
                  ).map(
                    ([
                      value,
                      label,
                    ]) => (
                      <option
                        key={
                          value
                        }
                        value={
                          value
                        }
                      >
                        {label}
                      </option>
                    )
                  )}
                </select>

              </label>


              <label>
                ظرفیت
                <span>*</span>

                <input
                  type="number"
                  name="capacity"
                  min="0"
                  max="100"
                  value={
                    form.capacity
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>
                هزینه ساعتی

                <input
                  type="number"
                  name="hourlyCost"
                  min="0"
                  value={
                    form.hourlyCost
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label className="resource-form-full">
                توضیحات

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  rows="4"
                  placeholder="توضیح کوتاه درباره منبع..."
                />

              </label>


              {formError && (
                <div className="resource-form-error">
                  {formError}
                </div>
              )}


              <div className="resource-form-actions">

                <button
                  type="button"
                  className="resource-cancel-button"
                  onClick={
                    closeForm
                  }
                >
                  انصراف
                </button>


                <button
                  type="submit"
                  className="resource-save-button"
                >
                  {editingResource
                    ? "ذخیره تغییرات"
                    : "افزودن منبع"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}


export default Resources;
