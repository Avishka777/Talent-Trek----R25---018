import { useState } from "react";
import { useSelector } from "react-redux";
import { Button, Datepicker, Label } from "flowbite-react";
import { Select, TextInput, Textarea } from "flowbite-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import jobService from "../../services/jobService";
import Swal from "sweetalert2";

const JobCreate = () => {
  const { token } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [jobData, setJobData] = useState({
    jobTitle: "",
    workExperience: "",
    skills: "",
    optionalSkills: "",
    job_level: "Junior",
    salaryRange: "",
    employmentType: "Full Time",
    applicationDeadline: "",
    jobDescription: "",
    qualifications: "",
    jobResponsibilities: "",
  });

  const [hrQuestions, setHrQuestions] = useState([
    {
      id: Date.now(),
      question: "",
      questionType: "text",
      options: [],
    },
  ]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
  };

  // Handle HR Question Change
  const handleHrQuestionChange = (id, field, value) => {
    setHrQuestions(
      hrQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  // Handle HR Question Option Change
  const handleHrQuestionOptionChange = (id, optionIndex, value) => {
    setHrQuestions(
      hrQuestions.map((q) => {
        if (q.id === id) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // Add new HR question
  const addHrQuestion = () => {
    setHrQuestions([
      ...hrQuestions,
      {
        id: Date.now(),
        question: "",
        questionType: "text",
        options: [],
      },
    ]);
  };

  // Remove HR question
  const removeHrQuestion = (id) => {
    if (hrQuestions.length > 1) {
      setHrQuestions(hrQuestions.filter((q) => q.id !== id));
    } else {
      Swal.fire({
        title: "Warning",
        text: "You need at least one HR question",
        icon: "warning",
      });
    }
  };

  // Add option to multiple-choice question
  const addOption = (id) => {
    setHrQuestions(
      hrQuestions.map((q) =>
        q.id === id ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  // Remove option from multiple-choice question
  const removeOption = (id, optionIndex) => {
    setHrQuestions(
      hrQuestions.map((q) => {
        if (q.id === id) {
          const newOptions = [...q.options];
          newOptions.splice(optionIndex, 1);
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // Handle Date Change
  const handleDateChange = (date) => {
    setJobData({
      ...jobData,
      applicationDeadline: date.toISOString().split("T")[0],
    });
  };

  // Validate Job Details Step
  const validateJobDetails = () => {
    if (
      !jobData.jobTitle ||
      !jobData.workExperience ||
      !jobData.job_level ||
      !jobData.skills ||
      !jobData.salaryRange ||
      !jobData.employmentType ||
      !jobData.applicationDeadline ||
      !jobData.jobDescription ||
      !jobData.qualifications ||
      !jobData.jobResponsibilities
    ) {
      Swal.fire({
        title: "Error",
        text: "All Fields Are Required.",
        confirmButtonColor: "red",
      });
      return false;
    }
    return true;
  };

  // Validate HR Questions Step
  const validateHrQuestions = () => {
    const invalidQuestions = hrQuestions.some((q) => {
      if (!q.question || !q.questionType) return true;
      if (q.questionType === "multiple-choice" && q.options.length < 2)
        return true;
      if (
        q.questionType === "multiple-choice" &&
        q.options.some((opt) => !opt.trim())
      )
        return true;
      return false;
    });

    if (invalidQuestions) {
      Swal.fire({
        title: "Error",
        text: "Please fill all HR questions and ensure multiple-choice questions have at least 2 non-empty options",
        confirmButtonColor: "red",
      });
      return false;
    }
    return true;
  };

  // Handle Next Step
  const handleNext = () => {
    if (validateJobDetails()) {
      setStep(2);
    }
  };

  // Handle Previous Step
  const handlePrevious = () => {
    setStep(1);
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateHrQuestions()) return;

    try {
      const payload = {
        ...jobData,
        skills: jobData.skills.split(",").map((skill) => skill.trim()),
        optionalSkills: jobData.optionalSkills
        ? jobData.optionalSkills.split(",").map((skill) => skill.trim())
        : [],
        qualifications: jobData.qualifications.split("\n"),
        jobResponsibilities: jobData.jobResponsibilities.split("\n"),
        hrQuestions: hrQuestions.map((q) => ({
          question: q.question,
          questionType: q.questionType,
          options: q.questionType === "multiple-choice" ? q.options : undefined,
        })),
      };

      const response = await jobService.createJob(payload, token);
      if (response.success) {
        Swal.fire({
          title: "Success",
          text: response.message || "Job Created Successfully.",
          confirmButtonColor: "#28a0b5",
        });
        // Reset form
        setJobData({
          jobTitle: "",
          workExperience: "",
          skills: "",
          optionalSkills: "",
          salaryRange: "",
          employmentType: "Full Time",
          applicationDeadline: "",
          jobDescription: "",
          qualifications: "",
          jobResponsibilities: "",
        });
        setHrQuestions([
          {
            id: Date.now(),
            question: "",
            questionType: "text",
            options: [],
          },
        ]);
        setStep(1);
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

  // Step 1: Job Details Form
  const renderJobDetails = () => (
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
          <Label className="mb-1">Required Skills</Label>
          <TextInput
            name="skills"
            placeholder="Skills (comma-separated)"
            value={jobData.skills}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label className="mb-1">Optional Skills</Label>
          <TextInput
            name="optionalSkills"
            placeholder="Optional Skills (comma-separated)"
            value={jobData.optionalSkills}
            onChange={handleChange}
          />
          <p className="text-sm text-gray-500 mt-1">
            These are nice-to-have skills (not required)
          </p>
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
          <Label className="mb-1">Job Level</Label>
          <div className="flex gap-4 mt-2">
            {["Junior", "Associate", "Senior", "Intern"].map((level) => (
              <div key={level} className="flex items-center">
                <input
                  type="radio"
                  id={`job_level_${level}`}
                  name="job_level"
                  value={level}
                  checked={jobData.job_level === level}
                  onChange={handleChange}
                  className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 focus:ring-cyan-500"
                />
                <Label htmlFor={`job_level_${level}`} className="ml-2">
                  {level}
                </Label>
              </div>
            ))}
          </div>
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
            rows={4}
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
            rows={6}
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
            rows={6}
            value={jobData.jobResponsibilities}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );

  // Step 2: HR Questions Form
  const renderHrQuestions = () => (
    <div className="flex gap-4">
      {/* Left Side Column */}
      <div className="flex flex-col w-full gap-4">
        {hrQuestions.map(
          (q, index) =>
            index % 2 === 0 && (
              <div key={q.id} className="mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Label className="mb-1">Question {index + 1}</Label>
                  {hrQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHrQuestion(q.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <TextInput
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) =>
                    handleHrQuestionChange(q.id, "question", e.target.value)
                  }
                  className="mb-3"
                  required
                />

                <div className="mb-3">
                  <Label className="mb-1">Question Type</Label>
                  <Select
                    value={q.questionType}
                    onChange={(e) =>
                      handleHrQuestionChange(
                        q.id,
                        "questionType",
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="text">Text Answer</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="boolean">Yes/No</option>
                  </Select>
                </div>

                {q.questionType === "multiple-choice" && (
                  <div className="mb-3">
                    <Label className="mb-1">
                      Options (at least 2 required)
                    </Label>
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center gap-2 mb-2"
                      >
                        <TextInput
                          value={option}
                          onChange={(e) =>
                            handleHrQuestionOptionChange(
                              q.id,
                              optIndex,
                              e.target.value
                            )
                          }
                          className="flex-1"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(q.id, optIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="xs"
                      color="light"
                      onClick={() => addOption(q.id)}
                      className="mt-1"
                    >
                      Add Option
                    </Button>
                  </div>
                )}
              </div>
            )
        )}
      </div>

      {/* Right Side Column */}
      <div className="flex flex-col w-full gap-4">
        {hrQuestions.map(
          (q, index) =>
            index % 2 === 1 && (
              <div key={q.id} className="mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Label className="mb-1">Question {index + 1}</Label>
                  {hrQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHrQuestion(q.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <TextInput
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) =>
                    handleHrQuestionChange(q.id, "question", e.target.value)
                  }
                  className="mb-3"
                  required
                />

                <div className="mb-3">
                  <Label className="mb-1">Question Type</Label>
                  <Select
                    value={q.questionType}
                    onChange={(e) =>
                      handleHrQuestionChange(
                        q.id,
                        "questionType",
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="text">Text Answer</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="boolean">Yes/No</option>
                  </Select>
                </div>

                {q.questionType === "multiple-choice" && (
                  <div className="mb-3">
                    <Label className="mb-1">
                      Options (at least 2 required)
                    </Label>
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center gap-2 mb-2"
                      >
                        <TextInput
                          value={option}
                          onChange={(e) =>
                            handleHrQuestionOptionChange(
                              q.id,
                              optIndex,
                              e.target.value
                            )
                          }
                          className="flex-1"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(q.id, optIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="xs"
                      color="light"
                      onClick={() => addOption(q.id)}
                      className="mt-1"
                    >
                      Add Option
                    </Button>
                  </div>
                )}
              </div>
            )
        )}
        <div className="flex justify-end">
          <Button
            type="button"
            color="light"
            onClick={addHrQuestion}
            className="mt-2"
          >
            Add Another Question
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-cyan-600">
          Publish a Job Post
        </h2>

        {/* Step Indicator */}
        <div className="flex mb-6">
          <div
            className={`flex items-center ${
              step >= 1 ? "text-cyan-600" : "text-gray-400"
            }`}
          >
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${
                step >= 1 ? "bg-cyan-600 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span>Job Details</span>
          </div>
          <div className="flex-1 border-t-2 border-gray-300 mx-2 mt-4"></div>
          <div
            className={`flex items-center ${
              step >= 2 ? "text-cyan-600" : "text-gray-400"
            }`}
          >
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center mr-2 ${
                step >= 2 ? "bg-cyan-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span>HR Questions</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 ? renderJobDetails() : renderHrQuestions()}

          <div className="flex justify-between mt-6 pb-6">
            {step === 1 ? (
              <div></div> // Empty div for spacing on first step
            ) : (
              <Button type="button" color="light" onClick={handlePrevious}>
                Previous
              </Button>
            )}

            {step === 1 ? (
              <Button
                type="button"
                gradientMonochrome="info"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" gradientMonochrome="info">
                Create Job
              </Button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default JobCreate;
