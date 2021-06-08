from sqlalchemy import create_engine
import os



FLASK_DB_URI = "mysql+pymysql://blarvis:twenty2?@finances:3306/finances_db" # os.environ.get("FLASK_DB_URI")

# Create database connection
engine = create_engine(FLASK_DB_URI) 