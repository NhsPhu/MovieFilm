from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from recommender import CollaborativeFilteringRecommender
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Movie Recommendation API",
    description="AI-powered movie recommendation service using collaborative filtering",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = CollaborativeFilteringRecommender()

@app.get("/")
def root():
    return {
        "message": "Movie Recommendation API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/recommend/{user_id}")
async def get_recommendations(user_id: int, limit: int = 10):
    try:
        logger.info(f"Getting recommendations for user {user_id}")
        recommendations = recommender.get_recommendations(user_id, limit)
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "count": len(recommendations)
        }
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain")
async def retrain_model():
    try:
        logger.info("Retraining recommendation model")
        recommender.train()
        return {"message": "Model retrained successfully"}
    except Exception as e:
        logger.error(f"Error retraining model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
