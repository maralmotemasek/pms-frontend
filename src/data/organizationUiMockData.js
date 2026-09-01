import {
  ORGANIZATION_ROLES,
} from "../constants/roles";


export const MOCK_DIRECTORY_USERS = [
  {
    id: 1001,
    full_name: "سارا احمدی",
    username: "sara.ahmadi",
    email: "sara@example.com",
  },
  {
    id: 1002,
    full_name: "امیر رضایی",
    username: "amir.rezaei",
    email: "amir@example.com",
  },
  {
    id: 1003,
    full_name: "نگار کریمی",
    username: "negar.karimi",
    email: "negar@example.com",
  },
  {
    id: 1004,
    full_name: "محمد اکبری",
    username: "mohammad.akbari",
    email: "mohammad@example.com",
  },
  {
    id: 1005,
    full_name: "رها مرادی",
    username: "raha.moradi",
    email: "raha@example.com",
  },
  {
    id: 1006,
    full_name: "علی محمدی",
    username: "ali.mohammadi",
    email: "ali@example.com",
  },
];


function getMembersStorageKey(
  organizationId
) {
  return `pms_organization_${organizationId}_members`;
}


export function createInitialMembers(
  organization,
  currentUser
) {
  if (!organization) {
    return [];
  }


  const ownerIsCurrentUser =
    Number(organization.owner_id) ===
    Number(currentUser?.id);


  const owner = {
    user_id: organization.owner_id,

    full_name:
      ownerIsCurrentUser
        ? currentUser?.full_name ||
          currentUser?.username ||
          "مالک سازمان"
        : `مالک سازمان #${organization.owner_id}`,

    username:
      ownerIsCurrentUser
        ? currentUser?.username ||
          `owner_${organization.owner_id}`
        : `owner_${organization.owner_id}`,

    email:
      ownerIsCurrentUser
        ? currentUser?.email || ""
        : "",

    role: ORGANIZATION_ROLES.OWNER,
  };


  const members = [
    owner,
  ];


  if (
    currentUser &&
    !ownerIsCurrentUser
  ) {
    members.push({
      user_id: currentUser.id,

      full_name:
        currentUser.full_name ||
        currentUser.username,

      username:
        currentUser.username,

      email:
        currentUser.email || "",

      role:
        ORGANIZATION_ROLES.ORG_MEMBER,
    });
  }


  return members;
}


export function loadOrganizationMembers(
  organization,
  currentUser
) {
  if (!organization?.id) {
    return [];
  }


  const storageKey =
    getMembersStorageKey(
      organization.id
    );


  try {
    const savedData =
      localStorage.getItem(
        storageKey
      );


    if (savedData) {
      const parsed =
        JSON.parse(savedData);


      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(
      "Read organization members mock error:",
      error
    );
  }


  const initialMembers =
    createInitialMembers(
      organization,
      currentUser
    );


  saveOrganizationMembers(
    organization.id,
    initialMembers
  );


  return initialMembers;
}


export function saveOrganizationMembers(
  organizationId,
  members
) {
  try {
    localStorage.setItem(
      getMembersStorageKey(
        organizationId
      ),
      JSON.stringify(
        members
      )
    );
  } catch (error) {
    console.error(
      "Save organization members mock error:",
      error
    );
  }
}


export function searchMockDirectoryUsers(
  searchValue,
  members = []
) {
  const query =
    searchValue
      .trim()
      .toLowerCase();


  const currentMemberIds =
    new Set(
      members.map(
        (member) =>
          Number(
            member.user_id
          )
      )
    );


  return MOCK_DIRECTORY_USERS.filter(
    (user) => {

      const isAlreadyMember =
        currentMemberIds.has(
          Number(user.id)
        );


      if (isAlreadyMember) {
        return false;
      }


      if (!query) {
        return true;
      }


      return (
        user.username
          .toLowerCase()
          .includes(query) ||

        user.full_name
          .toLowerCase()
          .includes(query)
      );
    }
  );
}
