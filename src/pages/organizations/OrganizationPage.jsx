import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  Building2,
  BriefcaseBusiness,
  Check,
  CirclePlus,
  Info,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  acceptOrganizationInvitation,
  createOrganization,
  getMyOrganizationInvitations,
  getMyOrganizations,
  rejectOrganizationInvitation,
} from "../../services/organizationService";

import "./OrganizationPage.css";


const pickFirstString = (...values) => {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return "";
};


const getInvitationRoleLabel = (role) => {
  const roleName =
    typeof role === "string"
      ? role
      : role?.name;

  if (roleName === "ADMIN") {
    return "ادمین سازمان";
  }

  if (
    roleName === "MEMBER" ||
    roleName === "ORG_MEMBER"
  ) {
    return "عضو سازمان";
  }

  if (roleName === "OWNER") {
    return "مالک سازمان";
  }

  return roleName || "عضو سازمان";
};


const getInvitationOrganizationName = (
  invitation
) =>
  pickFirstString(
    invitation.organization_name,
    invitation.organizationName,
    invitation.organization?.name,
    invitation.organization?.title
  ) || "نام سازمان در دسترس نیست";


const getInvitationInviterName = (
  invitation
) =>
  pickFirstString(
    invitation.invited_by_name,
    invitation.inviter_name,
    invitation.inviterName,
    invitation.created_by_name,
    invitation.createdByName,
    invitation.invited_by?.full_name,
    invitation.invited_by?.username,
    invitation.inviter?.full_name,
    invitation.inviter?.username,
    invitation.created_by?.full_name,
    invitation.created_by?.username
  ) || "نام دعوت‌کننده ثبت نشده است";


const getInvitationOrganizationField = (
  invitation
) =>
  pickFirstString(
    invitation.organization_industry,
    invitation.organizationIndustry,
    invitation.organization_field,
    invitation.organizationField,
    invitation.organization?.industry,
    invitation.organization?.field,
    invitation.organization?.category
  );


const getInvitationOrganizationDescription =
  (invitation) =>
    pickFirstString(
      invitation.organization_description,
      invitation.organizationDescription,
      invitation.organization?.description,
      invitation.organization?.about
    );


const formatInvitationDate = (value) => {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toLocaleDateString(
      "fa-IR"
    );
  } catch {
    return "";
  }
};


const getInvitationErrorMessage = (
  error,
  fallback
) => {
  const detail =
    error.response?.data?.detail;

  const translations = {
    "Invitation not found":
      "دعوت‌نامه پیدا نشد.",

    "This invitation does not belong to you":
      "این دعوت‌نامه متعلق به حساب شما نیست.",

    "Invitation is no longer pending":
      "این دعوت‌نامه قبلاً پاسخ داده شده است.",

    "Invitation has expired":
      "مهلت این دعوت‌نامه به پایان رسیده است.",

    "You are already a member of this organization":
      "شما در حال حاضر عضو این سازمان هستید.",
  };

  if (
    typeof detail === "string" &&
    translations[detail]
  ) {
    return translations[detail];
  }

  if (typeof detail === "string") {
    return detail;
  }

  return fallback;
};


