import React, { useEffect, useState } from 'react';
import { Search } from "lucide-react";
import { TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import JobCard from "../../components/job/JobCard";
import { fetchAllJobs } from '../../hooks/jobsService';
import { fetchSkillForecast } from '../../hooks/skillService';

export default function AgentListing() {
    const [searchTerm, setSearchTerm] = useState("");
    const [jobs, setJobs] = useState([]);
    const [topSkills, setTopSkills] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchAllJobs()
            .then(data => setJobs(data))
            .catch(err => setError('Failed to fetch jobs'));
    }, []);

    // Call API when searchTerm changes
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.trim().length > 2) {
                fetchSkillForecast(searchTerm.toLowerCase())
                    .then(data => {
                        console.log("Top skills from API:", data.top_skills);
                        setTopSkills(data.top_skills);
                    })
                    .catch(() => setTopSkills([]));
            } else {
                setTopSkills([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);


    const filteredJobs = jobs.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Explore with External Job Collections
            </h1>

            <div className="flex gap-4 mb-6 w-full max-w-3xl">
                <TextInput
                    icon={Search}
                    placeholder="Type a job role, e.g., Web Developer"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg"
                />
            </div>

            {topSkills.length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg w-full max-w-3xl mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                        Top 5 Future Skills Required for {searchTerm}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {topSkills.map(skill => (
                            <span
                                key={skill.skill}
                                className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300"
                            >
                                {skill.skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}


            <div className="flex justify-center">
                {filteredJobs.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-w-full">
                        {filteredJobs.map((job) => (
                            <div key={job._id}>
                                <Link to={`${job.link}`}>
                                    <JobCard job={job} />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-red-600 text-center mt-10 font-semibold text-xl">
                        - Sorry Currently No Jobs Found -
                    </p>
                )}
            </div>
        </div>
    );
}
