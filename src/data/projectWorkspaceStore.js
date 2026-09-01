import {
  PROJECT_ROLES,
} from "../constants/roles";


const STORAGE_KEY =
  "pms_week2_projects_v1";


export function normalizeProjectRole(
  role
) {
  switch (role) {
    case "PROJECT_MANAGER":
    case "MANAGER":
      return PROJECT_ROLES.MANAGER;

    case "TEAM_LEAD":
      return PROJECT_ROLES.TEAM_LEAD;

    case "MEMBER":
    case "PR_MEMBER":
      return PROJECT_ROLES.PR_MEMBER;

    default:
      return PROJECT_ROLES.PR_MEMBER;
  }
}


function normalizeProject(
  project
) {
  return {
    ...project,

    organizationId:
      project.organizationId ??
      null,

    organizationName:
      project.organizationName ??
      "",

    status:
      project.status ||
      "in-progress",

    progress:
      Number(
        project.progress
      ) || 0,

    budget:
      project.budget ||
      "0",

    members:
      Array.isArray(
        project.members
      )
        ? project.members.map(
            (member) => ({
              userId:
                member.userId ??
                member.user_id,

              fullName:
                member.fullName ??
                member.full_name ??
                member.username ??
                "کاربر",

              username:
                member.username ??
                "",

              role:
                normalizeProjectRole(
                  member.role
                ),
            })
          )
        : [],

    tasks:
      Array.isArray(
        project.tasks
      )
        ? project.tasks
        : [],

    documents:
      Array.isArray(
        project.documents
      )
        ? project.documents
        : [],

    resources:
      Array.isArray(
        project.resources
      )
        ? project.resources
        : [],

    timeEntries:
      Array.isArray(
        project.timeEntries
      )
        ? project.timeEntries
        : [],

    expenses:
      Array.isArray(
        project.expenses
      )
        ? project.expenses
        : [],
  };
}


function saveProjects(
  projects
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      projects
    )
  );
}


export function getWorkspaceProjects() {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {
      saveProjects([]);

      return [];
    }


    const parsed =
      JSON.parse(saved);


    if (!Array.isArray(parsed)) {
      return [];
    }


    return parsed.map(
      normalizeProject
    );
  } catch (error) {
    console.error(
      "Read project workspace error:",
      error
    );

    return [];
  }
}


export function getWorkspaceProjectById(
  projectId
) {
  return (
    getWorkspaceProjects().find(
      (project) =>
        String(project.id) ===
        String(projectId)
    ) || null
  );
}


export function createWorkspaceProject(
  projectData
) {
  const projects =
    getWorkspaceProjects();


  const nextId =
    projects.reduce(
      (
        highestId,
        project
      ) =>
        Math.max(
          highestId,
          Number(project.id) || 0
        ),
      0
    ) + 1;


  const newProject =
    normalizeProject({
      id: nextId,

      ...projectData,

      status: "in-progress",

      progress: 0,

      tasks: [],

      resources: [],

      timeEntries: [],

      expenses: [],
    });


  saveProjects([
    ...projects,
    newProject,
  ]);


  return newProject;
}


export function updateWorkspaceProject(
  projectId,
  changes
) {
  const projects =
    getWorkspaceProjects();


  let updatedProject =
    null;


  const nextProjects =
    projects.map(
      (project) => {

        if (
          String(project.id) !==
          String(projectId)
        ) {
          return project;
        }


        updatedProject =
          normalizeProject({
            ...project,
            ...changes,

            id:
              project.id,
          });


        return updatedProject;
      }
    );


  saveProjects(
    nextProjects
  );


  return updatedProject;
}


export function deleteWorkspaceProject(
  projectId
) {
  const projects =
    getWorkspaceProjects();


  const nextProjects =
    projects.filter(
      (project) =>
        String(project.id) !==
        String(projectId)
    );


  saveProjects(
    nextProjects
  );
}


export function getProjectMembership(
  project,
  userId
) {
  return (
    project?.members?.find(
      (member) =>
        Number(
          member.userId
        ) ===
        Number(userId)
    ) || null
  );
}


export function getProjectManagers(
  project
) {
  return (
    project?.members?.filter(
      (member) =>
        normalizeProjectRole(
          member.role
        ) ===
        PROJECT_ROLES.MANAGER
    ) || []
  );
}
