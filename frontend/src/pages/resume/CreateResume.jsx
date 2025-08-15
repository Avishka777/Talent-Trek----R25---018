import axios from "axios";
import Swal from "sweetalert2";
import template1 from "../../assets/resume/template1.png";
import template2 from "../../assets/resume/template2.png";
import template3 from "../../assets/resume/template3.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/public/Loading";

const CreateResume = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    github: "",
    linkedin: "",
    portfolio: "",
    interests: "",
    languages: "",
    softSkills: "",
    technicalSkills: "",
    education: [{ degree: "", institution: "", timeRange: "" }],
    workExperience: [{ position: "", company: "", timeRange: "" }],
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("ResumeData"));
    if (savedData) {
      setFormData({
        ...formData,
        ...savedData,
        education: savedData.education || [
          { degree: "", institution: "", timeRange: "" },
        ],
        workExperience: savedData.workExperience || [
          { position: "", company: "", timeRange: "" },
        ],
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDynamicChange = (index, field, value, section) => {
    const updatedSection = [...formData[section]];
    updatedSection[index][field] = value;
    setFormData({ ...formData, [section]: updatedSection });
  };

  const addNewSection = (section) => {
    const newEntry =
      section === "education"
        ? { degree: "", institution: "", timeRange: "" }
        : { position: "", company: "", timeRange: "" };

    setFormData({
      ...formData,
      [section]: [...formData[section], newEntry],
    });
  };

  const removeSection = (index, section) => {
    const updatedSection = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: updatedSection });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedEducation = formData.education
        .map(
          (edu) => `${edu.degree} from ${edu.institution} (${edu.timeRange})`
        )
        .join(", ");

      const formattedWorkExperience = formData.workExperience
        .map(
          (work) => `${work.position} at ${work.company} (${work.timeRange})`
        )
        .join(", ");

      const resumeSummary = `
        Skills: ${formData.technicalSkills}. 
        Soft Skills: ${formData.softSkills}. 
        Interests: ${formData.interests}. 
        Languages: ${formData.languages}. 
        Education: ${formattedEducation}. 
        Work Experience: ${formattedWorkExperience}.
      `;

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}resumes/create-resume-text`,
        { resumeSummary, experienceYears: formData.experienceYears },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      Swal.fire({
        title: "Resume Created!",
        text: "Your resume has been successfully created.",
        confirmButtonColor: "#3b82f6",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to create resume",
        confirmButtonColor: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDataAndNavigate = (template) => {
    localStorage.setItem("ResumeData", JSON.stringify(formData));
    navigate(`/resume-${template}`);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("ResumeData");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      github: "",
      linkedin: "",
      portfolio: "",
      interests: "",
      languages: "",
      softSkills: "",
      technicalSkills: "",
      education: [{ degree: "", institution: "", timeRange: "" }],
      workExperience: [{ position: "", company: "", timeRange: "" }],
    });
    Swal.fire({
      title: "Cleared!",
      text: "All form data has been reset.",
      confirmButtonColor: "#3b82f6",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loading />
        <p className="text-gray-600 text-lg ml-4">Processing your resume...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-sky-500 mb-4">
            Build Your Professional Resume
          </h1>
          <p className="text-lg text-gray-600">
            Fill in your details and choose a template to create your perfect
            resume
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-sky-600 mb-4 border-b pb-2">
                Personal Information
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: "First Name",
                    name: "firstName",
                    type: "text",
                    required: true,
                  },
                  {
                    label: "Last Name",
                    name: "lastName",
                    type: "text",
                    required: true,
                  },
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    required: true,
                  },
                  {
                    label: "Contact Number",
                    name: "contactNumber",
                    type: "text",
                    required: true,
                  },
                  {
                    label: "Years of Experience",
                    name: "experienceYears",
                    type: "text",
                    required: true,
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-sky-600 mb-4 border-b pb-2">
                Professional Links
              </h2>
              <div className="space-y-4">
                {[
                  { label: "GitHub URL", name: "github", type: "url" },
                  { label: "LinkedIn URL", name: "linkedin", type: "url" },
                  { label: "Portfolio URL", name: "portfolio", type: "url" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-sky-600 mb-4 border-b pb-2">
                Education History
              </h2>
              {formData.education.map((edu, index) => (
                <div key={index} className="mb-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">
                      Education #{index + 1}
                    </h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeSection(index, "education")}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {[
                    { label: "Degree", name: "degree" },
                    { label: "Institution", name: "institution" },
                    { label: "Time Period", name: "timeRange" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={edu[field.name]}
                        onChange={(e) =>
                          handleDynamicChange(
                            index,
                            field.name,
                            e.target.value,
                            "education"
                          )
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addNewSection("education")}
                className="mt-2 text-sky-600 hover:text-sky-700 font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Education
              </button>
            </div>

            {/* Work Experience */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-sky-600 mb-4 border-b pb-2">
                Work Experience
              </h2>
              {formData.workExperience.map((work, index) => (
                <div key={index} className="mb-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">
                      Experience #{index + 1}
                    </h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeSection(index, "workExperience")}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {[
                    { label: "Position", name: "position" },
                    { label: "Company", name: "company" },
                    { label: "Time Period", name: "timeRange" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-gray-700 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={work[field.name]}
                        onChange={(e) =>
                          handleDynamicChange(
                            index,
                            field.name,
                            e.target.value,
                            "workExperience"
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addNewSection("workExperience")}
                className="mt-2 text-sky-600 hover:text-sky-700 font-medium flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Experience
              </button>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-sky-600 mb-4 border-b pb-2">
                Skills & Expertise
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Technical Skills (comma separated)
                  </label>
                  <textarea
                    name="technicalSkills"
                    value={formData.technicalSkills}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    Soft Skills (comma separated)
                  </label>
                  <textarea
                    name="softSkills"
                    value={formData.softSkills}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Interests & Languages */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-sky-600 mb-4 border-b pb-2">
                Additional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Interests (comma separated)
                  </label>
                  <textarea
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    Languages (comma separated)
                  </label>
                  <textarea
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={clearLocalStorage}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md transition w-80"
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition w-80"
            >
              Save Resume Data
            </button>
          </div>
        </form>

        {/* Template Selection */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-sky-500 mb-6 text-center">
            Choose Your Resume Template
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "template-1", name: "Simple", img: template1 },
              { id: "template-2", name: "ATS Friendly", img: template2 },
              { id: "template-3", name: "Modern", img: template3 },
            ].map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={template.img}
                  alt={template.name}
                  className="w-full h-80 object-contain"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-center mb-2">
                    {template.name}
                  </h3>
                  <button
                    onClick={() => saveDataAndNavigate(template.id)}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateResume;
