from flask import Flask
import os
from . import auth, expenses, income, datalists, views

# Setup app
app = Flask(__name__, static_folder='../build', static_url_path="/")
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.register_blueprint(auth.bp)
app.register_blueprint(expenses.bp)
app.register_blueprint(income.bp)
app.register_blueprint(datalists.bp)
app.register_blueprint(views.bp)

@app.after_request
def add_headers(r):
    r.headers['Cache-Control'] = 'public, max-age=0, stale-while-revalidate=604800'
    return r

