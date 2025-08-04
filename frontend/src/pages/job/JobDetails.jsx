import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "flowbite-react";
import { Briefcase, DollarSign, Clock } from "lucide-react";
import { CalendarDays, SmilePlus, Smile } from "lucide-react";
import Loading from "../../components/public/Loading";
import jobService from "../../services/jobService";

const JobDetails = () => {
  const navigate = useNavigate();
  const { jobId, matchPercentage } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const matchPercentageValue = parseFloat(matchPercentage) || 0;

  // Fetch Job Details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await jobService.getJobById(jobId);
        if (response.success) {
          setJob(response.job);
        } else {
          setJob(null);
        }
      } catch (error) {
        setJob(null);
      }
      setLoading(false);
    };

    fetchJobDetails();
  }, [jobId]);

   // navigate to the assessment notice Section
  const handleNavigation = () => {
      navigate("/skill-bases-assessment/assessment-intro");
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

  return (
    <Card className="w-full max-w-3xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 rounded-lg my-10 mx-auto">
      {/* Header */}
      <div className="flex justify-between space-x-4 mb-4">
        <div className="flex items-center gap-5 ">
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
          <Button gradientMonochrome="info" size="lg"  onClick={handleNavigation}>
            Apply Now
          </Button>
        </div>
      </div>

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
