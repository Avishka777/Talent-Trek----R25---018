import axios from 'axios';
import Swal from 'sweetalert2';

// sample data
const mockCandidates = [
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
      { name: 'Node.js', score: 90 },
      { name: 'TypeScript', score: 88 },
      { name: 'CSS', score: 85 }
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
      { name: 'SQL', score: 85 },
      { name: 'Data Analysis', score: 82 }
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
      { name: 'Microservices', score: 94 },
      { name: 'AWS', score: 90 }
    ]
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    experienceYears: 2,
    overallScore: 78,
    technicalScore: 75,
    softSkillsScore: 82,
    assessmentDate: '2023-06-22T11:20:00Z',
    skills: [
      { name: 'HTML', score: 85 },
      { name: 'CSS', score: 80 },
      { name: 'JavaScript', score: 75 },
      { name: 'UI/UX', score: 82 }
    ]
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    experienceYears: 4,
    overallScore: 85,
    technicalScore: 88,
    softSkillsScore: 81,
    assessmentDate: '2023-06-25T13:10:00Z',
    skills: [
      { name: 'C#', score: 90 },
      { name: '.NET', score: 88 },
      { name: 'SQL Server', score: 85 },
      { name: 'Azure', score: 80 }
    ]
  }
];

const mockSkills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java',
  'Spring Boot', 'HTML', 'CSS', 'SQL', 'AWS',
  'TypeScript', 'Django', 'C#', '.NET', 'Azure'
];

// Helper function to handle API errors
const handleError = (error) => {
  console.error('API Error:', error);
  const message = error.response?.data?.message || error.message || 'An unknown error occurred';
  Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error',
    confirmButtonColor: 'red',
  });
  throw error;
};

const candidateService = {
  // Get all assessed candidates
  async getAssessedCandidates(token, useMock = false) {
    if (useMock) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            candidates: mockCandidates
          });
        }, 800); // Simulate network delay
      });
    }

    try {
      const response = await axios.get('/api/candidates/assessments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Get list of all skills
  async getSkillsList(token, useMock = false) {
    if (useMock) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            skills: mockSkills
          });
        }, 500);
      });
    }

    try {
      const response = await axios.get('/api/candidates/skills', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Get candidate details by ID
  async getCandidateById(token, candidateId, useMock = false) {
    if (useMock) {
      return new Promise(resolve => {
        setTimeout(() => {
          const candidate = mockCandidates.find(c => c.id === candidateId);
          resolve({
            success: !!candidate,
            candidate: candidate || null
          });
        }, 500);
      });
    }

    try {
      const response = await axios.get(`/api/candidates/${candidateId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Get assessments by skill
  async getAssessmentsBySkill(token, skillName, useMock = false) {
    if (useMock) {
      return new Promise(resolve => {
        setTimeout(() => {
          const filtered = mockCandidates.filter(candidate => 
            candidate.skills.some(skill => skill.name === skillName)
          );
          resolve({
            success: true,
            candidates: filtered
          });
        }, 600);
      });
    }

    try {
      const response = await axios.get(`/api/candidates/skills/${skillName}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // Get recent assessments (for time-based filtering)
  async getRecentAssessments(token, days, useMock = false) {
    if (useMock) {
      return new Promise(resolve => {
        setTimeout(() => {
          const now = new Date();
          const filtered = mockCandidates.filter(candidate => {
            const assessmentDate = new Date(candidate.assessmentDate);
            const diffDays = (now - assessmentDate) / (1000 * 60 * 60 * 24);
            return diffDays <= days;
          });
          resolve({
            success: true,
            candidates: filtered
          });
        }, 700);
      });
    }

    try {
      const response = await axios.get(`/api/candidates/recent?days=${days}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
};

export default candidateService;