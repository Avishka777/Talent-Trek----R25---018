import { useState, useEffect } from "react";
import {
    Table,
    Badge,
    Button,
    TextInput,
    Card
} from "flowbite-react";
import { FaTrophy, FaMedal, FaSearch } from "react-icons/fa";
import { MdLeaderboard } from "react-icons/md";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import InterviewService from "../../services/interview";
import { useParams } from "react-router-dom";
import EvaluateCandidatePopup from "../../components/interview/EvaluateCandidatePopup";

const InterviewResult = () => {
    const { id } = useParams();
    const [interviewData, setInterviewData] = useState([]);
    const [quactionList, setQuactionList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

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

    const filteredCandidates = interviewData.filter(candidate =>
        candidate.userId.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const getInterviewResult = async () => {
            try {
                const response = await InterviewService.getInterviewResults(id);
                if (response.success) {
                    setInterviewData(response.answerData);
                    setQuactionList(response.quactionList.quactionList);
                } else {
                    console.error("Failed to fetch interview results:", response.message);
                }
            } catch (error) {
                console.error("Failed to fetch interview results:", error);
            }
        };
        
        getInterviewResult();
    }, [id]);

    return (
        <DashboardLayout>
            {/* Header and Search */}
            <div className="flex flex-col mb-6 gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <MdLeaderboard className="text-cyan-600" />
                        Interview Results
                    </h2>
                </div>
                
                <div className="w-full">
                    <TextInput
                        icon={FaSearch}
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Section - Mobile Cards */}
            {interviewData.length > 0 && (
                <>
                    <div className="md:hidden grid grid-cols-1 gap-3 mb-6">
                        <Card className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Top Performer</p>
                                    <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                                        {interviewData[0]?.userId.fullName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Score: {interviewData[0]?.avgAnswerMatch.toFixed(1)}%
                                    </p>
                                </div>
                                <FaTrophy className="text-yellow-500 text-2xl" />
                            </div>
                        </Card>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Avg Score</p>
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {(
                                        interviewData.reduce((sum, candidate) => sum + candidate.avgAnswerMatch, 0) /
                                        interviewData.length
                                    ).toFixed(1)}%
                                </p>
                            </Card>
                            
                            <Card className="p-4">
                                <p className="text-sm text-gray-500">Participants</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {interviewData.length}
                                </p>
                            </Card>
                        </div>
                    </div>

                    {/* Stats Section - Desktop */}
                    <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Top Performer</h3>
                            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                                {interviewData[0]?.userId.fullName}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                Score: {interviewData[0]?.avgAnswerMatch.toFixed(1)}%
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Average Score</h3>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                {(
                                    interviewData.reduce((sum, candidate) => sum + candidate.avgAnswerMatch, 0) /
                                    interviewData.length
                                ).toFixed(1)}%
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Participants</h3>
                            <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {interviewData.length}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Results Table - Desktop */}
            <div className="hidden md:block overflow-x-auto shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                <Table hoverable className="w-full">
                    <Table.Head className="bg-gray-50 dark:bg-gray-700">
                        <Table.HeadCell className="w-12">Rank</Table.HeadCell>
                        <Table.HeadCell>Candidate</Table.HeadCell>
                        <Table.HeadCell>Email</Table.HeadCell>
                        <Table.HeadCell className="text-center">Score</Table.HeadCell>
                        <Table.HeadCell className="text-center">Confidence</Table.HeadCell>
                        <Table.HeadCell className="text-center">Details</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredCandidates.length > 0 ? (
                            filteredCandidates.map((item, index) => (
                                <Table.Row key={item._id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <Table.Cell className="font-medium text-center">
                                        {getRankBadge(index)}
                                    </Table.Cell>
                                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                                        {item.userId.fullName}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <a
                                            href={`mailto:${item.userId.email}`}
                                            className="text-cyan-600 hover:underline dark:text-cyan-400"
                                        >
                                            {item.userId.email}
                                        </a>
                                    </Table.Cell>
                                    <Table.Cell className="text-center">
                                        <Badge
                                            color={getBadgeColor(item.avgAnswerMatch)}
                                            className="w-16 justify-center font-bold"
                                        >
                                            {Number(item.avgAnswerMatch).toFixed(2)}%
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell className="text-center">
                                        <Badge
                                            color={getBadgeColor(item.avgConfidence)}
                                            className="w-16 justify-center"
                                        >
                                            {Number(item.avgConfidence).toFixed(2)}%
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell className="text-center">
                                        <Button
                                            size="xs"
                                            color="light"
                                            onClick={() => {
                                                setSelectedCandidate(item);
                                                setShowDetailsModal(true);
                                            }}
                                        >
                                            View
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No candidates found
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
                {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((item, index) => (
                        <Card key={item._id} className="hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="text-gray-600 font-medium">
                                        {getRankBadge(index)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            {item.userId.fullName}
                                        </h3>
                                        <a
                                            href={`mailto:${item.userId.email}`}
                                            className="text-sm text-cyan-600 hover:underline dark:text-cyan-400"
                                        >
                                            {item.userId.email}
                                        </a>
                                    </div>
                                </div>
                                <Button
                                    size="xs"
                                    color="light"
                                    onClick={() => {
                                        setSelectedCandidate(item);
                                        setShowDetailsModal(true);
                                    }}
                                >
                                    View
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                    <p className="text-xs text-gray-500">Score</p>
                                    <Badge
                                        color={getBadgeColor(item.avgAnswerMatch)}
                                        className="w-full justify-center font-bold py-1"
                                    >
                                        {Number(item.avgAnswerMatch).toFixed(2)}%
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Confidence</p>
                                    <Badge
                                        color={getBadgeColor(item.avgConfidence)}
                                        className="w-full justify-center py-1"
                                    >
                                        {Number(item.avgConfidence).toFixed(2)}%
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No candidates found
                    </Card>
                )}
            </div>

            {selectedCandidate && (
                <EvaluateCandidatePopup
                    data={selectedCandidate}
                    quactionList={quactionList}
                    showModal={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}
        </DashboardLayout>
    );
};

export default InterviewResult;