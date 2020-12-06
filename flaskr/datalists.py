from flask import Blueprint
import pandas as pd
from . import engine

bp = Blueprint('datalists', __name__, url_prefix='/api')

@bp.route("/sources")
def get_sources():
    sql = "SELECT id, name FROM source ORDER BY name"
    dataframe = pd.read_sql(sql, con=engine)
    return dataframe.to_json(orient="table")

@bp.route("/persons")
def get_persons():
    sql = "SELECT id, name FROM person_earner ORDER BY name"
    dataframe = pd.read_sql(sql, con=engine)
    return dataframe.to_json(orient="table")

@bp.route("/narrows")
def get_narrows():
    sql = "SELECT id, name FROM narrow_category ORDER BY name"
    dataframe = pd.read_sql(sql, con=engine)
    return dataframe.to_json(orient="table")

@bp.route("/broads")
def get_broads():
    sql = "SELECT id, name FROM broad_category ORDER BY name"
    dataframe = pd.read_sql(sql, con=engine)
    return dataframe.to_json(orient="table")

@bp.route("/vendors")
def get_vendors():
    sql = "SELECT id, name FROM vendor ORDER BY name"
    dataframe = pd.read_sql(sql, con=engine)
    return dataframe.to_json(orient="table")