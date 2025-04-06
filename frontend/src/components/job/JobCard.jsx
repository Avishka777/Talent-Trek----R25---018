/* eslint-disable react/prop-types */
import { Card, Tooltip } from "flowbite-react";
import { CalendarDays, Smile, SmilePlus } from "lucide-react";
import { CircleDollarSign } from "lucide-react";
import { BriefcaseBusiness } from "lucide-react";

export default function JobCard({ job }) {
  // Use the nested job details if available
  const jobDetails = job.job || {};
  // Fallback for job title and company name if not provided at the top level
  const title = job.jobTitle || jobDetails.jobTitle || "Untitled Job";
  const companyName =
    job.companyName ||
    (jobDetails.company ? jobDetails.company.companyName : "Unknown Company");
  const overallMatch = job.overall_match_percentage || 0;

  // Format createdAt date from nested job details
  let formattedDate = "N/A";
  if (jobDetails.createdAt) {
    const date = new Date(jobDetails.createdAt);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toISOString().split("T")[0];
    }
  }

  return (
    <Card className="w-full min-w-full shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg flex space-x-4 hover:shadow-xl transition-shadow">
      <div className="flex items-center space-x-4 w-full">
        <div className="flex justify-center w-40 bg-white rounded-lg shadow-2xl">
          <img
            src={jobDetails.company ? jobDetails.company.logo : ""}
            alt={companyName}
            className="w-auto h-full rounded-lg"
          />
        </div>
        <div className="flex flex-col flex-grow w-80">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <hr className="my-1 border-gray-700 dark:border-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {companyName}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {jobDetails.skills?.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
          {/* Show matching criteria tooltip only if matching scores exist */}
          {job.overall_match_percentage && (
            <Tooltip
              content={
                <div className="flex flex-col text-xs">
                  <span>Experience: {job.experience_score}%</span>
                  <span>Skills: {job.skills_score}%</span>
                  <span>Profession: {job.profession_score}%</span>
                  <span>Summary: {job.summary_score}%</span>
                  <span>Qualifications: {job.qualifications_score}%</span>
                </div>
              }
            >
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1 cursor-help">
                {overallMatch > 50 ? (
                  <SmilePlus className="w-4 h-4 mr-1 text-green-500" />
                ) : (
                  <Smile className="w-4 h-4 mr-1 text-yellow-500" />
                )}
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Matching Percentage {overallMatch.toFixed(2)}%
                </h3>
              </div>
            </Tooltip>
          )}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <BriefcaseBusiness className="w-4 h-4 mr-1 text-blue-500" />{" "}
            {jobDetails.workExperience}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <CircleDollarSign className="w-4 h-4 mr-1 text-green-500" />{" "}
            {jobDetails.salaryRange}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <CalendarDays className="w-4 h-4 mr-1 text-yellow-500" />
            Posted {formattedDate}
          </div>
        </div>
      </div>
    </Card>
  );
}
