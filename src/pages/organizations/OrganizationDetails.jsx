import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowRight,
  Building2,
  Crown,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import {
  getCurrentUser,
} from "../../services/authService";

import {
  deleteOrganization,
  getMyOrganizations,
  getOrganizationMembers,
  inviteOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "../../services/organizationService";

import {
  ORGANIZATION_MEMBER_ROLE_OPTIONS,
  ORGANIZATION_ROLE_LABELS,
  ORGANIZATION_ROLES,
} from "../../constants/roles";

import "./OrganizationDetails.css";


const getRequestErrorMessage = (
  error,
  fallback
) => {
  const detail =
    error.response?.data?.detail;

  const translations = {
    "User not found":
      "کاربری با این نام کاربری پیدا نشد.",

    "User is already a member of this organization":
      "این کاربر در حال حاضر عضو سازمان است.",

    "A pending invitation already exists":
      "قبلاً برای این کاربر دعوت‌نامه ارسال شده و هنوز در انتظار پاسخ است.",

    "You cannot invite yourself":
      "نمی‌توانید خودتان را به سازمان دعوت کنید.",

    "You do not have permission to invite members":
      "اجازه دعوت عضو جدید را ندارید.",

    "You do not have permission to remove members":
      "اجازه حذف اعضای سازمان را ندارید.",

    "Only the organization owner can change member roles":
      "فقط مالک سازمان می‌تواند نقش اعضا را تغییر دهد.",

    "The organization owner cannot be removed":
      "مالک سازمان قابل حذف نیست.",

    "You cannot remove yourself from the organization":
      "نمی‌توانید خودتان را از سازمان حذف کنید.",
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


function OrganizationDetails() {
  const {
    id: organizationId,
  } = useParams();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    organization,
    setOrganization,
  ] = useState(
    location.state?.organization ||
      null
  );

  const [
    currentUser,
    setCurrentUser,
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
    error,
    setError,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");


  const [
    inviteUsername,
    setInviteUsername,
  ] = useState("");

  const [
    selectedRole,
    setSelectedRole,
  ] = useState(
    ORGANIZATION_ROLES.ORG_MEMBER
  );

  const [
    inviting,
    setInviting,
  ] = useState(false);

  const [
    pendingMemberId,
    setPendingMemberId,
  ] = useState(null);


  const [
    deletingOrganization,
    setDeletingOrganization,
  ] = useState(false);


  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError("");

      try {
        const user =
          await getCurrentUser();

        setCurrentUser(user);

        let loadedOrganization =
          location.state?.organization ||
          null;

        if (
          !loadedOrganization ||
          String(
            loadedOrganization.id
          ) !==
            String(
              organizationId
            )
        ) {
          const organizations =
            await getMyOrganizations();

          loadedOrganization =
            organizations.find(
              (item) =>
                String(item.id) ===
                String(
                  organizationId
                )
            ) || null;
        }

        if (!loadedOrganization) {
          setError(
            "سازمان موردنظر پیدا نشد."
          );

          return;
        }

        setOrganization(
          loadedOrganization
        );

        const loadedMembers =
          await getOrganizationMembers(
            loadedOrganization.id
          );

        setMembers(
          loadedMembers
        );
      } catch (requestError) {
        console.error(
          "Load organization details error:",
          requestError
        );

        setError(
          "دریافت اطلاعات سازمان با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [
    organizationId,
    location.state,
  ]);


  const currentMember =
    useMemo(
      () =>
        members.find(
          (member) =>
            Number(
              member.user_id
            ) ===
            Number(
              currentUser?.id
            )
        ) || null,
      [
        members,
        currentUser,
      ]
    );


  const currentRole =
    currentMember?.role ||
    (
      Number(
        organization?.owner_id
      ) ===
      Number(
        currentUser?.id
      )
        ? ORGANIZATION_ROLES.OWNER
        : ORGANIZATION_ROLES.ORG_MEMBER
    );


  const canManageMembers =
    currentRole ===
      ORGANIZATION_ROLES.OWNER ||
    currentRole ===
      ORGANIZATION_ROLES.ADMIN;


  const canChangeRoles =
    currentRole ===
    ORGANIZATION_ROLES.OWNER;


  const canDeleteOrganization =
    currentRole ===
    ORGANIZATION_ROLES.OWNER;


  const clearMessages = () => {
    setActionError("");
    setActionMessage("");
  };


  const getMemberDisplay = (
    member
  ) => {
    const isCurrentUser =
      Number(
        member.user_id
      ) ===
      Number(
        currentUser?.id
      );


    const username =
      member.username ||
      member.user?.username ||
      (
        isCurrentUser
          ? currentUser?.username
          : ""
      ) ||
      "";


    const fullName =
      member.full_name ||
      member.user?.full_name ||
      (
        isCurrentUser
          ? currentUser?.full_name
          : ""
      ) ||
      username ||
      `کاربر #${member.user_id}`;


    return {
      fullName,

      secondary:
        username
          ? `@${username}`
          : `شناسه کاربر: ${member.user_id}`,
    };
  };


  const canRemoveMember = (
    member
  ) => {
    if (!canManageMembers) {
      return false;
    }

    if (
      member.role ===
      ORGANIZATION_ROLES.OWNER
    ) {
      return false;
    }

    if (
      Number(member.user_id) ===
      Number(currentUser?.id)
    ) {
      return false;
    }

    return true;
  };


  const canChangeMemberRole = (
    member
  ) => {
    if (!canChangeRoles) {
      return false;
    }

    if (
      member.role ===
      ORGANIZATION_ROLES.OWNER
    ) {
      return false;
    }

    if (
      Number(member.user_id) ===
      Number(currentUser?.id)
    ) {
      return false;
    }

    return true;
  };


  const handleInviteMember =
    async () => {
      clearMessages();

      const username =
        inviteUsername.trim();

      if (
        !canManageMembers ||
        inviting
      ) {
        return;
      }

      if (username.length < 3) {
        setActionError(
          "نام کاربری باید حداقل ۳ کاراکتر باشد."
        );

        return;
      }

      setInviting(true);

      try {
        await inviteOrganizationMember(
          organization.id,
          {
            username,
            role: selectedRole,
          }
        );

        setActionMessage(
          "دعوت‌نامه با موفقیت ارسال شد. کاربر پس از پذیرش دعوت به اعضای سازمان اضافه می‌شود."
        );

        setInviteUsername("");

        setSelectedRole(
          ORGANIZATION_ROLES.ORG_MEMBER
        );
      } catch (requestError) {
        console.error(
          "Invite organization member error:",
          requestError
        );

        setActionError(
          getRequestErrorMessage(
            requestError,
            "ارسال دعوت‌نامه با خطا مواجه شد."
          )
        );
      } finally {
        setInviting(false);
      }
    };


  const handleRoleChange =
    async (
      userId,
      nextRole
    ) => {
      clearMessages();

      const member =
        members.find(
          (item) =>
            Number(item.user_id) ===
            Number(userId)
        );

      if (
        !member ||
        !canChangeMemberRole(member)
      ) {
        return;
      }

      setPendingMemberId(
        userId
      );

      try {
        const updatedMember =
          await updateOrganizationMemberRole(
            organization.id,
            userId,
            nextRole
          );

        setMembers(
          (currentMembers) =>
            currentMembers.map(
              (item) =>
                Number(
                  item.user_id
                ) ===
                Number(userId)
                  ? {
                      ...item,
                      ...updatedMember,
                    }
                  : item
            )
        );

        setActionMessage(
          "نقش عضو با موفقیت تغییر کرد."
        );
      } catch (requestError) {
        console.error(
          "Update organization member role error:",
          requestError
        );

        setActionError(
          getRequestErrorMessage(
            requestError,
            "تغییر نقش عضو با خطا مواجه شد."
          )
        );
      } finally {
        setPendingMemberId(null);
      }
    };


  const handleRemoveMember =
    async (member) => {
      clearMessages();

      if (
        !canRemoveMember(member)
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `آیا از حذف «${getMemberDisplay(member).fullName}» از سازمان مطمئن هستید؟`
        );

      if (!confirmed) {
        return;
      }

      setPendingMemberId(
        member.user_id
      );

      try {
        await removeOrganizationMember(
          organization.id,
          member.user_id
        );

        setMembers(
          (currentMembers) =>
            currentMembers.filter(
              (item) =>
                Number(
                  item.user_id
                ) !==
                Number(
                  member.user_id
                )
            )
        );

        setActionMessage(
          "عضو با موفقیت از سازمان حذف شد."
        );
      } catch (requestError) {
        console.error(
          "Remove organization member error:",
          requestError
        );

        setActionError(
          getRequestErrorMessage(
            requestError,
            "حذف عضو با خطا مواجه شد."
          )
        );
      } finally {
        setPendingMemberId(null);
      }
    };


  const handleDeleteOrganizationUi =
    async () => {
      clearMessages();

      if (
        !canDeleteOrganization ||
        deletingOrganization
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `آیا از حذف کامل سازمان «${organization.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`
        );

      if (!confirmed) {
        return;
      }

      setDeletingOrganization(true);

      try {
        await deleteOrganization(
          organization.id
        );

        navigate(
          "/organizations",
          {
            replace: true,
          }
        );
      } catch (requestError) {
        console.error(
          "Delete organization error:",
          requestError
        );

        setActionError(
          getRequestErrorMessage(
            requestError,
            "حذف سازمان با خطا مواجه شد."
          )
        );
      } finally {
        setDeletingOrganization(false);
      }
    };



  
  const getOrganizationRolePriority =
    (member) => {
      const role =
        typeof member?.role === "string"
          ? member.role
          : member?.role?.name;

      const priorities = {
        OWNER: 0,
        ADMIN: 1,
        ORG_MEMBER: 2,
        MEMBER: 2,
      };

      return priorities[role] ?? 99;
    };


  const sortedMembers =
    [...members].sort(
      (memberA, memberB) => {
        const priorityDifference =
          getOrganizationRolePriority(
            memberA
          ) -
          getOrganizationRolePriority(
            memberB
          );

        if (
          priorityDifference !== 0
        ) {
          return priorityDifference;
        }

        const nameA =
          (
            memberA?.full_name ||
            memberA?.username ||
            ""
          ).trim();

        const nameB =
          (
            memberB?.full_name ||
            memberB?.username ||
            ""
          ).trim();

        return nameA.localeCompare(
          nameB,
          "fa"
        );
      }
    );


  if (loading) {
    return (
      <section className="organization-details-page">
        <div className="organization-details-state">
          در حال دریافت اطلاعات سازمان...
        </div>
      </section>
    );
  }


  if (
    error ||
    !organization
  ) {
    return (
      <section className="organization-details-page">
        <div className="organization-details-state">
          <p>
            {error ||
              "سازمان پیدا نشد."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/organizations"
              )
            }
          >
            بازگشت به سازمان‌ها
          </button>
        </div>
      </section>
    );
  }


  return (
    <section className="organization-details-page">

      <div className="organization-details-topbar">

        <button
          type="button"
          className="organization-back-button"
          onClick={() =>
            navigate(
              "/organizations"
            )
          }
        >
          <ArrowRight
            size={18}
          />

          سازمان‌ها
        </button>


        <div className="organization-topbar-actions">

          {canDeleteOrganization && (
            <button
              type="button"
              className="organization-delete-button"
              disabled={
                deletingOrganization
              }
              onClick={
                handleDeleteOrganizationUi
              }
            >
              <Trash2 size={16} />

              {deletingOrganization
                ? "در حال حذف..."
                : "حذف سازمان"}
            </button>
          )}

          <span
            className="organization-current-role"
          >
            <ShieldCheck
              size={16}
            />

            {ORGANIZATION_ROLE_LABELS[
              currentRole
            ] ||
              "عضو سازمان"}
          </span>

        </div>

      </div>


      <div className="organization-details-hero">

        <div className="organization-hero-icon">
          <Building2
            size={31}
          />
        </div>


        <div className="organization-hero-content">

          <h2>
            {organization.name}
          </h2>

          <p>
            {organization.description ||
              "توضیحی برای این سازمان ثبت نشده است."}
          </p>

        </div>


        <div className="organization-hero-meta">

          <span>
            <Crown
              size={16}
            />

            شناسه مالک:
            {" "}
            {organization.owner_id}
          </span>


          <span>
            <Users
              size={16}
            />

            {members.length}
            {" "}
            عضو
          </span>

        </div>

      </div>


      {actionMessage && (
        <div className="organization-action-message success">
          {actionMessage}
        </div>
      )}


      {actionError && (
        <div className="organization-action-message error">
          {actionError}
        </div>
      )}

<div className="organization-members-title">

        <div>
          <h3>
            مدیریت اعضای سازمان
          </h3>

          <p>
            اعضای واقعی سازمان و سطح دسترسی سازمانی آن‌ها
          </p>
        </div>

      </div>


      <div className="organization-members-layout">

        <div className="organization-members-card">

          <div className="organization-section-header">

            <div>
              <h3>
                اعضای سازمان
              </h3>

              <p>
                این لیست مستقیماً از بک‌اند دریافت می‌شود.
              </p>
            </div>

            <span className="organization-member-count">
              {members.length}
              {" "}
              عضو
            </span>

          </div>


          <div className="organization-member-list">

            {members.length === 0 ? (
              <div className="organization-no-result">
                عضوی برای این سازمان ثبت نشده است.
              </div>
            ) : (
              sortedMembers.map(
                (member) => {
                  const isOwner =
                    member.role ===
                    ORGANIZATION_ROLES.OWNER;

                  const removable =
                    canRemoveMember(
                      member
                    );

                  const roleEditable =
                    canChangeMemberRole(
                      member
                    );

                  const memberDisplay =
                    getMemberDisplay(
                      member
                    );

                  const isPending =
                    Number(
                      pendingMemberId
                    ) ===
                    Number(
                      member.user_id
                    );

                  return (
                    <article
                      key={
                        member.user_id
                      }
                      className="organization-member-item"
                    >

                      <div className="organization-member-avatar">
                        {memberDisplay
                          .fullName
                          ?.charAt(0) ||
                          "U"}
                      </div>


                      <div className="organization-member-info">

                        <strong>
                          {memberDisplay.fullName}
                        </strong>

                        <span>
                          {memberDisplay.secondary}
                        </span>

                      </div>


                      <div className="organization-member-role">

                        {isOwner ? (
                          <span className="organization-owner-badge">

                            <Crown
                              size={14}
                            />

                            مالک سازمان

                          </span>
                        ) : roleEditable ? (
                          <select
                            value={
                              member.role
                            }
                            disabled={
                              isPending
                            }
                            onChange={(
                              event
                            ) =>
                              handleRoleChange(
                                member.user_id,
                                event.target.value
                              )
                            }
                          >

                            {ORGANIZATION_MEMBER_ROLE_OPTIONS.map(
                              (
                                option
                              ) => (
                                <option
                                  key={
                                    option.value
                                  }
                                  value={
                                    option.value
                                  }
                                >
                                  {option.label}
                                </option>
                              )
                            )}

                          </select>
                        ) : (
                          <span className="organization-role-badge">

                            {
                              ORGANIZATION_ROLE_LABELS[
                                member.role
                              ] ||
                              member.role
                            }

                          </span>
                        )}

                      </div>


                      {removable && (
                        <button
                          type="button"
                          className="organization-remove-member"
                          disabled={
                            isPending
                          }
                          onClick={() =>
                            handleRemoveMember(
                              member
                            )
                          }
                          aria-label="حذف عضو"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      )}

                    </article>
                  );
                }
              )
            )}

          </div>

        </div>


        <div className="organization-add-member-card">

          <div className="organization-section-header">

            <div>
              <h3>
                دعوت عضو
              </h3>

              <p>
                دعوت کاربر ثبت‌شده با نام کاربری دقیق
              </p>
            </div>

            <UserPlus
              size={21}
            />

          </div>


          {!canManageMembers ? (
            <div className="organization-permission-message">
              فقط مالک یا مدیر سازمان می‌تواند عضو جدید دعوت کند.
            </div>
          ) : (
            <>

              <div className="organization-member-search">

                <Search
                  size={18}
                />

                <input
                  type="text"
                  dir="ltr"
                  value={
                    inviteUsername
                  }
                  onChange={(
                    event
                  ) => {
                    setInviteUsername(
                      event.target.value
                    );

                    clearMessages();
                  }}
                  placeholder="username"
                />

              </div>


              <div className="organization-search-caption">
                بک‌اند فعلی API جستجوی بخشی کاربران ندارد؛ نام کاربری ثبت‌شده را دقیق وارد کنید.
              </div>


              <div className="organization-invite-controls">

                <label>
                  نقش سازمانی

                  <select
                    value={
                      selectedRole
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedRole(
                        event.target.value
                      )
                    }
                  >

                    {ORGANIZATION_MEMBER_ROLE_OPTIONS.map(
                      (
                        option
                      ) => (
                        <option
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </option>
                      )
                    )}

                  </select>
                </label>


                <button
                  type="button"
                  disabled={
                    inviting ||
                    inviteUsername
                      .trim()
                      .length < 3
                  }
                  onClick={
                    handleInviteMember
                  }
                >

                  <UserPlus
                    size={17}
                  />

                  {inviting
                    ? "در حال ارسال..."
                    : "ارسال دعوت‌نامه"}

                </button>

              </div>

            </>
          )}

        </div>

      </div>

    </section>
  );
}


export default OrganizationDetails;


