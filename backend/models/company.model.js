const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default:
        "https://img.freepik.com/free-photo/layout-icon-front-side_187299-45683.jpg?t=st=1743654658~exp=1743658258~hmac=1746320ad6aeb16e7388eb5fe1b1d67f4f88204f3e5ff875a69433f7cebe0aae&w=826",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
