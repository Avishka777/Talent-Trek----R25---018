import { useState } from "react";
import { useSelector } from "react-redux";
import { Button, Datepicker, Label } from "flowbite-react";
import { Select, TextInput, Textarea } from "flowbite-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import jobService from "../../services/jobService";
import Swal from "sweetalert2";

export default function JobCreationPage() {
  const { token } = useSelector((state) => state.auth);
  const [jobData, setJobData] = useState({
    jobTitle: "",
    workExperience: "",
    skills: "",
    salaryRange: "",
    employmentType: "Full Time",
    applicationDeadline: "",
    jobDescription: "",
    qualifications: "",
    jobResponsibilities: "",
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
  };

  // Handle Date Change
  const handleDateChange = (date) => {
    setJobData({
      ...jobData,
      applicationDeadline: date.toISOString().split("T")[0],
    });
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate Input Fields
    if (
      !jobData.jobTitle ||
      !jobData.workExperience ||
      !jobData.skills ||
      !jobData.salaryRange ||
      !jobData.employmentType ||
      !jobData.applicationDeadline ||
      !jobData.jobDescription ||
      !jobData.qualifications ||
      !jobData.jobResponsibilities
    ) {
      return Swal.fire({
        title: "Error",
        text: "All Fields Are Required.",
        confirmButtonColor: "red",
      });
    }

    try {
      const payload = {
        jobTitle: jobData.jobTitle,
        workExperience: jobData.workExperience,
        skills: jobData.skills.split(",").map((skill) => skill.trim()),
        salaryRange: jobData.salaryRange,
        employmentType: jobData.employmentType,
        applicationDeadline: jobData.applicationDeadline,
        jobDescription: jobData.jobDescription,
        qualifications: jobData.qualifications.split("\n"),
        jobResponsibilities: jobData.jobResponsibilities.split("\n"),
      };

      const response = await jobService.createJob(payload, token);
      if (response.success) {
        Swal.fire({
          title: "Success",
          text: response.message || "Job Created Successfully.",
          confirmButtonColor: "#28a0b5",
        });
        setJobData({
          jobTitle: "",
          workExperience: "",
          skills: "",
          salaryRange: "",
          employmentType: "",
          applicationDeadline: "",
          jobDescription: "",
          qualifications: "",
          jobResponsibilities: "",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: response.message || "Failed to Create Job.",
          confirmButtonColor: "red",
        });
      }
    } catch (error) {
      console.error("Error creating job:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Something Went Wrong.",
        confirmButtonColor: "red",
      });
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Create a Job Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            {/* Left Side */}
            <div className="flex flex-col w-full gap-4">
              <div>
                <Label className="mb-1">Job Title</Label>
                <TextInput
                  name="jobTitle"
                  placeholder="Job Title"
                  value={jobData.jobTitle}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Work Experience</Label>
                <TextInput
                  name="workExperience"
                  placeholder="Work Experience"
                  value={jobData.workExperience}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Skills</Label>
                <TextInput
                  name="skills"
                  placeholder="Skills (comma-separated)"
                  value={jobData.skills}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Salary Range</Label>
                <TextInput
                  name="salaryRange"
                  placeholder="Salary Range"
                  value={jobData.salaryRange}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Employment Type</Label>
                <Select
                  name="employmentType"
                  value={jobData.employmentType}
                  onChange={handleChange}
                  required
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </Select>
              </div>
              <div>
                <Label className="mb-1">Application Deadline</Label>
                <Datepicker
                  onSelectedDateChanged={handleDateChange}
                  minDate={new Date()}
                  required
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col w-full gap-4">
              <div>
                <Label className="mb-1">Job Description</Label>
                <Textarea
                  name="jobDescription"
                  placeholder="Job Description"
                  rows={3}
                  value={jobData.jobDescription}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Qualifications</Label>
                <Textarea
                  name="qualifications"
                  placeholder="Qualifications (one per line)"
                  rows={5}
                  value={jobData.qualifications}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Job Responsibilities</Label>
                <Textarea
                  name="jobResponsibilities"
                  placeholder="Job Responsibilities (one per line)"
                  rows={5}
                  value={jobData.jobResponsibilities}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button gradientMonochrome="info" type="submit">
                Create Job
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
