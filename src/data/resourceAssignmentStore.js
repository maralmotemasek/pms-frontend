const STORAGE_KEY =
  "pms_resource_assignments_v1";


function saveAssignments(
  assignments
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      assignments
    )
  );
}


export function getResourceAssignments() {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {
      return [];
    }


    const parsed =
      JSON.parse(saved);


    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Read resource assignments error:",
      error
    );

    return [];
  }
}


export function getProjectResourceAssignments(
  projectId
) {
  return getResourceAssignments()
    .filter(
      (assignment) =>
        String(
          assignment.projectId
        ) ===
        String(projectId)
    );
}


export function createResourceAssignment(
  assignmentData
) {
  const assignments =
    getResourceAssignments();


  const nextId =
    assignments.reduce(
      (
        highestId,
        assignment
      ) =>
        Math.max(
          highestId,
          Number(
            assignment.id
          ) || 0
        ),
      0
    ) + 1;


  const assignment = {
    id: nextId,

    projectId:
      Number(
        assignmentData.projectId
      ),

    projectName:
      assignmentData.projectName,

    organizationId:
      Number(
        assignmentData.organizationId
      ),

    resourceId:
      Number(
        assignmentData.resourceId
      ),

    resourceName:
      assignmentData.resourceName,

    memberId:
      assignmentData.memberId
        ? Number(
            assignmentData.memberId
          )
        : null,

    memberName:
      assignmentData.memberName ||
      "",

    allocation:
      Number(
        assignmentData.allocation
      ) || 0,

    estimatedHours:
      Number(
        assignmentData.estimatedHours
      ) || 0,

    hourlyCost:
      Number(
        assignmentData.hourlyCost
      ) || 0,

    startDate:
      assignmentData.startDate ||
      "",

    endDate:
      assignmentData.endDate ||
      "",

    note:
      assignmentData.note ||
      "",

    createdAt:
      new Date().toISOString(),
  };


  saveAssignments([
    ...assignments,
    assignment,
  ]);


  return assignment;
}


export function updateResourceAssignment(
  assignmentId,
  changes
) {
  const assignments =
    getResourceAssignments();


  let updatedAssignment =
    null;


  const nextAssignments =
    assignments.map(
      (assignment) => {

        if (
          String(
            assignment.id
          ) !==
          String(
            assignmentId
          )
        ) {
          return assignment;
        }


        updatedAssignment = {
          ...assignment,
          ...changes,

          id:
            assignment.id,
        };


        return updatedAssignment;
      }
    );


  saveAssignments(
    nextAssignments
  );


  return updatedAssignment;
}


export function deleteResourceAssignment(
  assignmentId
) {
  const assignments =
    getResourceAssignments();


  saveAssignments(
    assignments.filter(
      (assignment) =>
        String(
          assignment.id
        ) !==
        String(
          assignmentId
        )
    )
  );
}


export function getResourceAllocatedPercent(
  resourceId,
  ignoredAssignmentId = null
) {
  return getResourceAssignments()
    .filter(
      (assignment) =>
        String(
          assignment.resourceId
        ) ===
          String(
            resourceId
          ) &&
        String(
          assignment.id
        ) !==
          String(
            ignoredAssignmentId
          )
    )
    .reduce(
      (
        total,
        assignment
      ) =>
        total +
        Number(
          assignment.allocation ||
          0
        ),
      0
    );
}


export function calculateAssignmentCost(
  assignment
) {
  return (
    Number(
      assignment.estimatedHours ||
      0
    ) *
    Number(
      assignment.hourlyCost ||
      0
    )
  );
}
