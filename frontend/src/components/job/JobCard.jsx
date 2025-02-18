/* eslint-disable react/prop-types */
import { Card } from "flowbite-react";
import { CalendarDays, Smile, SmilePlus } from "lucide-react";
import { CircleDollarSign } from "lucide-react";
import { BriefcaseBusiness } from "lucide-react";

export default function JobCard({ job }) {
  return (
    <Card className="w-full min-w-full shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg flex space-x-4 hover:shadow-xl transition-shadow">
      <div className="flex items-center space-x-4 w-full">
        <div className="flex justify-center w-40 bg-white rounded-lg shadow-2xl">
          <img
            src={job.companyLogo}
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
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            {job.match_percentage !== undefined && (
              <>
                {job.match_percentage > 50 ? (
                  <SmilePlus className="w-4 h-4 mr-1 text-green-500" />
                ) : (
                  <Smile className="w-4 h-4 mr-1 text-yellow-500" />
                )}
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Matching Percentage {job.match_percentage.toFixed(2)}%
                </h3>
              </>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <BriefcaseBusiness className="w-4 h-4 mr-1 text-blue-500" />{" "}
            {job.workExperience}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <CircleDollarSign className="w-4 h-4 mr-1 text-green-500" />{" "}
            {job.salaryRange}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <CalendarDays className="w-4 h-4 mr-1 text-yellow-500" />
            Posted {new Date(job.createdAt).toISOString().split("T")[0]}
          </div>
        </div>
      </div>
    </Card>
  );
}
