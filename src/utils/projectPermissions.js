import {
  ORGANIZATION_ROLES,
  PROJECT_ROLES,
} from "../data/projectMockData";


/*
  پیدا کردن عضویت یک User
  در یک Project
*/
export const getProjectMembership = (
  project,
  userId
) => {
  if (
    !project ||
    !Array.isArray(project.members)
  ) {
    return null;
  }


  return (
    project.members.find(
      (member) =>
        Number(member.userId) ===
        Number(userId)
    ) || null
  );
};


/*
  پیدا کردن مدیر فعلی پروژه
*/
export const getProjectManager = (
  project
) => {
  if (
    !project ||
    !Array.isArray(project.members)
  ) {
    return null;
  }


  return (
    project.members.find(
      (member) =>
        member.role ===
        PROJECT_ROLES.PROJECT_MANAGER
    ) || null
  );
};


/*
  فعلاً Project List فقط پروژه‌هایی را نشان می‌دهد
  که User در آن ProjectMember باشد.
*/
export const canViewProject = (
  user,
  project
) => {
  if (!user || !project) {
    return false;
  }


  return Boolean(
    getProjectMembership(
      project,
      user.id
    )
  );
};


/*
  طبق مستندی که داریم:

  OWNER:
  create projects

  بنابراین فعلاً فقط OWNER
  امکان Create Project دارد.
*/
export const canCreateProject = (
  user
) => {
  if (!user) {
    return false;
  }


  return (
    user.organizationRole ===
    ORGANIZATION_ROLES.OWNER
  );
};


/*
  طبق مستند:

  ADMIN:
  manage projects

  PROJECT_MANAGER:
  manage assigned projects

  پس:
  - ADMIN می‌تواند پروژه را Edit کند.
  - PROJECT_MANAGER فقط پروژه‌ای را Edit می‌کند
    که داخل همان پروژه این Role را داشته باشد.

  برای OWNER فعلاً Edit را فرض نمی‌کنیم،
  چون مستند صریحاً آن را نگفته.
*/
export const canEditProject = (
  user,
  project
) => {
  if (!user || !project) {
    return false;
  }


  if (
    user.organizationRole ===
    ORGANIZATION_ROLES.ADMIN
  ) {
    return true;
  }


  const membership =
    getProjectMembership(
      project,
      user.id
    );


  return (
    membership?.role ===
    PROJECT_ROLES.PROJECT_MANAGER
  );
};


/*
  تبدیل Roleهای Backend
  به متن فارسی برای UI
*/
export const getProjectRoleLabel = (
  role
) => {
  switch (role) {
    case PROJECT_ROLES.PROJECT_MANAGER:
      return "مدیر پروژه";

    case PROJECT_ROLES.TEAM_LEAD:
      return "سرپرست تیم";

    case PROJECT_ROLES.MEMBER:
      return "عضو پروژه";

    default:
      return "عضو پروژه";
  }
};