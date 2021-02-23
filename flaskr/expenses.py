from flask import Blueprint, Response, request, send_file
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import pandas as pd
import numpy as np
from io import BytesIO
from .db import engine
from .auth import checkAuth


bp = Blueprint('expenses', __name__, url_prefix='/api/expenses')

def format_numbers(x):
    return "{:.2f}".format(x)

def get_expenses(start_date, end_date):
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
    return EXP_report

# Get expenses by month
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
        EXP_report = get_expenses(start_date, end_date)
        EXP_report['Amount'] = EXP_report['Amount'].apply(format_numbers)
        return EXP_report.to_json(orient="table")

# Get xlsx file with all expenses and income
@bp.route("/file/<start>/<end>") # Dates formatted '%Y-%m-%d'
def expenses_file(start, end):
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        start_date = datetime.strptime(start, '%Y-%m-%d')
        end_date = datetime.strptime(end, '%Y-%m-%d')
        EXP_report = get_expenses(start_date, end_date)
        EXP_report['Date'] = EXP_report['Date'].dt.strftime("%m/%d/%Y")
        drop_columns = [c for c in EXP_report.columns if c[-3:] == '_id']
        EXP_report.drop(columns=drop_columns, inplace=True)
        EXP_report.columns = EXP_report.columns.str.replace("_", " ")
        # Get Income
        INC_sql = "SELECT i.id, i.source_id, i.earner_id as person_id, Date, Amount, s.name AS Source, p.name AS Person\
                    FROM income i\
                    LEFT JOIN source s ON s.id=i.source_id\
                    LEFT JOIN person_earner p ON p.id=i.earner_id\
                    WHERE Date > %s AND Date < %s\
                    ORDER BY Date;"
        INC_report = pd.read_sql(INC_sql, con=engine, params=[start_date, end_date], parse_dates=['Date'])
        INC_report['Date'] = INC_report['Date'].dt.strftime("%m/%d/%Y")
        drop_columns = [c for c in INC_report.columns if c[-2:] == 'id']
        INC_report.drop(columns=drop_columns, inplace=True)
        INC_report.columns = INC_report.columns.str.title()
        INC_report.set_index('Date', inplace=True)
        # Write to file
        buffer = BytesIO()
        writer = pd.ExcelWriter(buffer, engine='xlsxwriter')
        title_format = writer.book.add_format({'bold': True, 'font_size': 20})
        num_format = writer.book.add_format({'num_format': '$#,##0.00'})
        EXP_report.to_excel(writer, sheet_name='Expenses', startcol = 0, startrow = 2)
        INC_report.to_excel(writer, sheet_name='Income', startcol = 0, startrow = 2)
        # Styling Expenses
        all_expenses = writer.sheets['Expenses']
        all_expenses.set_column('A:G', 18)
        all_expenses.set_row(0, 30)
        all_expenses.set_column('C:C', None, num_format)
        all_expenses.write_string(0, 0, 'Expenses', title_format)
        # Styling Income
        income = writer.sheets['Income']
        income.set_column('A:G', 18)
        income.set_row(0, 30)
        income.set_column('B:B', None, num_format)
        income.write_string(0, 0, 'Income', title_format)
        # Send File
        writer.save()
        buffer.seek(0)
        return send_file(buffer, attachment_filename="reports.xlsx", cache_timeout=0)

# Used by post_expense and post_expenses_batch
def insert_expense(json):
    date = datetime.strptime(json['Date'], "%m/%d/%Y").strftime("%Y-%m-%d")
    amount = json['Amount'] or None
    person = json['person_id'] or  None
    b_cat = json['broad_category_id'] or None
    n_cat = json['narrow_category_id'] or None
    vendor = json['vendor'] or None
    notes = json['notes']
    
    with engine.connect() as con:
        insert_vendor_sql = "INSERT IGNORE INTO vendor(name) VALUES(%s)"
        con.execute(insert_vendor_sql, [vendor])
        vendor_id = con.execute("SELECT id FROM vendor WHERE name=%s", [vendor]).fetchone()[0]
        sql = "INSERT INTO expenses(date, vendor_id, amount, broad_category_id, narrow_category_id, person_id, notes)\
                VALUES(DATE(%s), %s, %s, %s, %s, %s, %s)"     
        con.execute(sql, [date, vendor_id, amount, b_cat, n_cat, person, notes])

# Create Expense
@bp.route("/", methods=["POST"])
def post_expense():
    json = request.get_json()
    validToken = checkAuth(request)
    print("JSON: ", json)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        insert_expense(json)
        return Response('Record Inserted!', status=200)

# Load in batch of expenses
@bp.route("/batch", methods=["POST"])
def post_batch_expense():
    json = request.get_json()
    validToken = checkAuth(request)
    print("JSON: ", json)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        for row in json:
            insert_expense(row)
        return Response('Records Inserted!', status=200)


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
        amount = json['Amount'] or None
        person = json['person_id'] or  None
        b_cat = json['broad_category_id'] or None
        n_cat = json['narrow_category_id'] or None
        vendor = json['vendor_id'] or None
        notes = json['Notes']
        
        sql = "UPDATE expenses \
            SET date=DATE(%s), vendor_id=%s, \
            amount=%s, broad_category_id=%s, \
            narrow_category_id=%s, person_id=%s, \
            notes=%s\
            WHERE entry_id=%s;"
        engine.connect().execute(sql, [date, vendor, amount, b_cat, n_cat, person, notes, id])
        return Response(f'id: {id} Updated', status=200)

# Delete expenses
@bp.route("/<int:id>", methods=['DELETE'])
def delete_expenses(id):
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        sql = "DELETE FROM expenses WHERE entry_id=%s;"
        engine.connect().execute(sql, [id])
        return Response(f'id: {id} Deleted', status=200)

# Search Expenses
@bp.route("search/<string:param>", methods=['GET'])
def search_expenses(param):
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        sql = "SELECT entry_id, person_id, broad_category_id, narrow_category_id, vendor_id, Date, v.name AS Vendor, Amount, b.name AS Broad_category, n.name AS Narrow_category, p.name AS Person, Notes FROM expenses e \
                    LEFT JOIN vendor v ON v.id=e.vendor_id \
                    LEFT JOIN broad_category b ON b.id=e.broad_category_id \
                    LEFT JOIN person_earner p ON p.id=e.person_id \
                    LEFT JOIN narrow_category n ON n.id=e.narrow_category_id \
                    WHERE v.name LIKE CONCAT('%%', %s, '%%') OR b.name LIKE CONCAT('%%', %s, '%%') OR n.name LIKE CONCAT('%%', %s, '%%') OR e.Notes LIKE CONCAT('%%', %s, '%%') \
                    ORDER BY date;"
        search_report = pd.read_sql(sql, con=engine, params=[param, param, param, param], parse_dates=['date'])
        search_report['Broad_category'] = search_report['Broad_category'].str.replace('_', ' ')
        search_report['Narrow_category'] = search_report['Narrow_category'].str.replace('_', ' ')
        search_report.set_index('Date', inplace=True)
        return search_report.to_json(orient="table")

# Return Pivot Table
@bp.route("/pivot/<year>/<month>")
def api_pivot(year, month):
    validToken = checkAuth(request)
    if not validToken:
        return Response("Nice Try!", status=401)
    else:
        year_month = year + "-" + month    
        month = datetime.strptime(year_month, '%Y-%m')
        start_date = (month - timedelta(days=1)).date()
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
