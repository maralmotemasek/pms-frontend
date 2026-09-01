export const ORGANIZATION_ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  ORG_MEMBER: "ORG_MEMBER",
};


export const ORGANIZATION_ROLE_LABELS = {
  [ORGANIZATION_ROLES.OWNER]: "مالک سازمان",
  [ORGANIZATION_ROLES.ADMIN]: "مدیر سازمان",
  [ORGANIZATION_ROLES.ORG_MEMBER]: "عضو سازمان",
};


export const ORGANIZATION_MEMBER_ROLE_OPTIONS = [
  {
    value: ORGANIZATION_ROLES.ADMIN,
    label: "مدیر سازمان",
  },
  {
    value: ORGANIZATION_ROLES.ORG_MEMBER,
    label: "عضو سازمان",
  },
];


export const PROJECT_ROLES = {
  MANAGER: "MANAGER",
  TEAM_LEAD: "TEAM_LEAD",
  PR_MEMBER: "PR_MEMBER",
};


export const PROJECT_ROLE_LABELS = {
  [PROJECT_ROLES.MANAGER]: "مدیر پروژه",
  [PROJECT_ROLES.TEAM_LEAD]: "سرپرست تیم",
  [PROJECT_ROLES.PR_MEMBER]: "عضو پروژه",
};
