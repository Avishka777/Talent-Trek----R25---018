import { useState, useEffect } from "react";
import { TextInput, Label, Spinner } from "flowbite-react";
import Swal from "sweetalert2";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import companyService from "../../services/companyService";
import { useSelector } from "react-redux";

export default function CompanyDetails() {
  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    location: "",
    phone: "",
    logo: null, 
  });
  const [loading, setLoading] = useState(false);
  const [isCompanyCreated, setIsCompanyCreated] = useState(false);
  const { token } = useSelector((state) => state.auth);

  // Fetch existing company details if available
  const fetchCompanyDetails = async () => {
    try {
      const data = await companyService.getCompanyDetails(token);
      if (data.company) {
        const company = data.company;
        setCompanyDetails({
          companyName: company.companyName,
          location: company.location,
          phone: company.phone,
          logo: company.logo,
        });
        setIsCompanyCreated(true);
      } else {
        setIsCompanyCreated(false);
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
      logo: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("companyName", companyDetails.companyName);
    formData.append("location", companyDetails.location);
    formData.append("phone", companyDetails.phone);
    if (companyDetails.logo && companyDetails.logo instanceof File) {
      formData.append("logo", companyDetails.logo);
    }

    try {
      setLoading(true);
      let response;
      if (isCompanyCreated) {
        response = await companyService.updateCompany(formData, token);
      } else {
        response = await companyService.createCompany(formData, token);
      }

      Swal.fire({
        icon: "success",
        title: `Company ${isCompanyCreated ? "Updated" : "Created"}!`,
        text: `Your company details have been ${
          isCompanyCreated ? "updated" : "created"
        } successfully.`,
      });
      // Refetch the company details after create/update
      fetchCompanyDetails();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong.",
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
                className="w-full bg-orange-500 hover:bg-orange-600 p-2 rounded-lg text-white font-semibold shadow-md transition-all duration-300 mt-4"
              >
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
          {companyDetails.logo ? (
            <img
              src={
                typeof companyDetails.logo === "string"
                  ? companyDetails.logo
                  : URL.createObjectURL(companyDetails.logo)
              }
              alt="Company Logo"
              className="w-80 h-80 mb-4 object-cover rounded-full"
            />
          ) : (
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
