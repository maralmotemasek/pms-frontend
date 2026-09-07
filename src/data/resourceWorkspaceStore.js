const STORAGE_KEY =
  "pms_resources_v1";


export const RESOURCE_TYPES = {
  HUMAN: "HUMAN",
  EQUIPMENT: "EQUIPMENT",
  SOFTWARE: "SOFTWARE",
  SERVICE: "SERVICE",
  OTHER: "OTHER",
};


export const RESOURCE_TYPE_LABELS = {
  [RESOURCE_TYPES.HUMAN]:
    "منبع انسانی",

  [RESOURCE_TYPES.EQUIPMENT]:
    "تجهیزات",

  [RESOURCE_TYPES.SOFTWARE]:
    "نرم‌افزار",

  [RESOURCE_TYPES.SERVICE]:
    "سرویس",

  [RESOURCE_TYPES.OTHER]:
    "سایر",
};


export const RESOURCE_STATUSES = {
  AVAILABLE: "AVAILABLE",
  BUSY: "BUSY",
  UNAVAILABLE: "UNAVAILABLE",
};


export const RESOURCE_STATUS_LABELS = {
  [RESOURCE_STATUSES.AVAILABLE]:
    "آزاد",

  [RESOURCE_STATUSES.BUSY]:
    "در حال استفاده",

  [RESOURCE_STATUSES.UNAVAILABLE]:
    "غیرفعال",
};


function saveResources(
  resources
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(resources)
  );
}


export function getResources() {
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
      "Read resources error:",
      error
    );

    return [];
  }
}


export function getResourceById(
  resourceId
) {
  return (
    getResources().find(
      (resource) =>
        String(resource.id) ===
        String(resourceId)
    ) || null
  );
}


export function createResource(
  resourceData
) {
  const resources =
    getResources();


  const nextId =
    resources.reduce(
      (
        highestId,
        resource
      ) =>
        Math.max(
          highestId,
          Number(resource.id) || 0
        ),
      0
    ) + 1;


  const resource = {
    id: nextId,

    organizationId:
      Number(
        resourceData.organizationId
      ),

    organizationName:
      resourceData.organizationName,

    name:
      resourceData.name,

    description:
      resourceData.description ||
      "",

    type:
      resourceData.type,

    status:
      resourceData.status ||
      RESOURCE_STATUSES.AVAILABLE,

    capacity:
      Number(
        resourceData.capacity
      ) || 100,

    hourlyCost:
      Number(
        resourceData.hourlyCost
      ) || 0,

    unit:
      resourceData.unit ||
      "درصد",

    createdAt:
      new Date().toISOString(),
  };


  saveResources([
    ...resources,
    resource,
  ]);


  return resource;
}


export function updateResource(
  resourceId,
  changes
) {
  const resources =
    getResources();


  let updatedResource =
    null;


  const nextResources =
    resources.map(
      (resource) => {

        if (
          String(resource.id) !==
          String(resourceId)
        ) {
          return resource;
        }


        updatedResource = {
          ...resource,
          ...changes,

          id:
            resource.id,
        };


        return updatedResource;
      }
    );


  saveResources(
    nextResources
  );


  return updatedResource;
}


export function deleteResource(
  resourceId
) {
  const resources =
    getResources();


  saveResources(
    resources.filter(
      (resource) =>
        String(resource.id) !==
        String(resourceId)
    )
  );
}


export function getOrganizationResources(
  organizationId
) {
  return getResources().filter(
    (resource) =>
      String(
        resource.organizationId
      ) ===
      String(
        organizationId
      )
  );
}
