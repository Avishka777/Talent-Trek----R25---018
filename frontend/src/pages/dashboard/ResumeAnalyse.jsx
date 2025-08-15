/* eslint-disable react/no-unescaped-entities */
import { FileCheck, Settings, Info } from "lucide-react";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import {
  Table,
  Select,
  Tooltip,
  Button,
  Modal,
  Label,
  TextInput,
  Badge,
} from "flowbite-react";
import Swal from "sweetalert2";
import Loading from "../../components/public/Loading";
import jobService from "../../services/jobService";
import resumeService from "../../services/resumeService";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import appliedJobService from "../../services/appliedJobService";

const ResumeAnalyse = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [resumes, setResumes] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);

  // Default weights with descriptions
  const defaultWeights = {
    experience_score: 0.45,
    skills_score: 0.05,
    profession_score: 0.15,
    summary_score: 0.35,
  };

  const [weights, setWeights] = useState({ ...defaultWeights });
  const [totalWeight, setTotalWeight] = useState(1);
  const { token, user } = useSelector((state) => state.auth);
  const recommenderId = user?._id;

  // Load weights from localStorage on component mount
  useEffect(() => {
    const savedWeights = localStorage.getItem("resumeMatchingWeights");
    if (savedWeights) {
      try {
        const parsedWeights = JSON.parse(savedWeights);
        setWeights(parsedWeights);
      } catch (e) {
        console.error("Failed to parse saved weights", e);
      }
    }
  }, []);

  // Calculate total weight whenever weights change
  useEffect(() => {
    const total = Object.values(weights).reduce(
      (sum, val) => sum + parseFloat(val || 0),
      0
    );
    setTotalWeight(total);
  }, [weights]);

  // Fetch jobs and set the latest job as default
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobService.getJobsByUser(token);
        if (response.success) {
          setJobs(response.jobs);
          if (response.jobs.length > 0) {
            setSelectedJob(response.jobs[0]._id);
          }
        } else {
          setJobs([]);
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error.message || "Failed to Load Data.",
          confirmButtonColor: "red",
        });
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [token]);

  // Fetch matching resumes when a job is selected
  useEffect(() => {
    if (selectedJob) {
      fetchMatchingResumes(selectedJob);
    }
  }, [selectedJob]);

  const fetchMatchingResumes = async (jobId) => {
    setLoading(true);
    try {
      const response = await resumeService.getMatchingResumes(
        jobId,
        token,
        weights
      );
      setResumes(response.matches || []);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to Fetch Resume Data.",
        confirmButtonColor: "red",
      });
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setWeights((prev) => ({
        ...prev,
        [key]: numValue,
      }));
    }
  };

  const saveWeights = () => {
    if (totalWeight !== 1) {
      Swal.fire({
        title: "Error",
        text: "Total weights must sum to 1 (100%)",
        icon: "error",
        confirmButtonColor: "red",
      });
      return;
    }

    localStorage.setItem("resumeMatchingWeights", JSON.stringify(weights));
    setOpenModal(false);
    if (selectedJob) {
      fetchMatchingResumes(selectedJob);
    }

    Swal.fire({
      title: "Success",
      text: "Weights configuration saved successfully!",
      icon: "success",
      confirmButtonColor: "#28a0b5",
    });
  };

  const resetToDefaults = () => {
    setWeights({ ...defaultWeights });
  };

  const handleStatusChange = async (resumeId, newStatus, userId) => {
    try {
      if (newStatus === "Recommended") {
        // Call the recommendation service with both jobId and userId
        const response = await appliedJobService.recommendedForJob(
          selectedJob,
          userId,
          token,
          recommenderId
        );

        Swal.fire({
          title: "Success",
          text:
            response.message || "Candidate has been recommended for this job",
          icon: "success",
          confirmButtonColor: "#28a0b5",
        });
      } else {
        Swal.fire({
          title: "Status Updated",
          text: `Status changed to ${newStatus}`,
          icon: "success",
          confirmButtonColor: "#28a0b5",
        });
      }
      if (selectedJob) {
        fetchMatchingResumes(selectedJob);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to update status",
        icon: "error",
        confirmButtonColor: "red",
      });
    }
  };

  if (loadingJobs) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center mt-40">
          <Loading />
          <p className="text-gray-600 text-center mt-10 font-semibold text-xl">
            Loading Jobs...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex mb-4 justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Resume Analysis
        </h2>

        <div className="flex gap-4 items-center">
          {/* Information Button */}
          <Tooltip content="Learn how matching works">
            <Button color="light" onClick={() => setOpenInfoModal(true)}>
              <Info className="h-4 w-4" />
            </Button>
          </Tooltip>

          {/* Weight Configuration Button */}
          <Button onClick={() => setOpenModal(true)}>
            <Settings className="mr-2 h-5 w-4" />
            Configure Weights
          </Button>

          {/* Job Selection Dropdown */}
          <Select
            name="job"
            required
            className="flex w-60"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            disabled={loadingJobs || jobs.length === 0}
          >
            {loadingJobs ? (
              <option>Loading Jobs...</option>
            ) : jobs.length === 0 ? (
              <option>No Jobs Available</option>
            ) : (
              <>
                <option value="">Select a Job</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.jobTitle}
                  </option>
                ))}
              </>
            )}
          </Select>
        </div>
      </div>

      {/* Information Modal */}
      <Modal show={openInfoModal} onClose={() => setOpenInfoModal(false)}>
        <Modal.Header>How Resume Matching Works</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Matching Algorithm</h3>
              <p className="text-sm text-gray-600">
                Our system evaluates resumes based on four key factors, each
                with adjustable weights:
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">
                  1. Experience (Current:{" "}
                  {(weights.experience_score * 100).toFixed(0)}%)
                </h4>
                <p className="text-sm text-gray-600">
                  Compares the candidate's years of experience with the job
                  requirements. Candidates with equal or more experience get
                  full points.
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">
                  2. Skills (Current: {(weights.skills_score * 100).toFixed(0)}
                  %)
                </h4>
                <p className="text-sm text-gray-600">
                  Calculates the percentage of required skills that the
                  candidate possesses. Exact matches are required for this
                  comparison.
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">
                  3. Profession/Title (Current:{" "}
                  {(weights.profession_score * 100).toFixed(0)}%)
                </h4>
                <p className="text-sm text-gray-600">
                  Uses AI to assess similarity between the candidate's
                  profession and the job title. Understands related roles and
                  synonyms.
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">
                  4. Summary/Content (Current:{" "}
                  {(weights.summary_score * 100).toFixed(0)}%)
                </h4>
                <p className="text-sm text-gray-600">
                  Analyzes the semantic similarity between the candidate's full
                  profile and the job description using advanced natural
                  language processing (NLP).
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium">
                The overall match percentage is calculated by combining these
                scores according to their weights.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end">
          <Button onClick={() => setOpenInfoModal(false)}>Got It</Button>
        </Modal.Footer>
      </Modal>

      {/* Weight Configuration Modal */}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Configure Matching Weights</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Adjust the importance of each matching factor. The weights must
                sum to 1 (100%). Higher weights make a factor more influential
                in the overall match score.
              </p>
            </div>

            <div className="space-y-4">
              {/* Experience Weight */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="experience" value="Experience Weight" />
                  <span className="text-xs text-gray-500">
                    Current: {(weights.experience_score * 100).toFixed(0)}%
                  </span>
                </div>
                <TextInput
                  id="experience"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={weights.experience_score}
                  onChange={(e) =>
                    handleWeightChange("experience_score", e.target.value)
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  Measures how closely the candidate's years of experience match
                  the job requirements.
                </p>
              </div>

              {/* Skills Weight */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="skills" value="Skills Weight" />
                  <span className="text-xs text-gray-500">
                    Current: {(weights.skills_score * 100).toFixed(0)}%
                  </span>
                </div>
                <TextInput
                  id="skills"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={weights.skills_score}
                  onChange={(e) =>
                    handleWeightChange("skills_score", e.target.value)
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  Evaluates the percentage of required skills the candidate
                  possesses.
                </p>
              </div>

              {/* Profession Weight */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="profession" value="Profession Weight" />
                  <span className="text-xs text-gray-500">
                    Current: {(weights.profession_score * 100).toFixed(0)}%
                  </span>
                </div>
                <TextInput
                  id="profession"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={weights.profession_score}
                  onChange={(e) =>
                    handleWeightChange("profession_score", e.target.value)
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  Assesses similarity between the candidate's profession and job
                  title.
                </p>
              </div>

              {/* Summary Weight */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="summary" value="Summary Weight" />
                  <span className="text-xs text-gray-500">
                    Current: {(weights.summary_score * 100).toFixed(0)}%
                  </span>
                </div>
                <TextInput
                  id="summary"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={weights.summary_score}
                  onChange={(e) =>
                    handleWeightChange("summary_score", e.target.value)
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  Analyzes semantic similarity between the candidate's profile
                  and job description.
                </p>
              </div>

              {/* Total Weight Indicator */}
              <div className="pt-4 border-t">
                <div className="font-semibold flex items-center">
                  <span>Total Weight: </span>
                  <span
                    className={`ml-2 ${
                      totalWeight === 1 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {totalWeight.toFixed(2)} ({Math.round(totalWeight * 100)}%)
                  </span>
                </div>
                {totalWeight !== 1 && (
                  <p className="text-red-500 text-sm mt-1">
                    The weights must sum to exactly 1 (100%) for proper
                    algorithm functioning.
                    {totalWeight < 1
                      ? " Add more weight."
                      : " Reduce some weight."}
                  </p>
                )}
                {totalWeight === 1 && (
                  <p className="text-green-600 text-sm mt-1">
                    Weight distribution is valid and ready to save.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-between">
          <Button
            color="light"
            onClick={() => setOpenModal(false)}
            className="border border-gray-300"
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              color="gray"
              onClick={resetToDefaults}
              disabled={
                JSON.stringify(weights) === JSON.stringify(defaultWeights)
              }
            >
              Reset Defaults
            </Button>
            <Button onClick={saveWeights} disabled={totalWeight !== 1}>
              Save Configuration
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Resume Table */}
      <div className="overflow-x-auto">
        <Table hoverable className="w-full text-gray-900 dark:text-gray-300">
          <Table.Head>
            <Table.HeadCell className="py-3 px-4">Name</Table.HeadCell>
            <Table.HeadCell className="py-3 px-4">Email</Table.HeadCell>
            <Table.HeadCell className="py-3 px-4 text-center">
              Experience
            </Table.HeadCell>
            <Table.HeadCell className="py-3 px-4 text-center">
              Match Score
            </Table.HeadCell>
            <Table.HeadCell className="py-3 px-4 text-center">
              Profession
            </Table.HeadCell>
            <Table.HeadCell className="py-3 px-4 text-center">
              CV
            </Table.HeadCell>
            <Table.HeadCell className="py-3 px-4 text-center">
              Status
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {loading ? (
              <Table.Row>
                <Table.Cell colSpan="7" className="py-8 text-center">
                  <Loading />
                  <p className="mt-2 text-gray-600">Analyzing resumes...</p>
                </Table.Cell>
              </Table.Row>
            ) : resumes.length > 0 ? (
              resumes.map((candidate, index) => (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {candidate.resume_name}
                  </Table.Cell>
                  <Table.Cell className="py-3 px-4">
                    {candidate.email || "N/A"}
                  </Table.Cell>
                  <Table.Cell className="py-3 px-4 text-center">
                    {candidate.totalExperienceYears || "0"} yrs
                  </Table.Cell>
                  <Table.Cell className="py-3 px-4 text-center">
                    <Tooltip
                      content={
                        <div className="text-sm flex flex-col gap-2 p-2">
                          <div className="flex justify-between">
                            <span>Experience:</span>
                            <span>{candidate.experience_score}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Skills:</span>
                            <span>{candidate.skills_score}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Profession:</span>
                            <span>{candidate.profession_score}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Summary:</span>
                            <span>{candidate.summary_score}%</span>
                          </div>
                        </div>
                      }
                    >
                      <Badge
                        color={
                          candidate.overall_match_percentage >= 80
                            ? "success"
                            : candidate.overall_match_percentage >= 60
                            ? "warning"
                            : "failure"
                        }
                        className="w-20 justify-center"
                      >
                        {candidate.overall_match_percentage.toFixed(1)}%
                      </Badge>
                    </Tooltip>
                  </Table.Cell>
                  <Table.Cell className="py-3 px-4 text-center">
                    {candidate.profession || "N/A"}
                  </Table.Cell>
                  <Table.Cell className="py-3 px-4 text-center">
                    {candidate.fileUrl ? (
                      <FileCheck
                        className="cursor-pointer text-blue-500 hover:text-blue-700 mx-auto"
                        size={20}
                        onClick={() => window.open(candidate.fileUrl, "_blank")}
                      />
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </Table.Cell>
                  <Table.Cell className="py-3 px-4 text-center">
                    {candidate.application_status === "Not Applied" ? (
                      <Select
                        value={candidate.application_status}
                        onChange={(e) =>
                          handleStatusChange(
                            candidate.resume_id,
                            e.target.value,
                            candidate.user_id
                          )
                        }
                        className="w-32 mx-auto"
                      >
                        <option value="Not Applied">Not Applied</option>
                        <option value="Recommended">Recommend</option>
                      </Select>
                    ) : (
                      <Badge
                        color={
                          candidate.application_status === "Recommended"
                            ? "blue"
                            : candidate.application_status === "Applied"
                            ? "purple"
                            : candidate.application_status === "Shortlisted"
                            ? "yellow"
                            : candidate.application_status === "Interview"
                            ? "orange"
                            : candidate.application_status === "Offer"
                            ? "green"
                            : candidate.application_status === "Rejected"
                            ? "red"
                            : "gray"
                        }
                        className="w-full py-3 justify-center"
                      >
                        {candidate.application_status}
                      </Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan="7"
                  className="py-8 text-center text-gray-500"
                >
                  {selectedJob
                    ? "No matching resumes found for this job."
                    : "Please select a job to analyze resumes."}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default ResumeAnalyse;
