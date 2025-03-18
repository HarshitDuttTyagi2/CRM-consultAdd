import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllUsers } from "../../services/authService";
import { dashboardService } from "../../services/dashboardService";

const Dashboard = () => {
  const [employeeID, setEmployeeID] = useState("");
  const [date, setDate] = useState("");
  const [leadData, setLeadData] = useState({ total: 0, stages: [] });
  const [allUsers, setAllUsers] = useState([]);

  // Fetch all users and populate the dropdown
  const fetchAllUsers = async () => {
    try {
      const allUserData = await getAllUsers();
      setAllUsers(allUserData);
    } catch (error) {
      console.error("Error fetching all users:", error);
      alert("Error fetching user list. Please check the connection.");
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Fetch lead data using dashboardService
  const fetchLeadData = async () => {
    // if (!employeeID) {
    //   alert("Please select a user");
    //   return;
    // }
  
    try {
      // Pass employeeID and date as query params to the dashboardService
      const data = await dashboardService.getAdminDashboardData(employeeID, date);
  
      // Check if leadData is available
      if (data && data.leadData) {
        setLeadData(data.leadData); // Set lead data for the selected employee and date
      } else {
        alert("No lead data available for the selected employee and date.");
        setLeadData({ total: 0, stages: [] }); // Reset lead data if nothing is found
      }
    } catch (error) {
      console.error("Error fetching lead data:", error);
      alert("Error fetching lead data. Please check the connection.");
    }
  };
  
  

  // Pie chart data based on fetched leads
  const leadChartData = [
    { name: "Total Leads", value: leadData.total },
    {
      name: "Remaining",
      value: 100 - leadData.total > 0 ? 100 - leadData.total : 0,
    },
  ];

  // Define colors for Pie Chart
  const COLORS = ["#45B7D1", "#FF6B6B"];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard - Lead Stats</h2>

        {/* Input Section for Employee Dropdown and Date */}
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={employeeID}
            onChange={(e) => setEmployeeID(e.target.value)}
            className="border p-2 rounded-lg w-1/3"
          >
            <option value="">Select Employee</option>
            {allUsers.map((user) => (
              <option key={user.name} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded-lg w-1/3"
          />

          <button
            onClick={fetchLeadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Fetch Lead Data
          </button>
        </div>

        {/* Display Pie Chart */}
        <div className="mt-6">
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-lg mt-4 text-center">
            <p>
              <span className="font-bold">Total Leads: </span>
              {leadData.total}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
