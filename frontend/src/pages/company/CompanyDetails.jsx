import { useState, useEffect } from "react";
import axios from "axios";
import { TextInput, Label, Spinner } from "flowbite-react";
import Swal from "sweetalert2";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function CompanyDetails() {
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    location: "",
    phone: "",
    logo: null, // Store logo as a file
  });
  const [loading, setLoading] = useState(false);
  const [isCompanyCreated, setIsCompanyCreated] = useState(false); // Track if company exists

  // Fetch existing company details if available
  const fetchCompanyDetails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}company/company`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Check if company data exists
      if (response.data.company) {
        const company = response.data.company;
        setCompanyDetails({
          companyName: company.companyName,
          location: company.location,
          phone: company.phone,
          logo: company.logo,
        });
        setIsCompanyCreated(true); // Set flag to true if company exists
      } else {
        setIsCompanyCreated(false); // Company doesn't exist, show create form
      }
    } catch (error) {
      console.error("Error fetching company details", error);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const handleChange = (e) => {
    setCompanyDetails({
      ...companyDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setCompanyDetails({
      ...companyDetails,
      logo: e.target.files[0], // Set logo as file
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("companyName", companyDetails.companyName);
    formData.append("location", companyDetails.location);
    formData.append("phone", companyDetails.phone);
    if (companyDetails.logo) {
      formData.append("logo", companyDetails.logo); // Append logo if updated
    }

    try {
      setLoading(true);
      let response;
      if (isCompanyCreated) {
        response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}company/update`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}company/create`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: `Company ${isCompanyCreated ? "Updated" : "Created"}!`,
          text: `Your company details have been ${
            isCompanyCreated ? "updated" : "created"
          } successfully.`,
        });
        // Refetch the company details after update
        fetchCompanyDetails();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl mb-3 text-center font-serif text-orange-500">
        {isCompanyCreated ? "Update Company Details" : "Create Company"}
      </h2>
      <hr className="shadow-lg mb-4 w-full bg-gray-300" />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column for form */}
        <div className="w-full md:w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4 w-full flex flex-col">
              <Label value="Company Name" />
              <TextInput
                name="companyName"
                value={companyDetails.companyName}
                onChange={handleChange}
                required
                placeholder="Enter Company Name"
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <Label value="Location" />
              <TextInput
                name="location"
                value={companyDetails.location}
                onChange={handleChange}
                required
                placeholder="Enter Location"
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <Label value="Phone Number" />
              <TextInput
                name="phone"
                value={companyDetails.phone}
                onChange={handleChange}
                required
                placeholder="Enter Phone Number"
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <Label value="Logo" />
              <input
                type="file"
                name="logo"
                onChange={handleFileChange}
                className="w-full mt-1 border rounded-md bg-slate-100"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 p-2 rounded-lg
              text-white font-semibold shadow-md transition-all duration-300
              mt-4"
              >
                {" "}
                {loading ? (
                  <Spinner size="sm" />
                ) : isCompanyCreated ? (
                  "Update Company"
                ) : (
                  "Create Company"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right column for logo preview */}
        <div className="w-full md:w-1/2 flex justify-center mt-10">
          {companyDetails.logo && (
            <img
              src={companyDetails.logo}
              alt="Company Logo"
              className="w-80 h-80 mb-4 object-cover rounded-full"
            />
          )}
          {!companyDetails.logo && (
            <img
              src="https://img.freepik.com/free-photo/layout-icon-front-side_187299-45683.jpg?t=st=1743654658~exp=1743658258~hmac=1746320ad6aeb16e7388eb5fe1b1d67f4f88204f3e5ff875a69433f7cebe0aae&w=826"
              alt="Placeholder Logo"
              className="w-80 h-80 mb-4 object-cover rounded-full"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