function OrganizationPage() {
  const navigate =
    useNavigate();

  const [
    organizations,
    setOrganizations,
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
    invitations,
    setInvitations,
  ] = useState([]);

  const [
    invitationLoading,
    setInvitationLoading,
  ] = useState(true);

  const [
    invitationError,
    setInvitationError,
  ] = useState("");

  const [
    invitationMessage,
    setInvitationMessage,
  ] = useState("");

  const [
    pendingInvitationId,
    setPendingInvitationId,
  ] = useState(null);

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");


  const loadOrganizations =
    async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await getMyOrganizations();

        setOrganizations(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (requestError) {
        console.error(
          "Get organizations error:",
          requestError
        );

        setError(
          "دریافت سازمان‌های شما با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };


  const loadInvitations =
    async (
      silent = false
    ) => {
      if (!silent) {
        setInvitationLoading(true);
      }

      setInvitationError("");

      try {
        const data =
          await getMyOrganizationInvitations();

        setInvitations(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (requestError) {
        console.error(
          "Get invitations error:",
          requestError
        );

        if (!silent) {
          setInvitationError(
            "دریافت دعوت‌نامه‌ها با خطا مواجه شد."
          );
        }
      } finally {
        if (!silent) {
          setInvitationLoading(false);
        }
      }
    };


  useEffect(() => {
    loadOrganizations();
    loadInvitations();

    const invitationTimer =
      window.setInterval(
        () => {
          loadInvitations(true);
        },
        30000
      );

    return () => {
      window.clearInterval(
        invitationTimer
      );
    };
  }, []);


  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setFormError("");

      const trimmedName =
        name.trim();

      const trimmedDescription =
        description.trim();

      if (
        trimmedName.length < 2
      ) {
        setFormError(
          "نام سازمان باید حداقل ۲ کاراکتر باشد."
        );

        return;
      }

      setSubmitting(true);

      try {
        const createdOrganization =
          await createOrganization({
            name: trimmedName,
            description:
              trimmedDescription ||
              null,
          });

        setOrganizations(
          (previousOrganizations) => [
            ...previousOrganizations,
            createdOrganization,
          ]
        );

        setName("");
        setDescription("");
      } catch (requestError) {
        console.error(
          "Create organization error:",
          requestError
        );

        const backendMessage =
          requestError
            ?.response
            ?.data
            ?.detail;

        setFormError(
          backendMessage ||
          "ایجاد سازمان با خطا مواجه شد."
        );
      } finally {
        setSubmitting(false);
      }
    };


  const handleAcceptInvitation =
    async (invitationId) => {
      setInvitationError("");
      setInvitationMessage("");
      setPendingInvitationId(
        invitationId
      );

      try {
        await acceptOrganizationInvitation(
          invitationId
        );

        setInvitationMessage(
          "دعوت‌نامه با موفقیت پذیرفته شد."
        );

        await Promise.all([
          loadOrganizations(),
          loadInvitations(),
        ]);
      } catch (requestError) {
        console.error(
          "Accept invitation error:",
          requestError
        );

        setInvitationError(
          getInvitationErrorMessage(
            requestError,
            "پذیرش دعوت‌نامه با خطا مواجه شد."
          )
        );
      } finally {
        setPendingInvitationId(null);
      }
    };


  const handleRejectInvitation =
    async (invitationId) => {
      setInvitationError("");
      setInvitationMessage("");
      setPendingInvitationId(
        invitationId
      );

      try {
        await rejectOrganizationInvitation(
          invitationId
        );

        setInvitationMessage(
          "دعوت‌نامه رد شد."
        );

        await loadInvitations();
      } catch (requestError) {
        console.error(
          "Reject invitation error:",
          requestError
        );

        setInvitationError(
          getInvitationErrorMessage(
            requestError,
            "رد دعوت‌نامه با خطا مواجه شد."
          )
        );
      } finally {
        setPendingInvitationId(null);
      }
    };


  return (
    <section className="organization-page">

      <div className="organization-page-header">

        <div>
          <h2>
            سازمان‌ها
          </h2>

          <p>
            سازمان‌های عضو شده یا ساخته‌شده توسط شما
          </p>
        </div>

        {invitations.length > 0 && (
          <div className="organization-invitation-alert">
            <Bell size={18} />
            <span>
              {invitations.length}
              {" "}
              دعوت‌نامه جدید
            </span>
          </div>
        )}

      </div>


      <div className="organization-invitations-card">

        <div className="organization-invitations-header">

          <div className="organization-invitations-title">

            <div className="organization-invitations-icon">
              <Bell size={20} />
            </div>

            <div>
              <h3>
                دعوت‌نامه‌های من
              </h3>

              <p>
                دعوت‌های عضویت در سازمان‌ها را بررسی و پاسخ دهید.
              </p>
            </div>

          </div>


          <div className="organization-invitations-header-actions">

            {invitations.length > 0 && (
              <span className="organization-invitation-count">
                {invitations.length}
                {" "}
                در انتظار پاسخ
              </span>
            )}

            <button
              type="button"
              className="organization-refresh-button"
              onClick={() =>
                loadInvitations()
              }
              disabled={
                invitationLoading
              }
              aria-label="بارگذاری مجدد دعوت‌نامه‌ها"
            >
              <RefreshCw
                size={18}
                className={
                  invitationLoading
                    ? "organization-spinner"
                    : ""
                }
              />
            </button>

          </div>

        </div>


        {invitationMessage && (
          <div className="organization-invitation-message success">
            {invitationMessage}
          </div>
        )}

        {invitationError && (
          <div className="organization-invitation-message error">
            {invitationError}
          </div>
        )}


        {invitationLoading ? (
          <div className="organization-invitation-state">
            <RefreshCw
              size={22}
              className="organization-spinner"
            />
            <span>
              در حال بررسی دعوت‌نامه‌ها...
            </span>
          </div>
        ) : invitations.length === 0 ? (
          <div className="organization-invitation-empty">
            <Bell size={28} />
            <div>
              <strong>
                دعوت‌نامه جدیدی ندارید
              </strong>
              <span>
                اگر سازمانی شما را دعوت کند، در این بخش نمایش داده می‌شود.
              </span>
            </div>
          </div>
        ) : (
          <div className="organization-invitation-list">

            {invitations.map(
              (invitation) => {
                const isPending =
                  Number(
                    pendingInvitationId
                  ) ===
                  Number(
                    invitation.id
                  );

                const organizationName =
                  getInvitationOrganizationName(
                    invitation
                  );

                const inviterName =
                  getInvitationInviterName(
                    invitation
                  );

                const organizationField =
                  getInvitationOrganizationField(
                    invitation
                  );

                const organizationDescription =
                  getInvitationOrganizationDescription(
                    invitation
                  );

                const invitationDate =
                  formatInvitationDate(
                    invitation.created_at
                  );

                return (
                  <article
                    key={
                      invitation.id
                    }
                    className="organization-invitation-item"
                  >

                    <div className="organization-invitation-main">

                      <div className="organization-invitation-building">
                        <Building2 size={21} />
                      </div>

                      <div className="organization-invitation-info">

                        <strong>
                          {organizationName}
                        </strong>

                        <div className="organization-invitation-meta">

                          <span>
                            <UserRound size={14} />
                            دعوت‌کننده:
                            {" "}
                            {inviterName}
                          </span>

                          <span>
                            <ShieldCheck size={14} />
                            نقش پیشنهادی:
                            {" "}
                            {getInvitationRoleLabel(
                              invitation.role
                            )}
                          </span>

                          {invitationDate && (
                            <span>
                              <Info size={14} />
                              تاریخ دعوت:
                              {" "}
                              {invitationDate}
                            </span>
                          )}

                        </div>

                        {(organizationField ||
                          organizationDescription) && (
                          <div className="organization-invitation-summary">

                            {organizationField && (
                              <p>
                                <BriefcaseBusiness size={14} />
                                <span>
                                  حوزه فعالیت:
                                </span>
                                {organizationField}
                              </p>
                            )}

                            {organizationDescription && (
                              <p>
                                <Info size={14} />
                                <span>
                                  درباره سازمان:
                                </span>
                                {organizationDescription}
                              </p>
                            )}

                          </div>
                        )}

                      </div>

                    </div>


                    <div className="organization-invitation-actions">

                      <button
                        type="button"
                        className="organization-invitation-accept"
                        disabled={
                          isPending
                        }
                        onClick={() =>
                          handleAcceptInvitation(
                            invitation.id
                          )
                        }
                      >
                        <Check size={16} />
                        پذیرش
                      </button>

                      <button
                        type="button"
                        className="organization-invitation-reject"
                        disabled={
                          isPending
                        }
                        onClick={() =>
                          handleRejectInvitation(
                            invitation.id
                          )
                        }
                      >
                        <X size={16} />
                        رد
                      </button>

                    </div>

                  </article>
                );
              }
            )}

          </div>
        )}

      </div>


      <div className="organization-layout">

        <div className="organization-create-card">

          <div className="organization-card-title">
            <CirclePlus size={21} />

            <div>
              <h3>
                ایجاد سازمان جدید
              </h3>

              <p>
                با ایجاد سازمان، شما به عنوان مالک آن ثبت می‌شوید.
              </p>
            </div>
          </div>


          <form
            className="organization-form"
            onSubmit={handleSubmit}
          >

            <div className="organization-field">
              <label htmlFor="organization-name">
                نام سازمان
              </label>

              <input
                id="organization-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                maxLength={150}
                placeholder="مثلاً شرکت توسعه نرم‌افزار"
              />
            </div>


            <div className="organization-field">
              <label htmlFor="organization-description">
                توضیحات
              </label>

              <textarea
                id="organization-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                maxLength={1000}
                rows={5}
                placeholder="توضیح کوتاهی درباره سازمان..."
              />
            </div>


            {formError && (
              <div className="organization-form-error">
                {formError}
              </div>
            )}


            <button
              type="submit"
              className="organization-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw
                    size={17}
                    className="organization-spinner"
                  />
                  در حال ایجاد...
                </>
              ) : (
                <>
                  <CirclePlus size={18} />
                  ایجاد سازمان
                </>
              )}
            </button>

          </form>

        </div>


        <div className="organization-list-card">

          <div className="organization-list-header">

            <div>
              <h3>
                سازمان‌های من
              </h3>

              <span>
                {organizations.length}
                {" "}
                سازمان
              </span>
            </div>

            <button
              type="button"
              className="organization-refresh-button"
              onClick={
                loadOrganizations
              }
              disabled={loading}
              aria-label="بارگذاری مجدد"
            >
              <RefreshCw
                size={18}
                className={
                  loading
                    ? "organization-spinner"
                    : ""
                }
              />
            </button>

          </div>


          {loading ? (
            <div className="organization-state">
              <RefreshCw
                size={25}
                className="organization-spinner"
              />
              <span>
                در حال دریافت سازمان‌ها...
              </span>
            </div>
          ) : error ? (
            <div className="organization-state organization-error">
              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={
                  loadOrganizations
                }
              >
                تلاش مجدد
              </button>
            </div>
          ) : organizations.length === 0 ? (
            <div className="organization-empty">
              <Building2 size={42} />

              <h4>
                هنوز سازمانی ندارید
              </h4>

              <p>
                اولین سازمان خود را از فرم کنار صفحه ایجاد کنید یا دعوت‌نامه‌های خود را بررسی کنید.
              </p>
            </div>
          ) : (
            <div className="organization-list">

              {organizations.map(
                (organization) => (
                  <button
                    type="button"
                    key={
                      organization.id
                    }
                    className="organization-item organization-item-button"
                    onClick={() =>
                      navigate(
                        `/organizations/${organization.id}`,
                        {
                          state: {
                            organization,
                          },
                        }
                      )
                    }
                  >

                    <div className="organization-item-icon">
                      <Building2 size={22} />
                    </div>

                    <div className="organization-item-content">
                      <h4>
                        {organization.name}
                      </h4>

                      <p>
                        {organization.description ||
                          "توضیحی ثبت نشده است."}
                      </p>

                      <span>
                        شناسه مالک:
                        {" "}
                        {organization.owner_id}
                      </span>
                    </div>

                  </button>
                )
              )}

            </div>
          )}

        </div>

      </div>

    </section>
  );
}


export default OrganizationPage;
