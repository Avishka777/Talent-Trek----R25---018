import { useState, useEffect } from "react";
import {
    Table,
    Badge,
    Button,
    Modal,
    Label,
    TextInput,
    Select,
} from "flowbite-react";
import {
    FaTrophy,
    FaMedal,
    FaUserTie,
    FaChartLine,
    FaFilter,
    FaSearch
} from "react-icons/fa";
import { MdLeaderboard, MdOutlineCategory } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

const Leaderboard = () => {
    // Sample data
    const candidates = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            experienceYears: 5,
            overallScore: 92,
            technicalScore: 95,
            softSkillsScore: 88,
            assessmentDate: '2023-06-15T10:30:00Z',
            skills: [
                { name: 'JavaScript', score: 95 },
                { name: 'React', score: 93 },
                { name: 'Node.js', score: 90 }
            ]
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            experienceYears: 3,
            overallScore: 87,
            technicalScore: 85,
            softSkillsScore: 90,
            assessmentDate: '2023-06-18T14:45:00Z',
            skills: [
                { name: 'Python', score: 90 },
                { name: 'Django', score: 88 },
                { name: 'SQL', score: 85 }
            ]
        },
        {
            id: '3',
            name: 'Alex Johnson',
            email: 'alex.johnson@example.com',
            experienceYears: 7,
            overallScore: 95,
            technicalScore: 97,
            softSkillsScore: 92,
            assessmentDate: '2023-06-20T09:15:00Z',
            skills: [
                { name: 'Java', score: 98 },
                { name: 'Spring Boot', score: 96 },
                { name: 'AWS', score: 90 }
            ]
        }
    ];

    const skills = ['JavaScript', 'React', 'Python', 'Java', 'Node.js', 'SQL'];

    // State for filters
    const [filteredCandidates, setFilteredCandidates] = useState(candidates);
    const [selectedSkill, setSelectedSkill] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [timeRange, setTimeRange] = useState("all");
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [activeTab, setActiveTab] = useState("overall");
    const [scoreRange, setScoreRange] = useState([0, 100]);
    const [experienceRange, setExperienceRange] = useState([0, 30]);

    // Apply filters
    useEffect(() => {
        let result = [...candidates];

        // Filter by skill
        if (selectedSkill !== "all") {
            result = result.filter(candidate =>
                candidate.skills.some(skill => skill.name === selectedSkill)
            );
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(candidate =>
                candidate.name.toLowerCase().includes(term) ||
                candidate.email.toLowerCase().includes(term) ||
                candidate.skills.some(skill => skill.name.toLowerCase().includes(term))
            );
        }

        // Filter by score range
        result = result.filter(candidate =>
            candidate.overallScore >= scoreRange[0] &&
            candidate.overallScore <= scoreRange[1]
        );

        // Filter by experience range
        result = result.filter(candidate =>
            candidate.experienceYears >= experienceRange[0] &&
            candidate.experienceYears <= experienceRange[1]
        );

        // Sort based on active tab
        if (activeTab === "overall") {
            result.sort((a, b) => b.overallScore - a.overallScore);
        } else if (activeTab === "technical") {
            result.sort((a, b) => b.technicalScore - a.technicalScore);
        } else if (activeTab === "soft") {
            result.sort((a, b) => b.softSkillsScore - a.softSkillsScore);
        }

        setFilteredCandidates(result);
    }, [selectedSkill, searchTerm, timeRange, scoreRange, experienceRange, activeTab]);

    const resetFilters = () => {
        setSelectedSkill("all");
        setSearchTerm("");
        setTimeRange("all");
        setScoreRange([0, 100]);
        setExperienceRange([0, 30]);
        setActiveTab("overall");
        setFilteredCandidates(candidates);
    };

    const getBadgeColor = (score) => {
        if (score >= 90) return "success";
        if (score >= 70) return "warning";
        if (score >= 50) return "purple";
        return "failure";
    };

    const getRankBadge = (index) => {
        if (index === 0) return <FaTrophy className="text-yellow-500 text-xl" />;
        if (index === 1) return <FaMedal className="text-gray-400 text-xl" />;
        if (index === 2) return <FaMedal className="text-amber-600 text-xl" />;
        return <span className="text-gray-600 font-medium">{index + 1}</span>;
    };

    return (
        <DashboardLayout>
            {/* Header and Search */}
            <div className="flex mb-6 justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <MdLeaderboard className="text-cyan-600" />
                    Candidate Leaderboard
                </h2>

                <div className="flex gap-4 items-center">
                    <TextInput
                        icon={FaSearch}
                        placeholder="Search candidates..."
                        className="w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <Button color="light" onClick={() => setOpenFilterModal(true)}>
                        <FaFilter className="mr-2" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px">
                    <li className="mr-2">
                        <button
                            onClick={() => setActiveTab("overall")}
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "overall"
                                    ? "text-cyan-600 border-cyan-600 dark:text-cyan-500 dark:border-cyan-500"
                                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaChartLine />
                                Overall
                            </div>
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            onClick={() => setActiveTab("technical")}
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "technical"
                                    ? "text-cyan-600 border-cyan-600 dark:text-cyan-500 dark:border-cyan-500"
                                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <MdOutlineCategory />
                                Technical Skills
                            </div>
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            onClick={() => setActiveTab("soft")}
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "soft"
                                    ? "text-cyan-600 border-cyan-600 dark:text-cyan-500 dark:border-cyan-500"
                                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaUserTie />
                                Soft Skills
                            </div>
                        </button>
                    </li>
                </ul>
            </div>
           
            {/* Filter Modal */}
            <Modal show={openFilterModal} onClose={() => setOpenFilterModal(false)} size="md">
                <Modal.Header>Filter Leaderboard</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="skill-filter" value="Filter by Skill" />
                            <Select
                                id="skill-filter"
                                value={selectedSkill}
                                onChange={(e) => setSelectedSkill(e.target.value)}
                            >
                                <option value="all">All Skills</option>
                                {skills.map((skill) => (
                                    <option key={skill} value={skill}>{skill}</option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="time-filter" value="Time Range" />
                            <Select
                                id="time-filter"
                                icon={IoMdTime}
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                            </Select>
                        </div>

                        <div>
                            <Label value="Score Range" />
                            <div className="flex items-center gap-4">
                                <TextInput
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={scoreRange[0]}
                                    onChange={(e) => setScoreRange([parseInt(e.target.value), scoreRange[1]])}
                                />
                                <span>to</span>
                                <TextInput
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={scoreRange[1]}
                                    onChange={(e) => setScoreRange([scoreRange[0], parseInt(e.target.value)])}
                                />
                            </div>
                        </div>

                        <div>
                            <Label value="Experience (Years)" />
                            <div className="flex items-center gap-4">
                                <TextInput
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={experienceRange[0]}
                                    onChange={(e) => setExperienceRange([parseInt(e.target.value), experienceRange[1]])}
                                />
                                <span>to</span>
                                <TextInput
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={experienceRange[1]}
                                    onChange={(e) => setExperienceRange([experienceRange[0], parseInt(e.target.value)])}
                                />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex justify-between">
                    <Button color="light" onClick={resetFilters}>
                        Reset Filters
                    </Button>
                    <Button onClick={() => setOpenFilterModal(false)}>
                        Apply Filters
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Leaderboard Table */}
            <div className="overflow-x-auto shadow-md rounded-lg">
                <Table hoverable className="w-full">
                    <Table.Head className="bg-gray-100 dark:bg-gray-700">
                        <Table.HeadCell className="w-12">Rank</Table.HeadCell>
                        <Table.HeadCell>Candidate</Table.HeadCell>
                        <Table.HeadCell>Email</Table.HeadCell>
                        <Table.HeadCell className="text-center">Experience</Table.HeadCell>
                        <Table.HeadCell className="text-center">Top Skills</Table.HeadCell>
                        <Table.HeadCell className="text-center">Overall</Table.HeadCell>
                        <Table.HeadCell className="text-center">Technical</Table.HeadCell>
                        <Table.HeadCell className="text-center">Soft Skills</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {filteredCandidates.map((candidate, index) => (
                            <Table.Row key={candidate.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                <Table.Cell className="font-medium text-center">
                                    {getRankBadge(index)}
                                </Table.Cell>
                                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                                    {candidate.name}
                                </Table.Cell>
                                <Table.Cell>
                                    <a
                                        href={`mailto:${candidate.email}`}
                                        className="text-cyan-600 hover:underline dark:text-cyan-400"
                                    >
                                        {candidate.email}
                                    </a>
                                </Table.Cell>
                                <Table.Cell className="text-center">
                                    {candidate.experienceYears} yrs
                                </Table.Cell>
                                <Table.Cell className="text-center">
                                    <div className="flex flex-wrap justify-center gap-1 max-w-xs">
                                        {candidate.skills.slice(0, 3).map((skill, i) => (
                                            <Badge
                                                key={i}
                                                color="info"
                                                size="xs"
                                                className="whitespace-nowrap"
                                            >
                                                {skill.name} ({skill.score}%)
                                            </Badge>
                                        ))}
                                    </div>
                                </Table.Cell>
                                <Table.Cell className="text-center">
                                    <Badge
                                        color={getBadgeColor(candidate.overallScore)}
                                        className="w-16 justify-center font-bold"
                                    >
                                        {candidate.overallScore}%
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell className="text-center">
                                    <Badge
                                        color={getBadgeColor(candidate.technicalScore)}
                                        className="w-16 justify-center"
                                    >
                                        {candidate.technicalScore}%
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell className="text-center">
                                    <Badge
                                        color={getBadgeColor(candidate.softSkillsScore)}
                                        className="w-16 justify-center"
                                    >
                                        {candidate.softSkillsScore}%
                                    </Badge>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </div>

            {/* Stats Section */}
            {filteredCandidates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Top Performer</h3>
                        <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                            {filteredCandidates[0]?.name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                            {filteredCandidates[0]?.overallScore}% Score
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Score</h3>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                            {(
                                filteredCandidates.reduce((sum, candidate) => sum + candidate.overallScore, 0) /
                                filteredCandidates.length
                            ).toFixed(1)}%
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Top Technical Skill</h3>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {skills[0]}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg Experience</h3>
                        <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                            {(
                                filteredCandidates.reduce((sum, candidate) => sum + candidate.experienceYears, 0) /
                                filteredCandidates.length
                            ).toFixed(1)} yrs
                        </p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Leaderboard;