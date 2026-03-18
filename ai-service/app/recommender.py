import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from database import get_db_connection
import logging

logger = logging.getLogger(__name__)

class CollaborativeFilteringRecommender:
    def __init__(self):
        self.user_movie_matrix = None
        self.user_similarity = None
        self.train()
    
    def train(self):
        logger.info("Training recommendation model...")
        conn = get_db_connection()
        
        query = """
            SELECT 
                wh.user_id, 
                wh.movie_id,
                CASE 
                    WHEN wh.is_finished = 1 THEN 5
                    WHEN wh.current_time_sec > 0.7 * m.duration_sec THEN 4
                    WHEN wh.current_time_sec > 0.4 * m.duration_sec THEN 3
                    ELSE 2
                END as implicit_rating
            FROM watch_history wh
            JOIN movies m ON wh.movie_id = m.id
            WHERE m.status = 'READY'
        """
        
        try:
            df = pd.read_sql(query, conn)
            
            if df.empty:
                logger.warning("No watch history data available")
                self.user_movie_matrix = pd.DataFrame()
                self.user_similarity = np.array([])
                return
            
            self.user_movie_matrix = df.pivot_table(
                index='user_id',
                columns='movie_id',
                values='implicit_rating',
                fill_value=0
            )
            
            if len(self.user_movie_matrix) > 1:
                self.user_similarity = cosine_similarity(self.user_movie_matrix)
            else:
                self.user_similarity = np.array([[1.0]])
            
            logger.info(f"Model trained with {len(self.user_movie_matrix)} users and {len(self.user_movie_matrix.columns)} movies")
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise
        finally:
            conn.close()
    
    def get_recommendations(self, user_id: int, limit: int = 10):
        if self.user_movie_matrix is None or self.user_movie_matrix.empty:
            return self._get_popular_movies(limit)
        
        if user_id not in self.user_movie_matrix.index:
            logger.info(f"User {user_id} not found, returning popular movies")
            return self._get_popular_movies(limit)
        
        user_idx = self.user_movie_matrix.index.get_loc(user_id)
        
        similar_users_idx = self.user_similarity[user_idx].argsort()[-6:-1][::-1]
        
        user_movies = set(self.user_movie_matrix.iloc[user_idx][
            self.user_movie_matrix.iloc[user_idx] > 0
        ].index)
        
        recommendations = {}
        for similar_user_idx in similar_users_idx:
            similar_user_movies = self.user_movie_matrix.iloc[similar_user_idx]
            for movie_id, rating in similar_user_movies[similar_user_movies > 0].items():
                if movie_id not in user_movies:
                    if movie_id not in recommendations:
                        recommendations[movie_id] = 0
                    recommendations[movie_id] += rating * self.user_similarity[user_idx][similar_user_idx]
        
        sorted_recs = sorted(
            recommendations.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:limit]
        
        return [{"movie_id": int(movie_id), "score": float(score)} 
                for movie_id, score in sorted_recs]
    
    def _get_popular_movies(self, limit):
        logger.info("Getting popular movies as fallback")
        conn = get_db_connection()
        
        query = f"""
            SELECT id as movie_id, views_count as score
            FROM movies
            WHERE status = 'READY'
            ORDER BY views_count DESC
            LIMIT {limit}
        """
        
        try:
            df = pd.read_sql(query, conn)
            return df.to_dict('records')
        finally:
            conn.close()
