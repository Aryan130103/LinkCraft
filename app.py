from flask import Flask,request,redirect,render_template    
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address  #Ip address based rate limiting
import sqlite3
import time
from utils import encode_base62, url_validation
from urllib.parse import urlparse
from database import setup_database
app=Flask(__name__)
setup_database()  # Ensure the database is set up when the app starts
limiter = Limiter(get_remote_address, app=app, default_limits=["200 per day"])  #Every IP can create 200 links per day
response_times = []

@app.route('/')     #homepage
def home():
    return render_template('homepage.html') 

@app.route('/shorten', methods=['POST'])       #shorten url, POST only
@limiter.limit("5 per minute")                    #Rate limit for this endpoint
def shorten():    
    start_time = time.time()            #avg response time calculation

    original_url=request.form['url']
    custom_alias=request.form.get('custom_alias')
    title = request.form.get('title')                   #meta tags fetching
    description = request.form.get('description')
    image_url = request.form.get('image_url')

    if not url_validation(original_url):      #Url validation
        elapsed = time.time() - start_time
        response_times.append(elapsed)
        return "Invalid URL", 400
    
    conn=sqlite3.connect('linkcraft.db')
    cursor=conn.cursor()
    
    if custom_alias:
        cursor.execute("SELECT * FROM links WHERE short_code=?", (custom_alias,))
        existing= cursor.fetchone()

        if existing:
            conn.close()
            elapsed = time.time() - start_time
            response_times.append(elapsed)
            return "Alias already in use", 400
        
        cursor.execute("INSERT INTO links (original_url, short_code, title, description, image_url) VALUES (?, ?, ?, ?, ?)",(original_url, custom_alias, title, description, image_url)
)
        conn.commit()
        conn.close()
        short_url=request.host_url+custom_alias
        elapsed = time.time() - start_time
        response_times.append(elapsed)
        return f"Short link: {short_url}"
    
    else:
        cursor.execute("INSERT INTO links (original_url, title, description, image_url) VALUES (?, ?, ?, ?)",    (original_url, title, description, image_url)
)
        conn.commit()
        new_id=cursor.lastrowid
        short_code=encode_base62(new_id)
        cursor.execute("UPDATE links SET short_code=? WHERE id=?", (short_code, new_id))
        conn.commit()
        conn.close()
        short_url=request.host_url+short_code
        elapsed = time.time() - start_time
        response_times.append(elapsed)
        return f"Short link: {short_url}" 

@app.route('/<code>')
def go_to_url(code):
    conn=sqlite3.connect('linkcraft.db')
    cursor=conn.cursor()
    cursor.execute("SELECT original_url, title, description, image_url FROM links WHERE short_code=?",(code,))
    result=cursor.fetchone()
    conn.close()

    if result:
        original_url, title, description, image_url = result
        return render_template('redirect.html', original_url=original_url, title=title, description=description, image_url=image_url)
    else:
        return "URL not found", 404

#stats count of links created
@app.route('/stats')
def stats():
    conn = sqlite3.connect('linkcraft.db')
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM links")
    count = cursor.fetchone()[0]
    conn.close()
    
    avg_time = sum(response_times) / len(response_times) if response_times else 0
    
    return {"links_created": count, "avg_response_ms": round(avg_time * 1000, 2)}

if __name__ == '__main__':
    app.run(debug=True)  