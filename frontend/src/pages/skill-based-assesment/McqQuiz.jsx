import { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import assessmentService from "../../services/assessmentService";
import Swal from "sweetalert2";

const McqQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);
  const { assessmentId, questionSetId } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeTakenSeconds, setTimeTaken] = useState(0);
  // const [showReview, setShowReview] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTaken((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Validate IDs
  useEffect(() => {
    if (!assessmentId || !questionSetId) {
      navigate("/dashboard");
    }
  }, [assessmentId, questionSetId, navigate]);

  // Load MCQ questions
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const response = await assessmentService.getMCQQuestions(
          assessmentId,
          questionSetId,
          token
        );
        console.log("MCQ API response:", response.data);
        const fetchedQuestions = response.data?.questions || [];
        setQuestions(fetchedQuestions);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId && questionSetId) loadQuestions();
  }, [assessmentId, questionSetId, token, navigate]);

  // Handle selecting an answer
  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // Handle Next / Submit button
  const handleNext = async () => {
    const currentQuestion = questions[currentIndex];
    // ✅ Prevent skipping without answering
    if (!answers[currentQuestion._id]) {
      Swal.fire({
        icon: "warning",
        title: "No Answer Selected",
        text: "Please select an answer before proceeding!",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      try {
        const totalQuestions = questions.length;
        let correctAnswers = 0;

        questions.forEach((q) => {
          const selected = answers[q._id];
          const correctOption = q.options[q.correctAnswerIndex];
          if (selected === correctOption) correctAnswers++;
        });
        const formattedAnswers = Object.entries(answers).map(([questionId, userAnswer]) => ({
          questionId,
          userAnswer,
        }));
        await assessmentService.submitMCQResult(
          assessmentId,
          questionSetId,
          formattedAnswers,
          timeTakenSeconds,
          token
        );

        navigate(`/skill-bases-assessment/${assessmentId}/mcq-review`, {
          state: {
            assessmentId,
            total: totalQuestions,
            correct: correctAnswers,
            wrong: totalQuestions - correctAnswers,
            wrongQuestions: questions.filter(
              (q) => answers[q._id] !== q.options[q.correctAnswerIndex]
            ),
            questions,
            answers,
          },
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to submit MCQ results.");
      }
    }
  };


  if (loading) return <p>Loading questions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!questions.length) return null;

  // QUIZ MODE
  const currentQuestion = questions[currentIndex];

  return (
    <Card className="w-full max-w-3xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 rounded-lg my-10 mx-auto space-y-4">
      <div className="max-w-xl mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">
          Question {currentIndex + 1} of {questions.length}
        </h2>
        <p className="mb-4">{currentQuestion.questionText}</p>
        <div className="space-y-2">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(currentQuestion._id, opt)}
              className={`w-full p-2 border rounded ${answers[currentQuestion._id] === opt
                ? "bg-blue-500 text-white"
                : "bg-white"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Time elapsed: {Math.floor(timeTakenSeconds / 60)}:
          {(timeTakenSeconds % 60).toString().padStart(2, "0")}
        </p>
        <button
          onClick={handleNext}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
        >
          {currentIndex + 1 < questions.length ? "Next" : "Submit"}
        </button>
      </div>
    </Card>
  );
};

export default McqQuiz;
