import { Card } from "flowbite-react";
import { MapPin, Clock } from "lucide-react";
import logo from '../../assets/img/jlogo.png'

export default function SkillJobCard({ job }) {
    return (
        <Card className="w-full min-w-full shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-lg flex space-x-4 hover:shadow-xl transition-shadow">
            <div className="flex space-x-4 items-center w-full">
                <div className="flex justify-center w-40 bg-white h-36">
                    <img
                        src={job.image}
                        alt={job._id}
                        className="w-auto h-auto shadow-2xl"
                    />
                </div>
                <div className="flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.title}
                    </h3>
                    {/* <p className="text-gray-600 dark:text-gray-400 text-sm">
            {job.title}
          </p> */}
                    {/* <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
            <MapPin className="w-4 h-4 mr-1 text-blue-500" /> {job.date}
          </div> */}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-300 mt-1">
                        <Clock className="w-4 h-4 mr-1 text-yellow-500" />
                        Posted {job.date}
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end justify-end">
                <div className="flex flex-row items-center gap-2">
                    <div>
                        <p className="text-slate-500 uppercase text-xs">abstract from</p>
                    </div>
                    <div>
                        <img src={logo} className="w-24 mt-1" alt="" />
                    </div>
                </div>
            </div>
        </Card>
    )
}
