/* eslint-disable react/prop-types */
import { Card } from "flowbite-react";
import { CalendarDays, CircleDollarSign } from "lucide-react";
import { BriefcaseBusiness, MapPin } from "lucide-react";

const AppliedJobCard = ({ job, onClick }) => {
  // Handle nested job data structure from applications
  const jobData = job.job || job;
  const company = jobData.company || {};

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  };

  return (
    <Card
      className="w-full shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={onClick}
    >
      {/* Status badge - moved to parent component */}

      <div className="flex flex-col gap-4">
        {/* Job Header */}
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0 w-14 h-14 bg-white rounded-lg flex items-center justify-center p-1 border border-gray-200 dark:border-gray-600">
            <img
              src={company.logo || "/default-company.png"}
              alt={company.companyName}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.target.src = "/default-company.png";
              }}
            />
          </div>

          {/* Job Title and Company */}
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
              {jobData.jobTitle || "No Title"}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {company.companyName || "Unknown Company"}
            </p>
            {jobData.location && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{jobData.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {jobData.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {jobData.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center">
            <BriefcaseBusiness className="w-4 h-4 mr-2 text-blue-500" />
            <span className="line-clamp-1">
              {jobData.employmentType || "Not specified"}
            </span>
          </div>
          <div className="flex items-center">
            <CircleDollarSign className="w-4 h-4 mr-2 text-green-500" />
            <span className="line-clamp-1">
              {jobData.salaryRange || "Salary not specified"}
            </span>
          </div>
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="line-clamp-1">
              Applied: {formatDate(job.appliedDate || job.createdAt)}
            </span>
          </div>
          {jobData.applicationDeadline && (
            <div className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-2 text-red-500" />
              <span className="line-clamp-1">
                Deadline: {formatDate(jobData.applicationDeadline)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AppliedJobCard;
