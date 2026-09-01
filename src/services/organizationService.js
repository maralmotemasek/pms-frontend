import api from "./api";


export const getMyOrganizations =
  async () => {

    const response =
      await api.get(
        "/organizations"
      );

    return response.data;
  };


export const createOrganization =
  async (data) => {

    const response =
      await api.post(
        "/organizations",
        data
      );

    return response.data;
  };
