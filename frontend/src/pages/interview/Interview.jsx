import React, { useEffect, useRef, useState } from "react";
import InterviewService from "../../services/interview";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Play, Square, AlertTriangle } from "lucide-react";
import NextAnswerLoader from "../../components/interview/NextAnswerLoader";
import { useSelector } from "react-redux";

const Interview = () => {
    const { id } = useParams(); // jobId
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [questionsArray, setQuestionsArray] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isStartAnswer, setIsStartAnswer] = useState(true);
    const [isLoadingNext, setIsLoadingNext] = useState(false);
    const videoRef = useRef();
    const recordedChunksRef = useRef([]);


    useEffect(() => {
        fetchQuestions();
    }, [id]);

    const fetchQuestions = async () => {
        try {
            const response = await InterviewService.getInterviewQuactions(id);
            if (response.success) {
                setQuestionsArray(response.data.quactionList);
            } else {
                setQuestionsArray([]);
            }
        } catch (error) {
            Swal.fire({
                title: "Fetching Failed",
                text: error.message || "Error Fetching Interview Questions.",
                icon: "error",
                confirmButtonColor: "red",
            });
            setQuestionsArray([]);
        }
    };

    const startRecording = async () => {
        recordedChunksRef.current = [];
        setIsStartAnswer(false);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true,
            });

            videoRef.current.srcObject = stream;

            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
                await uploadVideo(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            recorder.start(1000);
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (error) {
            Swal.fire({
                title: "Permission Denied",
                text: "Please allow camera and microphone access.",
                icon: "error",
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const uploadVideo = async (blob) => {
        const currentQ = questionsArray[currentQuestionIndex];
        const formData = new FormData();
        formData.append("video", blob, "interview.webm");
        formData.append("jobId", id);
        formData.append("quactionNo", currentQ?.quactionNo);
        formData.append("answer", currentQ?.answer);

        setIsLoadingNext(true);

        try {
            const response = await InterviewService.uploadInterviewVideo(token,formData);
            if (response.success) {
                Swal.fire({
                    title: "Uploaded!",
                    text: `Answer for Question ${currentQ.quactionNo} submitted.`,
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                });

                if (currentQuestionIndex < questionsArray.length - 1) {
                    setCurrentQuestionIndex((prev) => prev + 1);
                    setIsStartAnswer(true);
                } else {
                    Swal.fire({
                        title: "Interview Complete!",
                        text: "You've finished answering all questions.",
                        icon: "success",
                        confirmButtonText: "Go to Home",
                    }).then(() => navigate("/"));
                }
            } else {
                Swal.fire("Upload Failed", response.message || "Error uploading video", "error");
            }
        } catch (error) {
            Swal.fire("Upload Error", error.message || "An error occurred during upload", "error");
        } finally {
            setIsLoadingNext(false);
        }
    };

    const currentQuestion = questionsArray[currentQuestionIndex];

    return (
        <>
            {isLoadingNext && <NextAnswerLoader />}

            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Virtual Interview</h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Answer the questions to complete your interview
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="md:flex">
                            {/* Questions Panel */}
                            <div className="md:w-1/3 bg-indigo-50 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-indigo-800">Interview Questions</h2>
                                    <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                                        {currentQuestionIndex + 1} / {questionsArray.length}
                                    </span>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {currentQuestion?.quaction || "No question available"}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        <strong>Answer:</strong> {currentQuestion?.answer || "No answer provided"}
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <h4 className="font-medium text-gray-700 mb-2">All Questions:</h4>
                                    <ul className="space-y-2">
                                        {questionsArray.map((q, index) => {
                                            if (index <= currentQuestionIndex) {
                                                return (
                                                    <li
                                                        key={q.quactionNo}
                                                        className={`p-2 rounded ${currentQuestionIndex === index
                                                            ? "bg-indigo-100 text-indigo-700 font-medium"
                                                            : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {index + 1}. {q.quaction}
                                                    </li>
                                                );
                                            }
                                            return null;
                                        })}
                                    </ul>
                                </div>
                            </div>

                            {/* Video Panel */}
                            <div className="md:w-2/3 p-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative w-full max-w-2xl mb-4">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            className="w-full bg-gray-800 rounded-lg aspect-video"
                                        />
                                        {isRecording && (
                                            <div className="absolute top-4 right-4 flex items-center bg-red-600 text-white px-2 py-1 rounded-lg">
                                                <span className="animate-pulse h-3 w-3 rounded-full bg-white mr-2"></span>
                                                Recording
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center space-y-4 w-full max-w-md">
                                        {!isRecording ? (
                                            <button
                                                onClick={startRecording}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                                            >
                                                <Play className="h-5 w-5 mr-2" />
                                                {isStartAnswer ? "Start Answering" : "Next Question"}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={stopRecording}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                                            >
                                                <Square className="h-5 w-5 mr-2" />
                                                Stop & Submit
                                            </button>
                                        )}

                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 w-full">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-yellow-700">
                                                        Make sure you're in a well-lit area and speak clearly when answering the questions.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Interview;
