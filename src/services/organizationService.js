import api from "./api";

const toBackendOrganizationRole = (role) => {
  if (role === "ORG_MEMBER") {
    return "MEMBER";
  }

  return role;
};

const fromBackendOrganizationRole = (role) => {
  const roleName =
    typeof role === "string"
      ? role
      : role?.name;

  if (roleName === "MEMBER") {
    return "ORG_MEMBER";
  }

  return roleName;
};

const normalizeOrganizationMember = (member) => ({
  ...member,
  role: fromBackendOrganizationRole(member.role),
});

export const getMyOrganizations = async () => {
  const response = await api.get(
    "/organizations"
  );

  return response.data;
};

export const createOrganization = async (data) => {
  const response = await api.post(
    "/organizations",
    data
  );

  return response.data;
};

export const deleteOrganization = async (
  organizationId
) => {
  await api.delete(
    `/organizations/${organizationId}`
  );
};

export const getOrganizationMembers = async (
  organizationId
) => {
  const response = await api.get(
    `/organizations/${organizationId}/members`
  );

  return Array.isArray(response.data)
    ? response.data.map(
        normalizeOrganizationMember
      )
    : [];
};

export const inviteOrganizationMember = async (
  organizationId,
  data
) => {
  const response = await api.post(
    `/organizations/${organizationId}/invitations`,
    {
      username: data.username.trim(),
      role: toBackendOrganizationRole(
        data.role
      ),
    }
  );

  return response.data;
};

export const getMyOrganizationInvitations = async () => {
  const response = await api.get(
    "/organizations/invitations"
  );

  return Array.isArray(response.data)
    ? response.data
    : [];
};

export const acceptOrganizationInvitation = async (
  invitationId
) => {
  const response = await api.post(
    `/organizations/invitations/${invitationId}/accept`
  );

  return response.data;
};

export const rejectOrganizationInvitation = async (
  invitationId
) => {
  const response = await api.post(
    `/organizations/invitations/${invitationId}/reject`
  );

  return response.data;
};

export const removeOrganizationMember = async (
  organizationId,
  userId
) => {
  await api.delete(
    `/organizations/${organizationId}/members/${userId}`
  );
};

export const updateOrganizationMemberRole = async (
  organizationId,
  userId,
  role
) => {
  const response = await api.patch(
    `/organizations/${organizationId}/members/${userId}/role`,
    {
      role: toBackendOrganizationRole(role),
    }
  );

  return normalizeOrganizationMember(
    response.data
  );
};


