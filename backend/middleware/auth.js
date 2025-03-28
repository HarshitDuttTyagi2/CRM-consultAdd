const jwt = require("jsonwebtoken");
const user = require("../models/userModels");

const jwtToken = async (req, res, next) => {
  console.log('req.cookies', req.cookies);
  let token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log('Decoded', decoded);
    if (!decoded) {
      return res.status(401).send({
        message: "Not authorized, token failed",
        success: false,
      });
    }
    const userData = await user.findById(decoded.id);
    if (!userData) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    if (userData.isBlocked) {
      return res.status(403).send({
        success: false,
        message:
          "Your account has been blocked. Please contact the administrator.",
      });
    }
    req.user = userData;
    next();
  } catch (err) {
    res.status(401).send({
      message: "Not authorized, token failed",
      success: false,
    });
  }
};

module.exports = { jwtToken };
