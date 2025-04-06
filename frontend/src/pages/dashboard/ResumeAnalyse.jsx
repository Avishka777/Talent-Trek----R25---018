import { FileCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Table, Select, Tooltip } from "flowbite-react";
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
  const { token } = useSelector((state) => state.auth);

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
      const response = await resumeService.getMatchingResumes(jobId, token);
      // Expecting the response object to have a "matches" field
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
                          0.20 Weight
                        </div>
                        <div>
                          <strong>Qualifications:</strong>{" "}
                          {candidate.qualifications_score}% * 0.15 Weight
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
