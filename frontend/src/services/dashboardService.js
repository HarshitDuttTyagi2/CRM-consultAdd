import api from "../services/api";

export const dashboardService = {
  getAdminDashboardData: async (employeeID, date) => {
    try {
      // Pass employeeID and date as query parameters
      const response = await api.get("/dashboard/admin", {
        params: {
          employeeID,
          date,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  },
};
