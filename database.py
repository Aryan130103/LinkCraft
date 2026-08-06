import sqlite3

def setup_database():
    conn=sqlite3.connect('linkcraft.db')
    cursor=conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS links(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT,
        original_url TEXT
        )
        """)
        
    #thumbnail
    #check if columns already exist before adding them
    for column in ["title TEXT", "description TEXT", "image_url TEXT"]:
        try:
            cursor.execute(f"ALTER TABLE links ADD COLUMN {column}")
        except sqlite3.OperationalError:
            pass

    conn.commit()
    conn.close()

if __name__ == "__main__":
  setup_database()