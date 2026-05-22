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
        CREATE TABLE IF NOT EXISTS resenas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto_id INT NOT NULL,
            turista_id INT NOT NULL,
            estrellas INT NOT NULL,
            comentario TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES experiencias(id) ON DELETE CASCADE,
            FOREIGN KEY (turista_id) REFERENCES users(id)
        )
    """)

db.commit()
db.close()
print("¡Tabla resenas creada!")