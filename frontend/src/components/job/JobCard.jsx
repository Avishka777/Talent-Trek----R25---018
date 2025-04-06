/* eslint-disable react/prop-types */
import { Card, Tooltip } from "flowbite-react";
import { CalendarDays, Smile, SmilePlus } from "lucide-react";
import { CircleDollarSign } from "lucide-react";
import { BriefcaseBusiness } from "lucide-react";

export default function JobCard({ job }) {
  const overallMatch = job.overall_match_percentage || 0;

  // Validate and format the createdAt date
  let formattedDate = "N/A";
  if (job.job.createdAt) {
    const date = new Date(job.job.createdAt);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toISOString().split("T")[0];
    }
  }

  return (
    <Card className="w-full min-w-full shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg flex space-x-4 hover:shadow-xl transition-shadow">
      <div className="flex items-center space-x-4 w-full">
        <div className="flex justify-center w-40 bg-white rounded-lg shadow-2xl">
          <img
            src={job.job.companyLogo}
            alt={job.companyName}
            className="w-auto h-full rounded-lg"
          />
        </div>
        <div className="flex flex-col flex-grow w-80">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {job.jobTitle}
          </h3>
          <hr className="my-1 border-gray-700 dark:border-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {job.companyName}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {job.job.skills?.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
          {/* Tooltip for detailed matching criteria */}
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
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <BriefcaseBusiness className="w-4 h-4 mr-1 text-blue-500" />{" "}
            {job.job.workExperience}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <CircleDollarSign className="w-4 h-4 mr-1 text-green-500" />{" "}
            {job.job.salaryRange}
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
