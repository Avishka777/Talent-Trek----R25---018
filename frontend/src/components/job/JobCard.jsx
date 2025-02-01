/* eslint-disable react/prop-types */
import { Card } from "flowbite-react";
import { MapPin, Clock } from "lucide-react";

export default function JobCard({ job }) {
  return (
    <Card className="w-full min-w-full shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-lg flex space-x-4 hover:shadow-xl transition-shadow">
      <div className="flex items-center space-x-4 w-full">
        <div className="flex justify-center w-24 bg-white h-24 p-2">
          <img
            src={job.companyLogo}
            alt={job.companyName}
            className="w-auto h-auto"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {job.jobTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {job.companyName}
          </p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <MapPin className="w-4 h-4 mr-1 text-blue-500" /> {job.location}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <Clock className="w-4 h-4 mr-1 text-yellow-500" />
            Posted {job.postedDate}
          </div>
        </div>
      </div>
    </Card>
  );
}
