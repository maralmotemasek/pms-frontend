import api from "./api";


const BACKEND_PROJECT_ROLES = {
  MANAGER: "PROJECT_MANAGER",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  TEAM_LEAD: "TEAM_LEAD",
  PR_MEMBER: "PR_MEMBER",
};


const UI_PROJECT_ROLES = {
  PROJECT_MANAGER: "MANAGER",
  MANAGER: "MANAGER",
  TEAM_LEAD: "TEAM_LEAD",
  PR_MEMBER: "PR_MEMBER",
};


const BACKEND_STATUS_MAP = {
  planning: "PLANNING",
  "in-progress": "IN_PROGRESS",
  delayed: "DELAYED",
  review: "REVIEW",
  completed: "COMPLETED",
};


const UI_STATUS_MAP = {
  PLANNING: "planning",
  IN_PROGRESS: "in-progress",
  ACTIVE: "in-progress",
  DELAYED: "delayed",
  REVIEW: "review",
  COMPLETED: "completed",
};


export const toBackendProjectRole = (
  role
) => {
  return (
    BACKEND_PROJECT_ROLES[
      role
    ] ||
    role
  );
};


export const fromBackendProjectRole = (
  role
) => {
  const roleName =
    typeof role === "string"
      ? role
      : role?.name;

  return (
    UI_PROJECT_ROLES[
      roleName
    ] ||
    roleName ||
    "PR_MEMBER"
  );
};


export const toBackendProjectStatus = (
  status
) => {
  return (
    BACKEND_STATUS_MAP[
      status
    ] ||
    status ||
    "PLANNING"
  );
};


export const fromBackendProjectStatus = (
  status
) => {
  if (!status) {
    return "planning";
  }

  return (
    UI_STATUS_MAP[
      String(status).toUpperCase()
    ] ||
    String(status)
      .toLowerCase()
      .replaceAll("_", "-")
  );
};


export const normalizeProjectMember = (
  member,
  user = null
) => {
  return {
    id:
      member.id,

    projectId:
      member.project_id,

    userId:
      member.user_id,

    fullName:
      member.full_name ||
      member.user?.full_name ||
      user?.full_name ||
      member.username ||
      member.user?.username ||
      user?.username ||
      `کاربر #${member.user_id}`,

    username:
      member.username ||
      member.user?.username ||
      user?.username ||
      "",

    role:
      fromBackendProjectRole(
        member.project_role
      ),

    joinedAt:
      member.joined_at,
  };
};


export const normalizeProject = (
  project,
  options = {}
) => {
  const {
    organizationName = "",
    members = [],
    currentProjectRole = null,
  } = options;

  return {
    id:
      project.id,

    organizationId:
      project.organization_id,

    organizationName,

    title:
      project.name,

    name:
      project.name,

    description:
      project.description ||
      "",

    status:
      fromBackendProjectStatus(
        project.status
      ),

    backendStatus:
      project.status,

    priority:
      project.priority ||
      "MEDIUM",

    startDate:
      project.start_date ||
      null,

    endDate:
      project.end_date ||
      null,

    budget:
      project.budget ??
      0,

    progress:
      Number(
        project.progress
      ) || 0,

    members,

    currentProjectRole:
      currentProjectRole
        ? fromBackendProjectRole(
            currentProjectRole
          )
        : null,

    createdAt:
      project.created_at ||
      null,

    updatedAt:
      project.updated_at ||
      null,
  };
};


const createBackendProjectPayload = (
  data,
  includeDefaults = false
) => {
  const payload = {};

  if (
    data.title !== undefined ||
    data.name !== undefined
  ) {
    payload.name =
      String(
        data.title ??
        data.name
      ).trim();
  }

  if (
    data.description !==
    undefined
  ) {
    payload.description =
      data.description
        ? String(
            data.description
          ).trim()
        : null;
  }

  if (
    data.budget !==
    undefined
  ) {
    if (
      data.budget === "" ||
      data.budget === null
    ) {
      payload.budget =
        null;
    } else {
      payload.budget =
        Number(
          data.budget
        );
    }
  }

  if (
    data.startDate !==
    undefined
  ) {
    payload.start_date =
      data.startDate ||
      null;
  }

  if (
    data.endDate !==
    undefined
  ) {
    payload.end_date =
      data.endDate ||
      null;
  }

  if (
    data.status !==
    undefined
  ) {
    payload.status =
      toBackendProjectStatus(
        data.status
      );
  } else if (
    includeDefaults
  ) {
    payload.status =
      "PLANNING";
  }

  if (
    data.priority !==
    undefined
  ) {
    payload.priority =
      String(
        data.priority
      ).toUpperCase();
  } else if (
    includeDefaults
  ) {
    payload.priority =
      "MEDIUM";
  }

  return payload;
};


export const getOrganizationProjects = async (
  organizationId
) => {
  const response =
    await api.get(
      `/organizations/${organizationId}/projects`
    );

  return Array.isArray(
    response.data
  )
    ? response.data
    : [];
};


export const getMyProjects = async () => {
  const response =
    await api.get(
      "/users/me/projects"
    );

  return Array.isArray(
    response.data
  )
    ? response.data
    : [];
};


export const createProject = async (
  organizationId,
  data
) => {
  const response =
    await api.post(
      `/organizations/${organizationId}/projects`,
      createBackendProjectPayload(
        data,
        true
      )
    );

  return response.data;
};


export const updateProject = async (
  organizationId,
  projectId,
  data
) => {
  const response =
    await api.patch(
      `/organizations/${organizationId}/projects/${projectId}`,
      createBackendProjectPayload(
        data,
        false
      )
    );

  return response.data;
};


export const deleteProject = async (
  organizationId,
  projectId
) => {
  await api.delete(
    `/organizations/${organizationId}/projects/${projectId}`
  );
};


export const getProjectMembers = async (
  organizationId,
  projectId
) => {
  const response =
    await api.get(
      `/organizations/${organizationId}/projects/${projectId}/members`
    );

  return Array.isArray(
    response.data
  )
    ? response.data
    : [];
};


export const addProjectMember = async (
  organizationId,
  projectId,
  userId,
  role
) => {
  const response =
    await api.post(
      `/organizations/${organizationId}/projects/${projectId}/members`,
      {
        user_id:
          Number(userId),

        role:
          toBackendProjectRole(
            role
          ),
      }
    );

  return response.data;
};


export const updateProjectMemberRole = async (
  organizationId,
  projectId,
  userId,
  role
) => {
  const response =
    await api.patch(
      `/organizations/${organizationId}/projects/${projectId}/members/${userId}/role`,
      {
        role:
          toBackendProjectRole(
            role
          ),
      }
    );

  return response.data;
};


export const removeProjectMember = async (
  organizationId,
  projectId,
  userId
) => {
  await api.delete(
    `/organizations/${organizationId}/projects/${projectId}/members/${userId}`
  );
};

