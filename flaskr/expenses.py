from flask import Blueprint, Response, request
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import pandas as pd
import numpy as np
from . import engine
from .auth import checkAuth

bp = Blueprint('expenses', __name__, url_prefix='/api/expenses')

def format_numbers(x):
    return "{:.2f}".format(x)

# Get expenses
@bp.route("/<year>/<month>")
def api_expenses(year, month):
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        year_month = year + "-" + month    
        month = datetime.strptime(year_month, '%Y-%m')
        start_date = (month - timedelta(days=1)).date()
        end_date = (month + relativedelta(months=+1)).date()
        sql = "SELECT entry_id, person_id, broad_category_id, narrow_category_id, vendor_id, Date, v.name AS Vendor, Amount, b.name AS Broad_category, n.name AS Narrow_category, p.name AS Person, Notes FROM expenses e \
                    LEFT JOIN vendor v ON v.id=e.vendor_id \
                    LEFT JOIN broad_category b ON b.id=e.broad_category_id \
                    LEFT JOIN person_earner p ON p.id=e.person_id \
                    LEFT JOIN narrow_category n ON n.id=e.narrow_category_id \
                    WHERE date > %s AND date < %s \
                    ORDER BY date;"
        EXP_report = pd.read_sql(sql, con=engine, params=[start_date, end_date], parse_dates=['date'])
        EXP_report['Broad_category'] = EXP_report['Broad_category'].str.replace('_', ' ')
        EXP_report['Narrow_category'] = EXP_report['Narrow_category'].str.replace('_', ' ')
        EXP_report.set_index('Date', inplace=True)
        EXP_report['Amount'] = EXP_report['Amount'].apply(format_numbers)
        return EXP_report.to_json(orient="table")

# Edit expenses
@bp.route("/<int:id>", methods=['PUT'])
def update_expenses(id):
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
        if json['broad_category_id']:
            bCat = json['broad_category_id']
        else:
            bCat = 'NULL'
        if json['narrow_category_id']:
            nCat = json['narrow_category_id']
        else:
            nCat = 'NULL'
        if json['vendor_id']:
            vendor = json['vendor_id']
        else:
            vendor = 'NULL'

        notes = json['Notes']
        
        sql = "UPDATE expenses \
            SET date=DATE(%s), vendor_id=%s, \
            amount=%s, broad_category_id=%s, \
            narrow_category_id=%s, person_id=%s, \
            notes=%s\
            WHERE entry_id=%s;"
        executed = engine.connect().execute(sql, [date, vendor, amount, bCat, nCat, person, notes, id])
        return Response(f'id: {id} Updated', status=200)

    # Delete expenses
@bp.route("/<int:id>", methods=['DELETE'])
def delete_expenses(id):
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        sql = "DELETE FROM expenses WHERE entry_id=%s;"
        executed = engine.connect().execute(sql, [id])
        return Response(f'id: {id} Deleted', status=200)

@bp.route("/pivot/<year>/<month>")
def api_pivot(year, month):
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        year_month = year + "-" + month    
        month = datetime.strptime(year_month, '%Y-%m')
        start_date = month.date()
        end_date = (month + relativedelta(months=+1)).date()
        sql = "SELECT Date, v.name AS Vendor, Amount, b.name AS Broad_category, n.name AS Narrow_category, p.name AS Person, Notes FROM expenses e \
                    LEFT JOIN vendor v ON v.id=e.vendor_id \
                    LEFT JOIN broad_category b ON b.id=e.broad_category_id \
                    LEFT JOIN person_earner p ON p.id=e.person_id \
                    LEFT JOIN narrow_category n ON n.id=e.narrow_category_id \
            WHERE date > %s AND date < %s;"

        EXP_dataframe = pd.read_sql(sql, con=engine, params=[start_date, end_date], parse_dates=['date'])
        EXP_dataframe['Broad_category'] = EXP_dataframe['Broad_category'].str.replace('_', ' ')
        EXP_dataframe['Narrow_category'] = EXP_dataframe['Narrow_category'].str.replace('_', ' ')
        PT_report = pd.pivot_table(EXP_dataframe, values='Amount', index=['Broad_category', 'Narrow_category'], aggfunc=np.sum)
        PT_report_broad = pd.pivot_table(EXP_dataframe, values='Amount', index='Broad_category', aggfunc=np.sum)
        PT_report_broad.index = pd.MultiIndex.from_product([PT_report_broad.index, ['x----TOTAL']], names=['Broad_category', 'Narrow_category'])
        PT_report = pd.concat([PT_report, PT_report_broad]).sort_index()
        PT_report['Amount'] = PT_report['Amount'].apply(format_numbers)
        return PT_report.to_json(orient="table")