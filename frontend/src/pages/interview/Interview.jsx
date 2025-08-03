import React, { useEffect, useRef, useState } from "react";
import InterviewService from "../../services/interview";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Play, Square, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const Interview = () => {
    const { id } = useParams();
    const [questionsArray, setQuestionsArray] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const videoRef = useRef();

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
        setRecordedChunks([]);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 1280, height: 720 }, 
                audio: true 
            });
            videoRef.current.srcObject = stream;

            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setRecordedChunks((prev) => [...prev, event.data]);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(recordedChunks, { type: "video/webm" });
                await uploadVideo(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(1000);
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (error) {
            Swal.fire({
                title: "Permission Denied",
                text: "Please allow camera and microphone access to continue with the interview.",
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
        const formData = new FormData();
        formData.append("video", blob, "interview.webm");
        formData.append("jobId", id);

        try {
            const response = await InterviewService.uploadInterviewVideo(formData);
            if (response.success) {
                Swal.fire({
                    title: "Success!", 
                    text: "Your interview video has been submitted successfully.",
                    icon: "success",
                    confirmButtonText: "Great!"
                });
            } else {
                Swal.fire("Upload Failed", response.message || "Error uploading video", "error");
            }
        } catch (error) {
            Swal.fire("Error", error.message || "Upload error", "error");
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questionsArray.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    return (
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
                                    {questionsArray[currentQuestionIndex]?.quaction || "No question available"}
                                </h3>
                            </div>

                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={prevQuestion}
                                    disabled={currentQuestionIndex === 0}
                                    className={`px-4 py-2 rounded-lg flex items-center ${currentQuestionIndex === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                                >
                                    <ChevronLeft className="h-5 w-5 mr-1" />
                                    Previous
                                </button>
                                <button
                                    onClick={nextQuestion}
                                    disabled={currentQuestionIndex === questionsArray.length - 1}
                                    className={`px-4 py-2 rounded-lg flex items-center ${currentQuestionIndex === questionsArray.length - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                                >
                                    Next
                                    <ChevronRight className="h-5 w-5 ml-1" />
                                </button>
                            </div>

                            <div className="mt-6">
                                <h4 className="font-medium text-gray-700 mb-2">All Questions:</h4>
                                <ul className="space-y-2">
                                    {questionsArray.map((q, index) => (
                                        <li 
                                            key={q.quactionNo} 
                                            className={`p-2 rounded cursor-pointer ${currentQuestionIndex === index ? 'bg-indigo-100 text-indigo-700 font-medium' : 'hover:bg-gray-100'}`}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                        >
                                            {index + 1}. {q.quaction}
                                        </li>
                                    ))}
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
                                            Start Recording
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
    );
};

export default Interview;