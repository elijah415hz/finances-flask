from flask import Flask, request, render_template
from sqlalchemy import create_engine
import pandas as pd
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

import os
FLASK_DB_URI = os.environ.get("FLASK_DB_URI")

app = Flask(__name__)

def format_numbers(x):
    return "${:.2f}".format(x)

@app.route("/")
def index():
    return render_template('form.html')

@app.route("/react")
def react():
    return render_template('react_client/build/index.html')

@app.route("/income")
def income():
    engine = create_engine(FLASK_DB_URI)    
    
    year = request.args.get("year")
    month = request.args.get("month")
    year_month = year + "-" + month
    month = datetime.strptime(year_month, '%Y-%m')
    start_date = (month - timedelta(days=1)).date()
    end_date = (month + relativedelta(months=+1)).date()
    sql = "SELECT Date, Amount, s.name AS Source, p.name AS Person\
                FROM income i\
                LEFT JOIN source s ON s.id=i.source_id\
                LEFT JOIN person_earner p ON p.id=i.earner_id\
		        WHERE date > '{}' AND date < '{}'\
                ORDER BY date;".format(start_date, end_date)
    INC_report = pd.read_sql(sql, con=engine, parse_dates=['Date'])
    INC_report.set_index('Date', inplace=True)
    INC_total = INC_report['Amount'].sum()
    month_str = datetime.strftime(month, '%B %Y')
    header = "Income for {}".format(month_str)
    return render_template('table.html', header=header, table=INC_report.to_html(), total=INC_total)

@app.route("/api/income")
def api_income():
    engine = create_engine(FLASK_DB_URI)    
    year = request.args.get("year")
    month = request.args.get("month")
    year_month = year + "-" + month
    month = datetime.strptime(year_month, '%Y-%m')
    start_date = month.date()
    end_date = (month + relativedelta(months=+1)).date()
    sql = "SELECT i.id, Date, Amount, s.name AS Source, p.name AS Person\
                FROM income i\
                LEFT JOIN source s ON s.id=i.source_id\
                LEFT JOIN person_earner p ON p.id=i.earner_id\
		        WHERE date > '{}' AND date < '{}'\
                ORDER BY date;".format(start_date, end_date)
    INC_report = pd.read_sql(sql, con=engine, parse_dates=['Date'])
    INC_report.set_index('Date', inplace=True)
    INC_report['Amount'] = INC_report['Amount'].apply(format_numbers)
    return INC_report.to_json(orient="table")

@app.route("/expenses")
def expenses():
    engine = create_engine(FLASK_DB_URI)    
    year = request.args.get("year")
    month = request.args.get("month")
    year_month = year + "-" + month    
    month = datetime.strptime(year_month, '%Y-%m')
    start_date = (month - timedelta(days=1)).date()
    end_date = (month + relativedelta(months=+1)).date()
    sql = "SELECT Date, v.name AS Vendor, Amount, b.name AS Broad_category, n.name AS Narrow_category, p.name AS Person, Notes FROM expenses e \
                LEFT JOIN vendor v ON v.id=e.vendor_id \
                LEFT JOIN broad_category b ON b.id=e.broad_category_id \
                LEFT JOIN person_earner p ON p.id=e.person_id \
                LEFT JOIN narrow_category n ON n.id=e.narrow_category_id \
                WHERE date > '{}' AND date < '{}' \
                ORDER BY date;".format(start_date, end_date)
    EXP_report = pd.read_sql(sql, con=engine, parse_dates=['date'])
    EXP_report['Broad_category'] = EXP_report['Broad_category'].str.replace('_', ' ')
    EXP_report['Narrow_category'] = EXP_report['Narrow_category'].str.replace('_', ' ')
    # Set pandas options to display all columns on a single row
    EXP_report.set_index('Date', inplace=True)
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    pd.set_option('display.max_rows', None)
    month_str = datetime.strftime(month, '%B %Y')
    header = "Expenses for {}".format(month_str)
    return render_template('table.html', header=header, table=EXP_report.to_html())

@app.route("/api/expenses")
def api_expenses():
    engine = create_engine(FLASK_DB_URI)    
    year = request.args.get("year")
    month = request.args.get("month")
    year_month = year + "-" + month    
    month = datetime.strptime(year_month, '%Y-%m')
    start_date = month.date()
    end_date = (month + relativedelta(months=+1)).date()
    sql = "SELECT entry_id, Date, v.name AS Vendor, Amount, b.name AS Broad_category, n.name AS Narrow_category, p.name AS Person, Notes FROM expenses e \
                LEFT JOIN vendor v ON v.id=e.vendor_id \
                LEFT JOIN broad_category b ON b.id=e.broad_category_id \
                LEFT JOIN person_earner p ON p.id=e.person_id \
                LEFT JOIN narrow_category n ON n.id=e.narrow_category_id \
                WHERE date > '{}' AND date < '{}' \
                ORDER BY date;".format(start_date, end_date)
    EXP_report = pd.read_sql(sql, con=engine, parse_dates=['date'])
    EXP_report['Broad_category'] = EXP_report['Broad_category'].str.replace('_', ' ')
    EXP_report['Narrow_category'] = EXP_report['Narrow_category'].str.replace('_', ' ')
    EXP_report.set_index('Date', inplace=True)
    EXP_report['Amount'] = EXP_report['Amount'].apply(format_numbers)
    return EXP_report.to_json(orient="table")
   

# if __name__ == "__main__":
#     app.run(host='0.0.0.0')