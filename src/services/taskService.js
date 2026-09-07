import api from "./api";


const BACKEND_STATUS_MAP = {
  todo: "TODO",
  doing: "IN_PROGRESS",
  "in-progress": "IN_PROGRESS",
  review: "IN_REVIEW",
  done: "DONE",
  cancelled: "CANCELLED",
};


const UI_STATUS_MAP = {
  TODO: "todo",
  IN_PROGRESS: "doing",
  IN_REVIEW: "review",
  DONE: "done",
  CANCELLED: "cancelled",
};


const toBackendStatus = (status) => {
  if (!status) {
    return "TODO";
  }

  return (
    BACKEND_STATUS_MAP[
      String(status).toLowerCase()
    ] ||
    String(status).toUpperCase()
  );
};


const fromBackendStatus = (status) => {
  if (!status) {
    return "todo";
  }

  return (
    UI_STATUS_MAP[
      String(status).toUpperCase()
    ] ||
    String(status).toLowerCase()
  );
};


const toBackendPriority = (priority) => {
  if (!priority) {
    return "MEDIUM";
  }

  return String(priority).toUpperCase();
};


const fromBackendPriority = (priority) => {
  if (!priority) {
    return "medium";
  }

  return String(priority).toLowerCase();
};


const toNullableNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number)
    ? null
    : number;
};


export const normalizeTaskUser = (
  user
) => {
  if (!user) {
    return null;
  }

  return {
    id:
      user.id,

    username:
      user.username || "",

    fullName:
      user.full_name ||
      user.username ||
      `کاربر #${user.id}`,
  };
};


export const normalizeTask = (
  task
) => {
  if (!task) {
    return null;
  }

  const assigneeUser =
    normalizeTaskUser(
      task.assignee
    );

  const creatorUser =
    normalizeTaskUser(
      task.creator
    );

  const estimatedMinutes =
    task.estimated_minutes ??
    null;

  const estimatedHours =
    estimatedMinutes === null
      ? ""
      : Number(
          (
            estimatedMinutes / 60
          ).toFixed(2)
        );

  return {
    id:
      task.id,

    projectId:
      task.project_id,

    parentId:
      task.parent_id,

    title:
      task.title || "",

    description:
      task.description || "",

    status:
      fromBackendStatus(
        task.status
      ),

    backendStatus:
      task.status,

    priority:
      fromBackendPriority(
        task.priority
      ),

    backendPriority:
      task.priority,

    progress:
      Number(
        task.progress
      ) || 0,

    startDate:
      task.start_date ||
      null,

    dueDate:
      task.due_date ||
      null,

    deadline:
      task.due_date ||
      null,

    estimatedMinutes,

    estimatedHours,

    assigneeId:
      task.assignee_id ??
      null,

    assigneeUser,

    assignee:
      assigneeUser?.fullName ||
      "بدون مسئول",

    createdBy:
      task.created_by,

    creatorUser,

    project:
      task.project_name ||
      task.project?.name ||
      (
        task.project_id
          ? `پروژه #${task.project_id}`
          : "پروژه نامشخص"
      ),

    createdAt:
      task.created_at ||
      null,

    updatedAt:
      task.updated_at ||
      null,
  };
};


const createTaskPayload = (
  data
) => {
  const payload = {
    title:
      String(
        data.title || ""
      ).trim(),

    description:
      data.description
        ? String(
            data.description
          ).trim()
        : null,

    status:
      toBackendStatus(
        data.status ||
        "todo"
      ),

    priority:
      toBackendPriority(
        data.priority ||
        "medium"
      ),

    progress:
      Number(
        data.progress ?? 0
      ),

    start_date:
      data.startDate ??
      data.start_date ??
      null,

    due_date:
      data.dueDate ??
      data.deadline ??
      data.due_date ??
      null,

    assignee_id:
      toNullableNumber(
        data.assigneeId ??
        data.assignee ??
        data.assignee_id
      ),
  };


  const parentId =
    data.parentId ??
    data.parent_id;

  if (
    parentId !== undefined
  ) {
    payload.parent_id =
      toNullableNumber(
        parentId
      );
  }


  if (
    data.estimatedMinutes !==
    undefined ||
    data.estimated_minutes !==
    undefined
  ) {
    payload.estimated_minutes =
      toNullableNumber(
        data.estimatedMinutes ??
        data.estimated_minutes
      );
  } else if (
    data.estimatedHours !==
    undefined
  ) {
    const hours =
      toNullableNumber(
        data.estimatedHours
      );

    payload.estimated_minutes =
      hours === null
        ? null
        : Math.round(
            hours * 60
          );
  }


  return payload;
};


