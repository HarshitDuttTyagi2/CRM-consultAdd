import React, { useState, useEffect } from "react";
import { getAllUsers } from "../../services/authService";
import { dashboardService } from "../../services/dashboardService";

const Dashboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      const allUserData = await getAllUsers();
      const leadDataPromises = allUserData.map(async (user) => {
        const data = await dashboardService.getAdminDashboardData(user._id, "");
        return {
          name: user.name,
          leads: data?.leadData?.total || 0,
          totalRequirements: data?.requirementData?.total || 0,
          requirementBreakdown: data?.requirementData?.breakdown || {},
        };
      });
      const resolvedLeadData = await Promise.all(leadDataPromises);

      // Sort users by number of leads in descending order
      const sortedLeaderboard = resolvedLeadData.sort((a, b) => b.leads - a.leads);
      setLeaderboard(sortedLeaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 120000); // Auto update every 2 minutes
    return () => clearInterval(interval);
  }, []);

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
              <tr key={index} className="border">
                <td className="border p-2 text-center">{index + 1}</td>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2 text-center">{user.leads}</td>
                <td className="border p-2 text-center relative">
                  <span className="group cursor-pointer">{user.totalRequirements}
                    <span className="absolute left-0 mt-2 w-56 bg-gray-700 text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Object.entries(user.requirementBreakdown).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;