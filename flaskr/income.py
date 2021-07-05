from flask import Blueprint, Response, request, jsonify, current_app
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import pandas as pd
from .db import engine
from .auth import checkAuth

bp = Blueprint('income', __name__, url_prefix='/api/income')

# Get Income by Month
@bp.route("/<year>/<month>")
def api_income(year, month):
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        year_month = year + "-" + month
        month = datetime.strptime(year_month, '%Y-%m')
        start_date = (month - timedelta(days=1)).date()
        end_date = (month + relativedelta(months=+1)).date()
        sql = "SELECT i.id, i.source_id, i.earner_id as person_id, Date, s.name AS Source, Amount, p.name AS Person\
                    FROM income i\
                    LEFT JOIN source s ON s.id=i.source_id\
                    LEFT JOIN person_earner p ON p.id=i.earner_id\
                    WHERE date > %s AND date < %s\
                    ORDER BY date;"
        INC_report = pd.read_sql(sql, con=engine, params=[start_date, end_date], parse_dates=['Date'])
        INC_report.set_index('Date', inplace=True)
        return INC_report.to_json(orient="table")

# Used by post_income and post_batch_income
def insert_income(json):
    date = datetime.strptime(json['date'], "%m/%d/%Y").strftime("%Y-%m-%d")
    amount = json['amount'] or None
    earner_id = json['earner_id'] or  None
    source = json['source'] or None
    
    with engine.connect() as con:
        insert_source_sql = "INSERT IGNORE INTO source(name) VALUES(%s)"
        con.execute(insert_source_sql, [source])
        source_id = con.execute("SELECT id FROM source WHERE name=%s", [source]).fetchone()[0]
        sql = "INSERT INTO income(date, amount, source_id, earner_id)\
                VALUES(DATE(%s), %s, %s, %s)"     
        con.execute(sql, [date, amount, source_id, earner_id])

# Create Income Record
@bp.route("/", methods=["POST"])
def post_income():
    json = request.get_json()
    validToken = checkAuth(request)
    print("JSON: ", json)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        insert_income(json)
        return Response('Record Inserted!', status=200)

# Load in batch of income records
@bp.route("/batch", methods=["POST"])
def post_batch_income():
    json = request.get_json()
    validToken = checkAuth(request)
    print("JSON: ", json)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        for row in json:
            insert_income(row)
        return Response('Records Inserted!', status=200)


# Edit income
@bp.route("/<int:id>", methods=['PUT'])
def update_income(id):  
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        json = request.get_json()
        # Parse dates
        date = datetime.strptime(json['Date'], "%m/%d/%Y").strftime("%Y-%m-%d")
        # Convert any null values
        if json['Amount']:
            amount = json['Amount']
        else :
            amount = 0
        if json['person_id']:
            person = json['person_id']
        else:
            person = 'NULL'
        if json['source_id']:
            source = json['source_id']
        else:
            source = 'NULL'

        sql = "UPDATE income \
            SET date=DATE(%s), \
            amount=%s, \
            earner_id=%s, \
            source_id=%s \
            WHERE id=%s;"
        executed = engine.connect().execute(sql, [date, amount, person, source, id])
        return Response(f'id: {id} Updated', status=200)

@bp.route("/<int:id>", methods=['DELETE'])
def delete_income(id):
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        sql = "DELETE FROM income WHERE id=%s;"
        executed = engine.connect().execute(sql, [id])
        return Response(f'id: {id} Deleted', status=200)
    