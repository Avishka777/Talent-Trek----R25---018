import pandas as pd
from prophet import Prophet
from typing import Dict, List, Tuple, Optional

# Load dataset (consider moving this to a config or environment variable)
df = pd.read_csv("./dataset/role_skill_frequency.csv")
df['Date'] = pd.to_datetime(df['Date'])

def forecast_skill_demand(df: pd.DataFrame, role: str, skill: str, months_ahead: int = 6) -> Tuple[Optional[pd.DataFrame], float]:
    """Forecast skill demand for a specific role and skill"""
    skill_ts = df[(df['Role'] == role.lower()) & (df['Skill'] == skill.lower())][['Date', 'Frequency']]
    skill_ts = skill_ts.groupby('Date').sum().asfreq('MS').fillna(0).reset_index()
    skill_ts.columns = ['ds', 'y']
    
    if len(skill_ts) < 2:
        return None, 0
    
    model = Prophet()
    model.fit(skill_ts)
    future = model.make_future_dataframe(periods=months_ahead, freq='MS')
    forecast = model.predict(future)
    forecast_sum = forecast[['ds', 'yhat']].tail(months_ahead)['yhat'].sum()
    return forecast[['ds', 'yhat']], forecast_sum

def forecast_all_skills(df: pd.DataFrame, role: str, months_ahead: int = 6) -> List[Tuple[str, float]]:
    """Forecast demand for all skills within a given role"""
    skills = df[df['Role'] == role.lower()]['Skill'].unique()
    results = {}
    
    for skill in skills:
        _, forecast_sum = forecast_skill_demand(df, role, skill, months_ahead)
        results[skill] = forecast_sum
    
    return sorted(results.items(), key=lambda x: x[1], reverse=True)