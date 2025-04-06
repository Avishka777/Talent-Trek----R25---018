import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Button, Datepicker, Label } from "flowbite-react";
import { Select, TextInput, Textarea } from "flowbite-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import jobService from "../../services/jobService";
import Swal from "sweetalert2";

const JobUpdate = () => {
  const { token } = useSelector((state) => state.auth);
  const { jobId } = useParams();
  const [jobData, setJobData] = useState({
    jobTitle: "",
    workExperience: "",
    skills: "",
    salaryRange: "",
    employmentType: "Full Time",
    applicationDeadline: "",
    jobDescription: "",
    qualifications: "",
    jobResponsibilities: ""
  });

  // Fetch Existing Job Details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await jobService.getJobById(jobId, token);
        if (response.success) {
          setJobData({
            ...response.job,
            skills: response.job.skills.join(", "),
            qualifications: response.job.qualifications.join("\n"),
            jobResponsibilities: response.job.jobResponsibilities.join("\n"),
          });
        } else {
          Swal.fire({
            title: "Error",
            text: response.message || "Failed to Load Job Details.",
            confirmButtonColor: "red",
          });
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        Swal.fire({
          title: "Error",
          text: error.message || "Something Went Wrong.",
          confirmButtonColor: "red",
        });
      }
    };

    fetchJobDetails();
  }, [jobId, token]);

  // Handle Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
  };

  // Handle Date Changes
  const handleDateChange = (date) => {
    setJobData({
      ...jobData,
      applicationDeadline: date.toISOString().split("T")[0],
    });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...jobData,
        skills: jobData.skills.split(",").map((skill) => skill.trim()),
        qualifications: jobData.qualifications.split("\n"),
        jobResponsibilities: jobData.jobResponsibilities.split("\n"),
      };

      const response = await jobService.updateJob(jobId, payload, token);
      if (response.success) {
        Swal.fire({
          title: "Success",
          text: response.message || "Job Updated Successfully.",
          confirmButtonColor: "#28a0b5",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: response.message || "Failed to update job.",
          confirmButtonColor: "red",
        });
      }
    } catch (error) {
      console.error("Error updating job:", error);
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
        <h2 className="text-2xl font-semibold mb-4 text-cyan-600">
          Edit Job Post
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="flex flex-col w-full gap-4">
              <div>
                <Label className="mb-1">Job Title</Label>
                <TextInput
                  name="jobTitle"
                  value={jobData.jobTitle}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Work Experience</Label>
                <TextInput
                  name="workExperience"
                  value={jobData.workExperience}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Skills</Label>
                <TextInput
                  name="skills"
                  value={jobData.skills}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="mb-1">Salary Range</Label>
                <TextInput
                  name="salaryRange"
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
                  selected={new Date(jobData.applicationDeadline)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col w-full gap-4">
              <div>
                <Label className="mb-1">Job Description</Label>
                <Textarea
                  name="jobDescription"
                  value={jobData.jobDescription}
                  onChange={handleChange}
                  required
                  rows={3}
                />
              </div>
              <div>
                <Label className="mb-1">Qualifications</Label>
                <Textarea
                  name="qualifications"
                  value={jobData.qualifications}
                  onChange={handleChange}
                  required
                  rows={5}
                />
              </div>
              <div>
                <Label className="mb-1">Job Responsibilities</Label>
                <Textarea
                  name="jobResponsibilities"
                  value={jobData.jobResponsibilities}
                  onChange={handleChange}
                  required
                  rows={5}
                />
              </div>
              <Button gradientMonochrome="info" type="submit">
                Edit Job Post
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default JobUpdate;
