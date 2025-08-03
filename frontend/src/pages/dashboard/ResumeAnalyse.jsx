import { FileCheck, Settings } from "lucide-react";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Table, Select, Tooltip, Button, Modal, Label, TextInput } from "flowbite-react";
import Swal from "sweetalert2";
import Loading from "../../components/public/Loading";
import jobService from "../../services/jobService";
import resumeService from "../../services/resumeService";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const ResumeAnalyse = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [resumes, setResumes] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [weights, setWeights] = useState({
    experience_score: 0.45,
    skills_score: 0.05,
    profession_score: 0.15,
    summary_score: 0.35
  });
  const [totalWeight, setTotalWeight] = useState(1);
  const { token } = useSelector((state) => state.auth);

  // Load weights from localStorage on component mount
  useEffect(() => {
    const savedWeights = localStorage.getItem("resumeMatchingWeights");
    if (savedWeights) {
      setWeights(JSON.parse(savedWeights));
    }
  }, []);

  // Calculate total weight whenever weights change
  useEffect(() => {
    const total = Object.values(weights).reduce((sum, val) => sum + parseFloat(val || 0), 0);
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
      const response = await resumeService.getMatchingResumes(jobId, token, weights);
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
      setWeights(prev => ({
        ...prev,
        [key]: numValue
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
  };

  if (loading) {
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
      <div className="flex mb-4 justify-between">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Resume Analyse
        </h2>
        
        <div className="flex gap-4">
          {/* Weight Configuration Button */}
          <Button onClick={() => setOpenModal(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Weights
          </Button>
          
          {/* Job Selection Dropdown */}
          <Select
            name="job"
            required
            className="flex w-96"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            disabled={loadingJobs}
          >
            {loadingJobs ? (
              <option>Loading Jobs...</option>
            ) : (
              <>
                <option value="">Select Relevant Job</option>
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

      {/* Weight Configuration Modal */}
      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Configure Matching Weights</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="experience" value="Experience Weight" />
              <TextInput
                id="experience"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={weights.experience_score}
                onChange={(e) => handleWeightChange("experience_score", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="skills" value="Skills Weight" />
              <TextInput
                id="skills"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={weights.skills_score}
                onChange={(e) => handleWeightChange("skills_score", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="profession" value="Profession Weight" />
              <TextInput
                id="profession"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={weights.profession_score}
                onChange={(e) => handleWeightChange("profession_score", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="summary" value="Summary Weight" />
              <TextInput
                id="summary"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={weights.summary_score}
                onChange={(e) => handleWeightChange("summary_score", e.target.value)}
              />
            </div>
            <div className="font-semibold">
              Total: {totalWeight.toFixed(2)} ({Math.round(totalWeight * 100)}%)
              {totalWeight !== 1 && (
                <span className="text-red-500 ml-2">Must equal 1 (100%)</span>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={saveWeights}>Save Configuration</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Resume Table */}
      <Table hoverable className="w-full text-gray-900 dark:text-gray-300">
        <Table.Head>
          <Table.HeadCell className="py-3 px-4 text-left">Name</Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-left">Email</Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Experience (Years)
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Overall Matching
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Profession
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            View CV
          </Table.HeadCell>
          <Table.HeadCell className="py-3 px-4 text-center">
            Status
          </Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {resumes.length > 0 ? (
            resumes.map((candidate, index) => (
              <Table.Row key={index}>
                <Table.Cell className="py-3 px-4">
                  {candidate.resume_name}
                </Table.Cell>
                <Table.Cell className="py-3 px-4">
                  {candidate.email || "N/A"}
                </Table.Cell>
                <Table.Cell className="py-3 px-4 text-center">
                  {candidate.totalExperienceYears || "0"}
                </Table.Cell>
                <Table.Cell className="py-3 px-4 text-center">
                  <Tooltip
                    content={
                      <div className="text-sm flex flex-col text-left gap-5">
                        <div>
                          <strong>Experience:</strong>{" "}
                          {candidate.experience_score}% * 0.25 Weight
                        </div>
                        <div>
                          <strong>Skills:</strong> {candidate.skills_score}% *
                          0.25 Weight
                        </div>
                        <div>
                          <strong>Profession:</strong>{" "}
                          {candidate.profession_score}% * 0.15 Weight
                        </div>
                        <div>
                          <strong>Summary:</strong> {candidate.summary_score}% *
                          0.35 Weight
                        </div>
                      </div>
                    }
                  >
                    <span>
                      {candidate.overall_match_percentage.toFixed(2)}%
                    </span>
                  </Tooltip>
                </Table.Cell>
                <Table.Cell className="py-3 px-4 text-center">
                  {candidate.profession || "N/A"}
                </Table.Cell>
                <Table.Cell className="flex justify-center">
                  <FileCheck
                    className="cursor-pointer text-blue-500 hover:text-blue-700"
                    size={25}
                    onClick={() => window.open(candidate.fileUrl, "_blank")}
                  />
                </Table.Cell>
                <Table.Cell className="py-3 px-4 text-center">
                  <Select>
                    <option value="Recommended">Recommended</option>
                    <option value="Applied">Applied</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Select>
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan="7"
                className="py-4 text-center text-gray-500"
              >
                No Matching Resumes Found.
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </DashboardLayout>
  );
};

export default ResumeAnalyse;