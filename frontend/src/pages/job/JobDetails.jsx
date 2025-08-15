import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "flowbite-react";
import { Briefcase, DollarSign, Clock } from "lucide-react";
import { CalendarDays, SmilePlus, Smile } from "lucide-react";
import Loading from "../../components/public/Loading";
import jobService from "../../services/jobService";
import Swal from "sweetalert2";
import appliedJobService from "../../services/appliedJobService";
import { useSelector } from "react-redux";

const JobDetails = () => {
  const navigate = useNavigate();
  const { jobId, matchPercentage } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState("Not Applied");
  const [isApplying, setIsApplying] = useState(false);
  const matchPercentageValue = parseFloat(matchPercentage) || 0;

  // Fetch Job Details and Application Status
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await jobService.getJobById(jobId);
        if (jobResponse.success) {
          setJob(jobResponse.job);

          // Fetch application status if user is authenticated
          if (token) {
            const statusResponse = await appliedJobService.getApplicationStatus(
              jobId,
              token
            );
            setApplicationStatus(statusResponse.status);
          }
        } else {
          setJob(null);
        }
      } catch (error) {
        setJob(null);
      }
      setLoading(false);
    };

    fetchData();
  }, [jobId, token]);

  const handleApply = async () => {
    if (!token) {
      navigate("/login", { state: { from: `/jobs/${jobId}` } });
      return;
    }

    navigate(`/skill-bases-assessment/assessment-intro/${jobId}/`, { state: { job } });

    try {
      setIsApplying(true);
      const response = await appliedJobService.applyForJob(jobId, token);

      if (response.success) {
        setApplicationStatus("Applied");
        Swal.fire({
          title: "Application Submitted!",
          text: "Your job application has been successfully submitted.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          html: `
          <p>${response.message}</p>
          ${response.deadline
              ? `<p><strong>Deadline:</strong> ${new Date(
                response.deadline
              ).toLocaleDateString()}</p>`
              : ""
            }
        `,
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Sorry, Application Paased",
        text: error.message || "Something went wrong while applying.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsApplying(false);
    }
  };


  // Handle Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loading />
        <p className="text-gray-600 text-center mt-10 font-semibold text-xl">
          Loading job details...
        </p>
      </div>
    );
  }

  // Handle Job Not Found State
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 text-center font-semibold text-xl">
          - Job Not Found -
        </p>
      </div>
    );
  }

  // Determine button text and properties based on status
  const getButtonProps = () => {
    switch (applicationStatus) {
      case "Applied":
        return {
          text: "Applied",
          color: "success",
          disabled: true,
        };
      case "Interview":
        return {
          text: "Interview Scheduled",
          color: "purple",
          disabled: true,
        };
      case "Rejected":
        return {
          text: "Application Rejected",
          color: "failure",
          disabled: true,
        };
      case "Hired":
        return {
          text: "Hired!",
          color: "success",
          disabled: true,
        };
      case "Recommended":
      case "Not Applied":
      default:
        return {
          text: isApplying ? "Applying..." : "Apply Now",
          color: "info",
          disabled: isApplying,
          onClick: handleApply,
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <Card className="w-full max-w-3xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 rounded-lg my-10 mx-auto">
      {/* Header */}
      <div className="flex justify-between space-x-4 mb-4">
        <div className="flex items-center gap-5">
          <img
            src={job.company.logo}
            alt={job.companyName}
            className="w-24 h-24 rounded-lg shadow-2xl"
          />
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {job.jobTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {job.company.companyName} | {job.company.location}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {job.company.phone}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            gradientMonochrome={buttonProps.color}
            size="lg"
            disabled={buttonProps.disabled}
            onClick={buttonProps.onClick}
          >
            {buttonProps.text}
          </Button>
        </div>
      </div>

      {/* Show application status */}
      {applicationStatus !== "Not Applied" && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
          <p className="font-semibold">
            Your application status: {applicationStatus}
          </p>
        </div>
      )}

      {/* Job Details */}
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        {/* Show Match Percentage only if it's greater than 0 */}
        {matchPercentageValue > 0 && (
          <div className="flex items-center">
            {matchPercentageValue > 50 ? (
              <SmilePlus className="w-5 h-5 mr-2 text-green-500" />
            ) : (
              <Smile className="w-5 h-5 mr-2 text-yellow-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Job Matching Percentage: {matchPercentageValue}%
            </h3>
          </div>
        )}

        <p className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-500" />{" "}
          {job.salaryRange}
        </p>
        <p className="flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-purple-500" />{" "}
          {job.employmentType}
        </p>
        <p className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-yellow-500" /> Posted:{" "}
          {new Date(job.createdAt).toISOString().split("T")[0]}
        </p>
        <p className="flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-red-500" /> Deadline:{" "}
          {new Date(job.applicationDeadline).toISOString().split("T")[0]}
        </p>
      </div>

      {/* Description */}
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        {job.jobDescription}
      </p>

      {/* Required Skills */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Required Skills
        </h4>
        <ul className="flex flex-wrap mt-2 gap-2">
          {job.skills.slice().map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm dark:bg-blue-900 dark:text-blue-300"
            >
              {skill}
            </span>
          ))}
        </ul>
      </div>

      {/* Work Experience */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Work Experience
        </h4>
        <p className="text-gray-600 dark:text-gray-400">{job.workExperience}</p>
      </div>

      {/* Qualifications */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Qualifications
        </h4>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
          {job.qualifications.map((qualification, index) => (
            <li key={index}>{qualification}</li>
          ))}
        </ul>
      </div>

      {/* Job Responsibilities */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Job Responsibilities
        </h4>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
          {job.jobResponsibilities.map((responsibility, index) => (
            <li key={index}>{responsibility}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default JobDetails;
