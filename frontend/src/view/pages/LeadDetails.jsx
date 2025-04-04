import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { leadService } from "../../services/leadServices";
import { useAuth } from "../../context/Context";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { useToast } from "../../context/ToastContext";
import { getAllUsers } from "../../services/authService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const LeadDetails = () => {
  const { updateLead, deleteLead, getLeadById } = leadService;
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const { showToast } = useToast();

  const canReadLead = user?.role === "admin" || user?.permission?.lead?.read;
  const canUpdateLead =
    user?.role === "admin" || user?.permission?.lead?.update;
  const canDeleteLead =
    user?.role === "admin" || user?.permission?.lead?.delete;
  const isAuthenticated = !!user;
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (canReadLead) {
      fetchLeadDetails();
    } else {
      setLoading(false);
      showToast("You don't have permission to view lead details.", "error");
    }
  }, [canReadLead, id, navigate]);

  useEffect(() => {
    if (lead) {
      console.log("Lead has been updated:", lead);
    }
  }, [lead]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const data = await getLeadById(id);
      console.log("Fetched Lead Data:", data);

      setLead(data); // This will trigger the `useEffect` when `lead` updates
    } catch (err) {
      console.error("Error fetching lead details:", err);
      showToast("Failed to fetch lead details. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const userList = await getAllUsers(); // Fetch all users
      console.log("All Users:", userList);

      if (userList && Array.isArray(userList)) {
        setUsers(userList); // Set the list of users
      } else {
        setUsers([]);
        console.warn("No users found");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "userName") {
      // Find the selected user from the users list
      const selectedUser = users.find((user) => user.name === value);

      setLead((prevLead) => ({
        ...prevLead,
        userName: value,
        employeeID: selectedUser ? selectedUser._id || selectedUser.userId : "", // Ensure employeeID updates
      }));
    } else if (name.startsWith("requirements-")) {
      const month = name.replace("requirements-", "");
      setLead((prevLead) => ({
        ...prevLead,
        requirements: { ...prevLead.requirements, [month]: value },
      }));
    } else {
      setLead((prevLead) => ({ ...prevLead, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    if (!canUpdateLead) {
      alert("You don't have permission to update leads.");
      return;
    }
    try {
      setError(null);
      await updateLead(id, lead);
      setIsEditing(false);
      await fetchLeadDetails();
    } catch (err) {
      console.error("Error updating lead:", err);
      showToast("Failed to update lead. Please try again.", "error");
    }
  };

  const handleDelete = async () => {
    if (!canDeleteLead) {
      alert("You don't have permission to delete leads.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        setError(null);
        await deleteLead(id);
        navigate("/lead");
      } catch (err) {
        console.error("Error deleting lead:", err);
        showToast("Failed to delete lead. Please try again.", "error");
      }
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!lead) {
    return <div className="text-center mt-8">Lead not found.</div>;
  }
  // Calculate total requirements
  const totalRequirements = Object.values(lead.requirements || {}).reduce(
    (acc, val) => acc + Number(val || 0),
    0
  );

  // Prepare data for the chart
  const chartData = Object.entries(lead.requirements || {}).map(
    ([month, value]) => ({
      month,
      requirements: Number(value || 0),
    })
  );

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        Lead Details - {lead.title}
      </h1>

      <div className="space-y-4">
        {isEditing ? (
          <>
            <input
              type="text"
              name="title"
              value={lead.title}
              onChange={handleInputChange}
              placeholder="Enter Title"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="companyName"
              value={lead.companyName}
              onChange={handleInputChange}
              placeholder="Enter Company Name"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="contactName"
              value={lead.contactName}
              onChange={handleInputChange}
              placeholder="Enter Contact name"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="phone"
              value={lead.phone}
              onChange={handleInputChange}
              placeholder="Enter Phone"
              className="w-full p-2 border rounded"
            />
            {/* <input
              type="text"
              name="userName"
              value={lead.userName}
              onChange={handleInputChange}
              placeholder="Enter User Name"
              className="w-full p-2 border rounded"
            /> */}

            <select
              name="userName"
              value={lead.userName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter User Name"
              required
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id || user.userId} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>

            <textarea
              name="description"
              value={lead.description}
              onChange={handleInputChange}
              placeholder="Enter Description"
              className="w-full p-2 border rounded"
              rows="4"
            />
            <div className="space-y-2">
              <label className="block font-bold text-gray-700">
                Requirements (Monthly)
              </label>
              {Object.keys(lead.requirements || {}).map((month) => (
                <div key={month} className="flex items-center space-x-2">
                  <label className="w-24">{month}:</label>
                  <input
                    type="number"
                    name={`requirements-${month}`}
                    value={lead.requirements[month] || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
            </div>

            {/* <select
              name="stage"
              value={lead.currentStage}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="New-Lead">New Lead</option>
              <option value="Need-Analysis">Need Analysis</option>
              <option value="Price">Price</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Lead-Won">Lead Won</option>
              <option value="Lead-Lost">Lead Lost</option>
            </select> */}
          </>
        ) : (
          <>
            <p className="text-xl text-gray-700">
              <strong>Title:</strong> {lead.title}
            </p>
            <p className="text-xl text-gray-700">
              <strong>Company Name:</strong> {lead.companyName}
            </p>
            <p className="text-xl text-gray-700">
              <strong>Contact Name:</strong> {lead.contactName}
            </p>
            <p className="text-xl text-gray-700">
              <strong>Phone:</strong> {lead.phone}
            </p>
            <p className="text-xl text-gray-700">
              <strong>Email:</strong> {lead.email}
            </p>
            <p className="text-xl text-gray-700">
              <strong>User Name:</strong> {lead.userName}
            </p>
            <p className="text-xl text-gray-700">
              <strong>Description:</strong> {lead.description}
            </p>
            <p className="text-xl text-gray-700">
              <strong>Current Stage:</strong> {lead.currentStage}
            </p>
            <p className="text-xl text-gray-700">
              <strong>Total Requirements:</strong> {totalRequirements}
            </p>

            {/* <p className="text-xl text-gray-700">
              <strong>Team:</strong> {lead.team}
            </p> */}
            {/* <p className="text-xl text-gray-700">
              <strong>Assigned To:</strong>{" "}
              {lead.assignedTo?.name || "Not Assigned"}
            </p> */}
          </>
        )}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={() => navigate("/lead")}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition duration-300"
        >
          Back to Leads
        </button>

        {canUpdateLead && (
          <>
            {isEditing ? (
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition duration-300"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition duration-300"
              >
                Edit Lead
              </button>
            )}
          </>
        )}
        {canDeleteLead && (
          <button
            onClick={handleDelete}
            className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition duration-300"
          >
            Delete Lead
          </button>
        )}
      </div>
      {/* Bar Chart Below the Card */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Monthly Requirements Overview
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="month"
              interval={0}
              angle={-45}
              textAnchor="end"
              tick={{ fontSize: 14 }} // Adjust font size as needed
            />

            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{ marginBottom: -15 }}/>
            <Bar dataKey="requirements" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LeadDetails;
