from fastapi import APIRouter
from typing import List, Dict, Optional
from pydantic import BaseModel
from enum import Enum
import random

# ----------------------
# Enums and Constants
# ----------------------
class JobLevel(str, Enum):
    INTERN = "Intern"
    ASSOCIATE = "Associate"
    JUNIOR = "Junior"
    SENIOR = "Senior"

class Difficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

# Predefined question templates for common IT skills
QUESTION_TEMPLATES = {
    "python": {
        "Easy": [
            {
                "template": "What is the output of 'print(3 * 'a')' in Python?",
                "options": ["aaa", "3a", "a a a", "Error"],
                "answer": "aaa",
                "explanation": "In Python, multiplying a string by an integer repeats the string."
            },
            {
                "template": "Which keyword is used to define a function in Python?",
                "options": ["def", "function", "func", "define"],
                "answer": "def",
                "explanation": "The 'def' keyword is used to define functions in Python."
            }
        ],
        "Medium": [
            {
                "template": "What does the __init__ method do in a Python class?",
                "options": [
                    "Initializes the class attributes",
                    "Destroys the class instance",
                    "Imports required modules",
                    "Prints class information"
                ],
                "answer": "Initializes the class attributes",
                "explanation": "__init__ is the constructor method called when an object is created."
            }
        ],
        "Hard": [
            {
                "template": "What is the difference between @staticmethod and @classmethod in Python?",
                "options": [
                    "staticmethod knows nothing about the class, classmethod receives cls as first arg",
                    "classmethod is faster than staticmethod",
                    "staticmethod can modify class state",
                    "There is no difference"
                ],
                "answer": "staticmethod knows nothing about the class, classmethod receives cls as first arg",
                "explanation": "classmethod receives the class as implicit first argument, while staticmethod doesn't."
            }
        ]
    },
    # JavaScript
    "javascript": {
        "Easy": [
            {
                "template": "What will 'console.log(typeof null)' output?",
                "options": ["'object'", "'null'", "'undefined'", "'string'"],
                "answer": "'object'",
                "explanation": "This is a long-standing bug in JavaScript."
            },
            {
                "template": "Which method adds an element to the end of an array?",
                "options": ["push()", "pop()", "shift()", "unshift()"],
                "answer": "push()",
                "explanation": "push() appends elements to the end of an array."
            }
        ],
        "Medium": [
            {
                "template": "What is the output of: 'console.log(1 + '1' - 1)'?",
                "options": ["10", "11", "0", "NaN"],
                "answer": "10",
                "explanation": "First does string concatenation (1+'1'='11'), then subtraction ('11'-1=10)."
            }
        ],
        "Hard": [
            {
                "template": "What does the 'event loop' handle in JavaScript?",
                "options": [
                    "Asynchronous callbacks",
                    "Memory allocation",
                    "Garbage collection",
                    "DOM rendering"
                ],
                "answer": "Asynchronous callbacks",
                "explanation": "The event loop processes the execution stack and callback queue."
            }
        ]
    },
    # #React
    "react": {
        "Easy": [
            {
                "template": "What hook is used for side effects in function components?",
                "options": ["useEffect", "useState", "useContext", "useReducer"],
                "answer": "useEffect",
                "explanation": "useEffect handles side effects like data fetching."
            }
        ],
        "Medium": [
            {
                "template": "How do you optimize performance for expensive calculations?",
                "options": [
                    "useMemo",
                    "useCallback",
                    "React.memo",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "All these methods help optimize React performance."
            }
        ],
        "Hard": [
            {
                "template": "When would you use useReducer instead of useState?",
                "options": [
                    "Complex state logic",
                    "Multiple sub-values",
                    "When state depends on previous state",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "useReducer is better for complex state management scenarios."
            }
        ]
    },
    # React Native
    "react native": {
        "Easy": [
            {
                "template": "Which component is the base for most React Native UI?",
                "options": ["View", "Div", "Container", "Base"],
                "answer": "View",
                "explanation": "View is the fundamental building block."
            }
        ],
        "Medium": [
            {
                "template": "How do you handle platform-specific code?",
                "options": [
                    "Platform.OS checks",
                    ".ios/.android file extensions",
                    "Platform.select",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "React Native provides multiple ways to handle platform differences."
            }
        ],
        "Hard": [
            {
                "template": "What is the purpose of the Hermes engine?",
                "options": [
                    "Improve JavaScript performance",
                    "Handle native module bridging",
                    "Manage state",
                    "Process images"
                ],
                "answer": "Improve JavaScript performance",
                "explanation": "Hermes is optimized for running React Native apps."
            }
        ]
    },
    # Java
    "java": {
        "Easy": [
            {
                "template": "What is the default value of an int in Java?",
                "options": ["0", "1", "null", "undefined"],
                "answer": "0",
                "explanation": "Primitives have default values (0, false, etc.)"
            }
        ],
        "Medium": [
            {
                "template": "Which collection maintains insertion order?",
                "options": ["ArrayList", "HashSet", "HashMap", "TreeSet"],
                "answer": "ArrayList",
                "explanation": "ArrayList maintains insertion order by index."
            }
        ],
        "Hard": [
            {
                "template": "What is the volatile keyword used for?",
                "options": [
                    "Thread visibility guarantees",
                    "Memory optimization",
                    "Garbage collection",
                    "Exception handling"
                ],
                "answer": "Thread visibility guarantees",
                "explanation": "volatile ensures changes are visible across threads."
            }
        ]
    },
    # Angular
    "angular": {
        "Easy": [
            {
                "template": "Which decorator marks a class as a service?",
                "options": ["@Injectable", "@Service", "@Provider", "@Component"],
                "answer": "@Injectable",
                "explanation": "@Injectable marks a class as available for DI."
            }
        ],
        "Medium": [
            {
                "template": "What is the purpose of ngOnChanges?",
                "options": [
                    "Respond to input changes",
                    "Initialize component",
                    "Clean up resources",
                    "Handle errors"
                ],
                "answer": "Respond to input changes",
                "explanation": "ngOnChanges detects changes to input properties."
            }
        ],
        "Hard": [
            {
                "template": "How does ChangeDetectionStrategy.OnPush work?",
                "options": [
                    "Only checks when inputs change",
                    "Runs detection constantly",
                    "Manual detection only",
                    "Disables change detection"
                ],
                "answer": "Only checks when inputs change",
                "explanation": "OnPush improves performance by limiting checks."
            }
        ]
    },
    # CSS
    "css": {
        "Easy": [
            {
                "template": "Which property controls text size?",
                "options": ["font-size", "text-size", "size", "font"],
                "answer": "font-size",
                "explanation": "font-size sets the size of the font."
            }
        ],
        "Medium": [
            {
                "template": "What does 'position: absolute' do?",
                "options": [
                    "Positions relative to nearest positioned ancestor",
                    "Positions relative to viewport",
                    "Positions relative to document",
                    "Removes from document flow"
                ],
                "answer": "Positions relative to nearest positioned ancestor",
                "explanation": "absolute positioning uses the closest positioned parent as reference."
            }
        ],
        "Hard": [
            {
                "template": "What is the CSS specificity order?",
                "options": [
                    "Inline > ID > Class > Element",
                    "ID > Class > Element > Inline",
                    "Class > ID > Element > Inline",
                    "Element > Class > ID > Inline"
                ],
                "answer": "Inline > ID > Class > Element",
                "explanation": "Inline styles have highest specificity."
            }
        ]
    },
    # SQL
    "sql": {
        "Easy": [
            {
                "template": "Which clause filters groups in SQL?",
                "options": ["WHERE", "HAVING", "GROUP BY", "FILTER"],
                "answer": "HAVING",
                "explanation": "HAVING filters groups after aggregation."
            }
        ],
        "Medium": [
            {
                "template": "What is a primary key constraint?",
                "options": [
                    "Unique + Not Null",
                    "Allows nulls",
                    "Allows duplicates",
                    "Foreign reference"
                ],
                "answer": "Unique + Not Null",
                "explanation": "Primary keys must be unique and not null."
            }
        ],
        "Hard": [
            {
                "template": "What is the difference between INNER and LEFT JOIN?",
                "options": [
                    "LEFT returns all left table rows",
                    "INNER returns only matches",
                    "LEFT keeps unmatched left rows",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "INNER is intersection, LEFT keeps all left rows."
            }
        ]
    },
    # Go
    "go": {
        "Easy": [
            {
                "template": "How do you compile a Go program?",
                "options": ["go build", "go run", "go compile", "Both A and B"],
                "answer": "Both A and B",
                "explanation": "'go build' creates executable, 'go run' compiles+executes."
            }
        ],
        "Medium": [
            {
                "template": "What is a goroutine?",
                "options": [
                    "Lightweight thread",
                    "Heavyweight thread",
                    "Process",
                    "Function"
                ],
                "answer": "Lightweight thread",
                "explanation": "Goroutines are lightweight threads managed by Go runtime."
            }
        ],
        "Hard": [
            {
                "template": "What is the purpose of channels?",
                "options": [
                    "Goroutine communication",
                    "Memory allocation",
                    "Error handling",
                    "Package management"
                ],
                "answer": "Goroutine communication",
                "explanation": "Channels enable safe communication between goroutines."
            }
        ]
    },
    # Android
    "android": {
        "Easy": [
            {
                "template": "What is the base class for Activities?",
                "options": ["Activity", "Context", "AppCompatActivity", "Fragment"],
                "answer": "Activity",
                "explanation": "Activity is the base class for all activities."
            }
        ],
        "Medium": [
            {
                "template": "What is ViewBinding used for?",
                "options": [
                    "Type-safe view references",
                    "Data binding",
                    "Layout inflation",
                    "View recycling"
                ],
                "answer": "Type-safe view references",
                "explanation": "ViewBinding replaces findViewById with type-safe references."
            }
        ],
        "Hard": [
            {
                "template": "What is the purpose of ViewModel?",
                "options": [
                    "Survive configuration changes",
                    "Handle UI logic",
                    "Manage data",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "ViewModel manages UI-related data across configuration changes."
            }
        ]
    },
    # Kotlin
    "kotlin": {
        "Easy": [
            {
                "template": "How do you declare a nullable variable?",
                "options": ["var x: Int?", "var x: Nullable<Int>", "var x: Int.Null", "var x?"],
                "answer": "var x: Int?",
                "explanation": "The '?' suffix makes a type nullable in Kotlin."
            }
        ],
        "Medium": [
            {
                "template": "What is a data class?",
                "options": [
                    "Auto-generates equals/hashCode",
                    "Used for data storage",
                    "Provides component functions",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "Data classes provide boilerplate implementations."
            }
        ],
        "Hard": [
            {
                "template": "What is the purpose of 'inline' functions?",
                "options": [
                    "Reduce lambda overhead",
                    "Improve performance",
                    "Enable non-local returns",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "Inline functions optimize higher-order functions."
            }
        ]
    },
    # Swift
    "swift": {
        "Easy": [
            {
                "template": "What is the nil-coalescing operator?",
                "options": ["??", "?:", "!", "?"],
                "answer": "??",
                "explanation": "a ?? b returns a if not nil, otherwise b."
            }
        ],
        "Medium": [
            {
                "template": "What is protocol-oriented programming?",
                "options": [
                    "Using protocols instead of inheritance",
                    "Value type composition",
                    "Default implementations",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "Swift emphasizes protocols over class inheritance."
            }
        ],
        "Hard": [
            {
                "template": "What is @escaping in closure parameters?",
                "options": [
                    "Closure outlives function scope",
                    "Asynchronous execution",
                    "Required for async calls",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "@escaping marks closures that escape function scope."
            }
        ]
    },
    # Next.js
    "next js": {
        "Easy": [
            {
                "template": "What is the file-based routing directory?",
                "options": ["pages/", "routes/", "src/pages/", "app/"],
                "answer": "pages/",
                "explanation": "Next.js uses pages/ for automatic routing."
            }
        ],
        "Medium": [
            {
                "template": "How do you implement SSR in Next.js?",
                "options": [
                    "getServerSideProps",
                    "getStaticProps",
                    "useEffect",
                    "API routes"
                ],
                "answer": "getServerSideProps",
                "explanation": "getServerSideProps enables server-side rendering."
            }
        ],
        "Hard": [
            {
                "template": "What is ISR (Incremental Static Regeneration)?",
                "options": [
                    "Update static pages after build",
                    "Hybrid SSG/SSR",
                    "On-demand revalidation",
                    "All of the above"
                ],
                "answer": "All of the above",
                "explanation": "ISR allows updating static content without full rebuild."
            }
        ]
    }
}

# ----------------------
# Request/Response Models
# ----------------------
class JobDetails(BaseModel):
    job_title: str
    job_description: str
    job_responsibilities: List[str]
    job_level: JobLevel
    required_skills: List[str]
    optional_skills: Optional[List[str]] = None

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    skill_category: str
    difficulty: Difficulty

class CandidateAnswer(BaseModel):
    question_id: str  # Can be question text or generated ID
    selected_option: str

class AssessmentResult(BaseModel):
    total_questions: int
    correct_answers: int
    score_percentage: float
    skill_breakdown: Dict[str, float]  # Score per skill category
    feedback: str

# ----------------------
# Assessment Service
# ----------------------
class SkillBasedAssessment:
    def __init__(self):
        # Difficulty weights based on job level
        self.difficulty_weights = {
            JobLevel.INTERN: {Difficulty.EASY: 0.7, Difficulty.MEDIUM: 0.3, Difficulty.HARD: 0.0},
            JobLevel.ASSOCIATE: {Difficulty.EASY: 0.5, Difficulty.MEDIUM: 0.4, Difficulty.HARD: 0.1},
            JobLevel.JUNIOR: {Difficulty.EASY: 0.4, Difficulty.MEDIUM: 0.4, Difficulty.HARD: 0.2},
            JobLevel.SENIOR: {Difficulty.EASY: 0.2, Difficulty.MEDIUM: 0.3, Difficulty.HARD: 0.5}
        }
    
    def generate_quiz(self, job: JobDetails, num_questions: int = 15, include_explanations: bool = True) -> List[QuizQuestion]:
        """
        Generates a technical quiz dynamically based on job requirements.
        """
        # Get difficulty distribution based on job level
        difficulty_dist = self.difficulty_weights.get(job.job_level, self.difficulty_weights[JobLevel.JUNIOR])
        
        # Calculate number of questions per difficulty
        easy_count = int(num_questions * difficulty_dist[Difficulty.EASY])
        medium_count = int(num_questions * difficulty_dist[Difficulty.MEDIUM])
        hard_count = num_questions - easy_count - medium_count
        
        # Normalize skills to lowercase
        required_skills = [skill.lower() for skill in job.required_skills]
        optional_skills = [skill.lower() for skill in (job.optional_skills or [])]
        
        # Generate questions for required skills
        all_questions = []
        for skill in required_skills:
            skill_questions = []
            
            # Get available difficulties for this skill
            available_difficulties = QUESTION_TEMPLATES.get(skill, {}).keys()
            
            # Add easy questions
            if Difficulty.EASY in available_difficulties:
                easy_questions = random.sample(
                    QUESTION_TEMPLATES[skill][Difficulty.EASY],
                    min(easy_count // len(required_skills), len(QUESTION_TEMPLATES[skill][Difficulty.EASY]))
                )
                skill_questions.extend(easy_questions)
            
            # Add medium questions
            if Difficulty.MEDIUM in available_difficulties:
                medium_questions = random.sample(
                    QUESTION_TEMPLATES[skill][Difficulty.MEDIUM],
                    min(medium_count // len(required_skills), len(QUESTION_TEMPLATES[skill][Difficulty.MEDIUM]))
                )
                skill_questions.extend(medium_questions)
            
            # Add hard questions
            if Difficulty.HARD in available_difficulties:
                hard_questions = random.sample(
                    QUESTION_TEMPLATES[skill][Difficulty.HARD],
                    min(hard_count // len(required_skills), len(QUESTION_TEMPLATES[skill][Difficulty.HARD]))
                )
                skill_questions.extend(hard_questions)
            
            all_questions.extend(skill_questions)
        
        # If we don't have enough questions, try optional skills
        if len(all_questions) < num_questions and optional_skills:
            remaining = num_questions - len(all_questions)
            additional_questions = []
            
            for skill in optional_skills:
                if skill in QUESTION_TEMPLATES:
                    # Get questions from all difficulties
                    for diff in QUESTION_TEMPLATES[skill]:
                        additional_questions.extend(QUESTION_TEMPLATES[skill][diff])
            
            if additional_questions:
                additional_questions = random.sample(additional_questions, min(remaining, len(additional_questions)))
                all_questions.extend(additional_questions)
        
        # If still not enough, duplicate some questions (not ideal but handles edge cases)
        while len(all_questions) < num_questions and all_questions:
            all_questions.append(random.choice(all_questions))
        
        # Randomize and select the required number of questions
        random.shuffle(all_questions)
        selected_questions = all_questions[:num_questions]
        
        # Convert to QuizQuestion format
        quiz = []
        for q in selected_questions:
            # Determine the skill category (find which skill this question belongs to)
            skill_category = next(
                (skill for skill in required_skills + optional_skills 
                 if skill in QUESTION_TEMPLATES and any(
                     qt["template"] == q["template"] 
                     for qt in QUESTION_TEMPLATES[skill].get(Difficulty.EASY, []) + 
                                QUESTION_TEMPLATES[skill].get(Difficulty.MEDIUM, []) + 
                                QUESTION_TEMPLATES[skill].get(Difficulty.HARD, [])
                 )),
                "general"
            )
            
            # Determine difficulty
            difficulty = next(
                (diff for diff in [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD]
                 if skill_category in QUESTION_TEMPLATES and 
                    any(qt["template"] == q["template"] 
                        for qt in QUESTION_TEMPLATES[skill_category].get(diff, []))),
                Difficulty.MEDIUM
            )
            
            quiz.append(QuizQuestion(
                question=q["template"],
                options=q["options"],
                correct_answer=q["answer"],
                explanation=q.get("explanation") if include_explanations else None,
                skill_category=skill_category,
                difficulty=difficulty
            ))
        
        return quiz
    
    def evaluate_answers(self, quiz: List[QuizQuestion], answers: List[CandidateAnswer]) -> AssessmentResult:
        """
        Evaluates candidate answers against correct answers and generates a result.
        """
        if len(quiz) != len(answers):
            raise ValueError("Number of answers doesn't match number of questions")
        
        # Create question map for quick lookup (using question text as ID)
        question_map = {q.question: q for q in quiz}
        
        correct_count = 0
        skill_scores = {}
        skill_counts = {}
        
        for answer in answers:
            question = question_map.get(answer.question_id)
            if not question:
                continue  # Skip unanswered questions
            
            # Initialize skill tracking if not exists
            if question.skill_category not in skill_scores:
                skill_scores[question.skill_category] = 0
                skill_counts[question.skill_category] = 0
            
            skill_counts[question.skill_category] += 1
            
            if answer.selected_option == question.correct_answer:
                correct_count += 1
                skill_scores[question.skill_category] += 1
        
        # Calculate percentages
        total_questions = len(quiz)
        score_percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        
        # Calculate skill percentages
        skill_breakdown = {}
        for skill in skill_scores:
            skill_breakdown[skill] = (skill_scores[skill] / skill_counts[skill]) * 100 if skill_counts[skill] > 0 else 0
        
        # Generate feedback
        feedback = self._generate_feedback(score_percentage, skill_breakdown)
        
        return AssessmentResult(
            total_questions=total_questions,
            correct_answers=correct_count,
            score_percentage=round(score_percentage, 2),
            skill_breakdown={k: round(v, 2) for k, v in skill_breakdown.items()},
            feedback=feedback
        )
    
    def _generate_feedback(self, score: float, skill_breakdown: Dict[str, float]) -> str:
        """
        Generates personalized feedback based on assessment results.
        """
        if score >= 80:
            overall = "Excellent performance! You have strong technical skills in this area."
        elif score >= 60:
            overall = "Good performance. You have a solid foundation but room for improvement in some areas."
        elif score >= 40:
            overall = "Fair performance. Consider focusing on key areas to strengthen your skills."
        else:
            overall = "Needs improvement. We recommend additional study and practice in this domain."
        
        # Add skill-specific feedback
        skill_feedback = []
        for skill, score in skill_breakdown.items():
            if score >= 80:
                skill_feedback.append(f"• Strong in {skill}")
            elif score >= 60:
                skill_feedback.append(f"• Competent in {skill}")
            elif score >= 40:
                skill_feedback.append(f"• Developing in {skill}")
            else:
                skill_feedback.append(f"• Needs work in {skill}")
        
        return overall + "\n\n" + "\n".join(skill_feedback)

# ----------------------
# API Endpoints
# ----------------------
assessment_router = APIRouter()  # This is now properly defined
assessment_service = SkillBasedAssessment()

@assessment_router.post("/generate-quiz", response_model=List[QuizQuestion])
async def generate_quiz_endpoint(job: JobDetails, num_questions: int = 10, include_explanations: bool = True):
    """
    Generates a technical quiz based on job requirements.
    """
    return assessment_service.generate_quiz(job, num_questions, include_explanations)

@assessment_router.post("/evaluate-quiz", response_model=AssessmentResult)
async def evaluate_quiz_endpoint(quiz: List[QuizQuestion], answers: List[CandidateAnswer]):
    """
    Evaluates candidate answers and returns assessment results.
    """
    return assessment_service.evaluate_answers(quiz, answers)