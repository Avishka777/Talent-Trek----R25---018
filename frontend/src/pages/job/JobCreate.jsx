import { useState } from "react";
import { Button, Datepicker, Label } from "flowbite-react";
import { Select, TextInput, Textarea } from "flowbite-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

export default function JobCreationPage() {
  const currentDate = new Date().toISOString();

  const [jobData, setJobData] = useState({
    jobTitle: "",
    companyName: "",
    companyLogo: null,
    location: "",
    salaryRange: "",
    employmentType: "",
    postedDate: currentDate,
    applicationDeadline: "",
    descriptionSnippet: "",
    skills: "",
    experience: "",
    qualifications: "",
    responsibilities: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setJobData({ ...jobData, [name]: files[0] });
    } else {
      setJobData({ ...jobData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Job Created:", jobData);
  };

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Create a Job Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Left Side Section */}
          <div className="flex gap-4">
            <div className="flex flex-col w-full gap-4">
              <div>
                <Label className="flex mb-1">Job Title</Label>
                <TextInput
                  name="jobTitle"
                  placeholder="Job Title"
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="flex mb-1">Work Experience</Label>
                <TextInput
                  name="experience"
                  placeholder="Work Experience"
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="flex mb-1">Skills</Label>
                <TextInput
                  name="skills"
                  placeholder="Skills (comma-separated)"
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="flex mb-1">Salary Range</Label>
                <TextInput
                  name="salaryRange"
                  placeholder="Salary Range"
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="flex mb-1">Employment Type</Label>
                <Select
                  name="employmentType"
                  value={jobData.employmentType}
                  onChange={handleChange}
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </Select>
              </div>
              <div>
                <Label className="flex mb-1">Application Deadline</Label>
                <Datepicker />
              </div>
            </div>
            {/* Right Side Section */}
            <div className="flex flex-col w-full gap-4">
              <div>
                <Label className="flex mb-1">Job Description</Label>
                <Textarea
                  name="descriptionSnippet"
                  placeholder="Job Description"
                  rows={3}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="flex mb-1">Qualifications</Label>
                <Textarea
                  name="qualifications"
                  placeholder="Qualifications (comma-separated)"
                  rows={5}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label className="flex mb-1">Job Responsibilities</Label>
                <Textarea
                  name="responsibilities"
                  placeholder="Job Responsibilities (comma-separated)"
                  rows={5}
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
