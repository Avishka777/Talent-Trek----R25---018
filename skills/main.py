from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
from prophet import Prophet

# Load your dataset
df = pd.read_csv("role_skill_frequency_updated.csv")
df['Date'] = pd.to_datetime(df['Date'])  # Convert the 'Date' column to datetime format

# Initialize FastAPI app
app = FastAPI(title="Skill Forecast API")

# Configure CORS to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Function to forecast skill demand for a specific role and skill over a specified future period
def forecast_skill_demand(df, role, skill, months_ahead=6):
    # Filter the dataframe for the specific role and skill, then aggregate by month
    skill_ts = df[(df['Role'] == role) & (df['Skill'] == skill)][['Date', 'Frequency']]
    skill_ts = skill_ts.groupby('Date').sum().asfreq('MS').fillna(0).reset_index()
    skill_ts.columns = ['ds', 'y']  # Rename columns for Prophet compatibility

    # If the time series is too short, return None
    if len(skill_ts) < 2:
        return None, 0

    # Create and fit the Prophet model
    model = Prophet()
    model.fit(skill_ts)
    # Create future dataframe for prediction
    future = model.make_future_dataframe(periods=months_ahead, freq='MS')
    forecast = model.predict(future)
    # Calculate the total predicted mentions in the future period
    forecast_sum = forecast[['ds', 'yhat']].tail(months_ahead)['yhat'].sum()
    return forecast[['ds', 'yhat']], forecast_sum

# Function to forecast demand for all skills within a given role
def forecast_all_skills(df, role, months_ahead=6):
    skills = df[df['Role'] == role]['Skill'].unique()  # Get unique skills for the role
    results = {}
    for skill in skills:
        _, forecast_sum = forecast_skill_demand(df, role, skill, months_ahead)
        results[skill] = forecast_sum
    # Sort skills by predicted demand
    sorted_skills = sorted(results.items(), key=lambda x: x[1], reverse=True)
    return sorted_skills

# API Endpoint to get forecasted skills demand for a role
@app.get("/forecast-skills")
def get_forecasted_skills(role: str = Query(..., description="Job role (e.g., Web Developer)"), top_n: int = 5):
    # Get top N forecasted skills for the role
    top_skills = forecast_all_skills(df, role.lower(), months_ahead=6)
    # Prepare response with rounded predicted mentions
    top_skills = [{"skill": skill, "predicted_mentions": round(score)} for skill, score in top_skills[:top_n]]
    
    print(top_skills)  # Print top skills for debugging
    return {
        "role": role,
        "months_ahead": 6,
        "top_skills": top_skills
    }
