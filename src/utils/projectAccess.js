import {
  ORGANIZATION_ROLES,
  PROJECT_ROLE_LABELS,
} from "../constants/roles";

import {
  loadOrganizationMembers,
} from "../data/organizationUiMockData";

import {
  getProjectMembership,
  normalizeProjectRole,
} from "../data/projectWorkspaceStore";


export function getProjectOrganization(
  project,
  organizations
) {
  if (
    !project ||
    !Array.isArray(organizations)
  ) {
    return null;
  }


  return (
    organizations.find(
      (organization) =>
        String(
          organization.id
        ) ===
        String(
          project.organizationId
        )
    ) || null
  );
}


export function getUserOrganizationRole(
  organization,
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
    Number(user.id)
  ) {
    return ORGANIZATION_ROLES.OWNER;
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


export function getProjectOrganizationRole(
  project,
  user,
  organizations
) {
  const organization =
    getProjectOrganization(
      project,
      organizations
    );


  return getUserOrganizationRole(
    organization,
    user
  );
}


export function canCreateProjectFromOrganizations(
  user,
  organizations
) {
  if (
    !user ||
    !Array.isArray(organizations)
  ) {
    return false;
  }


  return organizations.some(
    (organization) => {

      const role =
        getUserOrganizationRole(
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
}


export function canViewWorkspaceProject(
  user,
  project,
  organizations
) {
  if (
    !user ||
    !project
  ) {
    return false;
  }


  const organizationRole =
    getProjectOrganizationRole(
      project,
      user,
      organizations
    );


  if (
    organizationRole ===
      ORGANIZATION_ROLES.OWNER ||
    organizationRole ===
      ORGANIZATION_ROLES.ADMIN
  ) {
    return true;
  }


  return Boolean(
    getProjectMembership(
      project,
      user.id
    )
  );
}


/*
  مدیریت تنظیمات اصلی پروژه و اعضای پروژه:

  فقط OWNER یا ADMIN سازمان.
*/
export function canManageWorkspaceProject(
  user,
  project,
  organizations
) {
  if (
    !user ||
    !project
  ) {
    return false;
  }


  const organizationRole =
    getProjectOrganizationRole(
      project,
      user,
      organizations
    );


  return (
    organizationRole ===
      ORGANIZATION_ROLES.OWNER ||
    organizationRole ===
      ORGANIZATION_ROLES.ADMIN
  );
}


export function getProjectRoleLabel(
  role
) {
  if (!role) {
    return "دسترسی سازمانی";
  }


  const normalizedRole =
    normalizeProjectRole(
      role
    );


  return (
    PROJECT_ROLE_LABELS[
      normalizedRole
    ] ||
    "عضو پروژه"
  );
}
