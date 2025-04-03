const express = require("express");
const { getAdminDashboardData, getUserData } = require("../controller/dashboardController");
const { jwtToken } = require("../middleware/auth");
const { checkAdmin } = require("../middleware/checkAdmin")


const routers = express.Router();

routers.get("/admin", jwtToken, checkAdmin(), (req, res, next) => {
  console.log("Admin dashboard route accessed");
  getAdminDashboardData(req, res, next);
});

routers.get("/user", jwtToken, (req, res, next) => {
  getUserData(req, res, next);
});

module.exports = routers;
