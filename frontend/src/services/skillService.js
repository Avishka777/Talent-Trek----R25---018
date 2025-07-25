export async function fetchSkillForecast(role) {
    const response = await fetch(`http://localhost:8000/forecast-skills?role=${encodeURIComponent(role)}&top_n=5`);
    if (!response.ok) throw new Error("Failed to fetch forecast");
    return response.json();
}

