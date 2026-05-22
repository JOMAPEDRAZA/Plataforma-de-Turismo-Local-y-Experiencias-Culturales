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
    # Agregar campos extra a experiencias
    try:
        c.execute("ALTER TABLE experiencias ADD COLUMN tipo_especifico VARCHAR(100)")
    except: pass
    try:
        c.execute("ALTER TABLE experiencias ADD COLUMN incluye TEXT")
    except: pass
    try:
        c.execute("ALTER TABLE experiencias ADD COLUMN punto_encuentro VARCHAR(200)")
    except: pass
    try:
        c.execute("ALTER TABLE experiencias ADD COLUMN horario VARCHAR(100)")
    except: pass
    try:
        c.execute("ALTER TABLE experiencias ADD COLUMN direccion VARCHAR(200)")
    except: pass

    # Tabla de items del menu (gastronomia)
    c.execute("""
        CREATE TABLE IF NOT EXISTS menu_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            producto_id INT NOT NULL,
            nombre VARCHAR(150) NOT NULL,
            categoria ENUM('entrada','plato_principal','bebida','postre','otro') DEFAULT 'plato_principal',
            precio DECIMAL(10,2) NOT NULL,
            descripcion VARCHAR(300),
            FOREIGN KEY (producto_id) REFERENCES experiencias(id) ON DELETE CASCADE
        )
    """)

db.commit()
db.close()
print("¡Tablas actualizadas!")