const createTaskUpdatePayload = (
  data
) => {
  const payload = {};


  if (
    data.title !== undefined
  ) {
    payload.title =
      String(
        data.title
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
    data.status !== undefined
  ) {
    payload.status =
      toBackendStatus(
        data.status
      );
  }


  if (
    data.priority !== undefined
  ) {
    payload.priority =
      toBackendPriority(
        data.priority
      );
  }


  if (
    data.progress !== undefined
  ) {
    payload.progress =
      Number(
        data.progress
      );
  }


  if (
    data.startDate !== undefined ||
    data.start_date !== undefined
  ) {
    payload.start_date =
      data.startDate ??
      data.start_date ??
      null;
  }


  if (
    data.dueDate !== undefined ||
    data.deadline !== undefined ||
    data.due_date !== undefined
  ) {
    payload.due_date =
      data.dueDate ??
      data.deadline ??
      data.due_date ??
      null;
  }


  if (
    data.estimatedMinutes !==
    undefined ||
    data.estimated_minutes !==
    undefined
  ) {
    payload.estimated_minutes =
      toNullableNumber(
        data.estimatedMinutes ??
        data.estimated_minutes
      );
  } else if (
    data.estimatedHours !==
    undefined
  ) {
    const hours =
      toNullableNumber(
        data.estimatedHours
      );

    payload.estimated_minutes =
      hours === null
        ? null
        : Math.round(
            hours * 60
          );
  }


  return payload;
};


/* =========================
   MY TASKS
========================= */

export const getMyTasks =
  async () => {

    const response =
      await api.get(
        "/users/me/tasks"
      );

    return (
      response.data || []
    ).map(
      normalizeTask
    );
  };


export const updateMyTask =
  async (
    taskId,
    data
  ) => {

    const payload = {};

    if (
      data.status !== undefined
    ) {
      payload.status =
        toBackendStatus(
          data.status
        );
    }

    if (
      data.progress !== undefined
    ) {
      payload.progress =
        Number(
          data.progress
        );
    }

    const response =
      await api.patch(
        `/users/me/tasks/${taskId}`,
        payload
      );

    return normalizeTask(
      response.data
    );
  };


/* =========================
   PROJECT TASKS
========================= */

export const getProjectTasks =
  async (
    organizationId,
    projectId
  ) => {

    const response =
      await api.get(
        `/organizations/${organizationId}/projects/${projectId}/tasks`
      );

    return (
      response.data || []
    ).map(
      normalizeTask
    );
  };


export const getTask =
  async (
    organizationId,
    projectId,
    taskId
  ) => {

    const response =
      await api.get(
        `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`
      );

    return normalizeTask(
      response.data
    );
  };


export const createTask =
  async (
    organizationId,
    projectId,
    data
  ) => {

    const response =
      await api.post(
        `/organizations/${organizationId}/projects/${projectId}/tasks`,
        createTaskPayload(
          data
        )
      );

    return normalizeTask(
      response.data
    );
  };


export const updateTask =
  async (
    organizationId,
    projectId,
    taskId,
    data
  ) => {

    const response =
      await api.patch(
        `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`,
        createTaskUpdatePayload(
          data
        )
      );

    return normalizeTask(
      response.data
    );
  };


export const deleteTask =
  async (
    organizationId,
    projectId,
    taskId
  ) => {

    await api.delete(
      `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`
    );
  };


export const assignTask =
  async (
    organizationId,
    projectId,
    taskId,
    assigneeId
  ) => {

    const response =
      await api.patch(
        `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}/assign`,
        {
          assignee_id:
            toNullableNumber(
              assigneeId
            ),
        }
      );

    return normalizeTask(
      response.data
    );
  };


/* =========================
   SUBTASKS
========================= */

export const getSubtasks =
  async (
    organizationId,
    projectId,
    taskId
  ) => {

    const response =
      await api.get(
        `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}/subtasks`
      );

    return (
      response.data || []
    ).map(
      normalizeTask
    );
  };


export const createSubtask =
  async (
    organizationId,
    projectId,
    taskId,
    data
  ) => {

    const payload =
      createTaskPayload({
        ...data,
        parentId:
          taskId,
      });

    const response =
      await api.post(
        `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}/subtasks`,
        payload
      );

    return normalizeTask(
      response.data
    );
  };


/* =========================
   CREATE TASK LOOKUPS
========================= */

const normalizeCollection = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
};


export const getTaskOrganizations =
  async () => {

    const response =
      await api.get(
        "/organizations"
      );

    return normalizeCollection(
      response.data
    );
  };


export const getTaskProjects =
  async (
    organizationId
  ) => {

    const response =
      await api.get(
        `/organizations/${organizationId}/projects`
      );

    return normalizeCollection(
      response.data
    );
  };


export const getTaskProjectMembers =
  async (
    organizationId,
    projectId
  ) => {

    const response =
      await api.get(
        `/organizations/${organizationId}/projects/${projectId}/members`
      );

    return normalizeCollection(
      response.data
    );
  };
