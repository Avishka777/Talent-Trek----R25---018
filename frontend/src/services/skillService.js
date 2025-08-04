export async function fetchSkillForecast(role) {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_MODELS_URL
    }forecasting/forecast-skills?role=${encodeURIComponent(role)}&top_n=5`
  );
  if (!response.ok) throw new Error("Failed to fetch forecast");
  return response.json();
}
