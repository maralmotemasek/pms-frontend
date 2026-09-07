import api from "./api";

export const getReports = async () => {
  const response = await api.get("/reports");
  return response.data;
};

export const getProjectReport = async (projectId) => {
  const response = await api.get(`/reports/projects/${projectId}`);
  return response.data;
};

export const exportGeneralReportExcel = async () => {
  return api.get("/reports/overview/export/excel", {
    responseType: "blob",
  });
};

export const exportProjectReportExcel = async (projectId) => {
  return api.get(`/reports/projects/${projectId}/export/excel`, {
    responseType: "blob",
  });
};
