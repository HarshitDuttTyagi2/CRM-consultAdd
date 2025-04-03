import React, { useState, useEffect } from "react";
import { getAllUsers } from "../../services/authService";
import { dashboardService } from "../../services/dashboardService";

const Dashboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [breakdownData, setBreakdownData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [sortColumn, setSortColumn] = useState("leads"); // Default sort by leads
  const [sortOrder, setSortOrder] = useState("desc"); // Default descending order

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      const allUserData = await getAllUsers();
      const leadDataPromises = allUserData.map(async (user) => {
        const data = await dashboardService.getAdminDashboardData(user._id, "");
        const totalRequirements = await fetchBreakdownDetails(user._id, true); // Fetch total requirements
        return {
          employeeID: user._id,
          name: user.name,
          leads: data?.leadData?.total || 0,
          totalRequirements,
        };
      });

      const resolvedLeadData = await Promise.all(leadDataPromises);
      setLeaderboard(sortData(resolvedLeadData)); // Apply sorting after fetching
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  };

  // Fetch breakdown details
  const fetchBreakdownDetails = async (employeeID, isInitialFetch = false) => {
    try {
      const response = await dashboardService.getUserData(employeeID);
      const leads = response?.leadData || [];

      const breakdown = leads.map((lead) => {
        const totalRequirements = Object.values(lead.requirements || {}).reduce(
          (sum, val) => sum + (parseInt(val) || 0),
          0
        );

        return {
          companyName: lead.companyName,
          totalRequirements,
        };
      });

      const totalRequirementsSum = breakdown.reduce((sum, lead) => sum + lead.totalRequirements, 0);

      if (!isInitialFetch) {
        setBreakdownData(breakdown);
        setSelectedEmployee(employeeID);
        setShowModal(true);
      }

      return totalRequirementsSum;
    } catch (error) {
      console.error("Error fetching breakdown data:", error);
      return 0;
    }
  };

  // Sorting function
  const sortData = (data) => {
    return [...data].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortColumn] - b[sortColumn];
      } else {
        return b[sortColumn] - a[sortColumn];
      }
    });
  };

  // Handle sorting when user clicks on table headers
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc"); // Toggle order
    } else {
      setSortColumn(column);
      setSortOrder("desc"); // Default to descending when changing column
    }
    setLeaderboard(sortData(leaderboard)); // Apply new sorting
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 120000);
    return () => clearInterval(interval);
  }, [sortColumn, sortOrder]); // Update when sort changes

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard - Leaderboard</h2>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-300">
              <th className="border p-2">Rank</th>
              <th className="border p-2">Employee</th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("leads")}
              >
                Leads {sortColumn === "leads" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="border p-2 cursor-pointer"
                onClick={() => handleSort("totalRequirements")}
              >
                Total Requirements {sortColumn === "totalRequirements" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={user.employeeID} className="border">
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2 text-center">{user.leads}</td>
                <td
                  className="border p-2 text-center cursor-pointer text-blue-500 hover:underline"
                  onClick={() => fetchBreakdownDetails(user.employeeID)}
                >
                  {user.totalRequirements}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-lg font-semibold mb-4">Requirement Breakdown</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Company Name</th>
                  <th className="border p-2">Total Requirements</th>
                </tr>
              </thead>
              <tbody>
                {breakdownData.length > 0 ? (
                  breakdownData.map((lead, index) => (
                    <tr key={index}>
                      <td className="border p-2">{lead.companyName}</td>
                      <td className="border p-2 text-center">{lead.totalRequirements}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="border p-2 text-center">
                      No breakdown data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
