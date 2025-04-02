import React, { useState, useEffect } from "react";
import { getAllUsers } from "../../services/authService";
import { dashboardService } from "../../services/dashboardService";

const Dashboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [breakdownData, setBreakdownData] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      const allUserData = await getAllUsers();
      const leadDataPromises = allUserData.map(async (user) => {
        const data = await dashboardService.getAdminDashboardData(user._id, "");
        return {
          employeeID: user._id,
          name: user.name,
          leads: data?.leadData?.total || 0,
          totalRequirements: data?.requirementData?.total || 0,
        };
      });
      const resolvedLeadData = await Promise.all(leadDataPromises);
      const sortedLeaderboard = resolvedLeadData.sort((a, b) => b.leads - a.leads);
      setLeaderboard(sortedLeaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 120000);
    return () => clearInterval(interval);
  }, []);

  // Fetch breakdown details when clicked
  const fetchBreakdownDetails = async (employeeID) => {
    try {
      const response = await dashboardService.getAdminDashboardData(employeeID);
      setBreakdownData(response.breakdown || {});
      setSelectedEmployee(employeeID);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching breakdown data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard - Leaderboard</h2>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-300">
              <th className="border p-2">Rank</th>
              <th className="border p-2">Employee</th>
              <th className="border p-2">Leads</th>
              <th className="border p-2">Total Requirements</th>
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
            <div>
              {Object.entries(breakdownData).length > 0 ? (
                Object.entries(breakdownData).map(([key, value]) => (
                  <div key={key} className="border-b p-2">{key}: {value}</div>
                ))
              ) : (
                <p>No breakdown data available.</p>
              )}
            </div>
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
