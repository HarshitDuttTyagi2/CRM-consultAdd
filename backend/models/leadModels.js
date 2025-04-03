const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    companyName: {
      type: String,
      required: [true, "companyName is required"],
    },
    contactName: {
      type: String,
      required: [true, "contactName is required"],
    },
    phone: {
      type: String,
      required: [true, "phone no. is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    currentStage:{
      type: String,
      required: [true, "currentStage is required"],
    },
    location: {
      type: String,
      required: [true, "location is required"],
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    employeeID: {
      type: String,
      required: [true, "employeeID is required"],
    },
    userName: {
      type: String,
      required: [true, "user Name is required"],
    },
    requirements: {
      type: Object,
      required: false,
      default: {}
    },
  },
  { timestamps: true }
);

const lead = mongoose.model("lead", leadSchema);
module.exports = lead;
