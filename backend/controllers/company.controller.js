const cloudinary = require("cloudinary").v2;
const Company = require("../models/company.model");

// Create a new company
exports.createCompany = async (req, res) => {
  try {
    const { companyName, location, phone } = req.body;
    const userId = req.user.id;

    // Handle logo upload
    let logoUrl = "";
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: "company_logos",
      });
      logoUrl = uploadResponse.secure_url;
    }

    // Create new company record
    const newCompany = new Company({
      userId,
      companyName,
      location,
      phone,
      logo: logoUrl,
    });

    await newCompany.save();
    res
      .status(201)
      .json({ message: "Company created successfully", company: newCompany });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating company", error: error.message });
  }
};

// Get a company by user ID (User's company)
exports.getCompanyByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await Company.findOne({ userId });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ company });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching company", error: error.message });
  }
};

// Update a company's details
exports.updateCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { companyName, location, phone } = req.body;
    let logoUrl = null;

    // Check if a new logo is uploaded
    if (req.file) {
      // Upload the new logo to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: "company_logos",
      });
      logoUrl = uploadResponse.secure_url;
    }

    // Update the company details, including the logo if available
    const updatedCompany = await Company.findOneAndUpdate(
      { userId },
      { companyName, location, phone, logo: logoUrl || undefined },
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating company",
      error: error.message,
    });
  }
};

// Delete a company
exports.deleteCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await Company.findOneAndDelete({ userId });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting company", error: error.message });
  }
};

// Get all companies (admin access or for viewing purposes)
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate("userId", "fullName email");
    res.status(200).json({ companies });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching companies", error: error.message });
  }
};
