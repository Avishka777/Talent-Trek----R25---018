from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from controller import router as matching_router

app = FastAPI()

# Enable CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include endpoints from the controller
app.include_router(matching_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
