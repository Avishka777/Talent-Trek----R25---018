const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const authenticateUser = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); 

// Create a new company
router.post("/create", upload.single("logo"), authenticateUser, companyController.createCompany);

// Get a company by user ID
router.get("/company", authenticateUser, companyController.getCompanyByUser);

// Update company details
router.put("/update", authenticateUser, upload.single("logo"), companyController.updateCompany);

// Delete a company
router.delete("/delete", authenticateUser, companyController.deleteCompany);

// Get all companies (admin only)
router.get("/", authenticateUser, companyController.getAllCompanies);

module.exports = router;
