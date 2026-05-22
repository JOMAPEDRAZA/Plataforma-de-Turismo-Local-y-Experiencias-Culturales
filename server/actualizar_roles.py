import pymysql
from dotenv import load_dotenv
import os

load_dotenv()

db = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "turismo_db")
)

with db.cursor() as c:
    c.execute("""
        ALTER TABLE users 
        MODIFY rol ENUM('turista','guia_turistico','guia_gastronomico','anfitrion','admin') 
        DEFAULT 'turista'
    """)

db.commit()
db.close()
print("¡Roles actualizados!")