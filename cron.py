from datetime import datetime
from sqlalchemy import create_engine
import os

FLASK_DB_URI = os.environ.get("FLASK_DB_URI")
exitCode = os.system('../bin/run_cloud_sql_proxy')

# Create database connection
engine = create_engine(FLASK_DB_URI) 

# Function to insert each expense individually
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


today = datetime.now()
print(f"Today is the {today.day}th day of the month")

if today.day == 3:
    print("Loading recurring expenses...")
    expensesList = [
        {'vendor': 'Google Play', 'Amount': 1.99, 'broad_category_id': 5, 'narrow_category_id': 6, 'person_id': None, 'notes': ""},
        {'vendor': 'New York Times', 'Amount': 4, 'broad_category_id': 14, 'narrow_category_id': 47, 'person_id': None, 'notes': ""},
        {'vendor': 'Planned parenthood', 'Amount': 10, 'broad_category_id': 17, 'person_id': None, 'notes': ""},
        {'vendor': 'Xfinity', 'Amount': 45.00, 'broad_category_id': 7, 'narrow_category_id': 1, 'person_id': None, 'notes': ""},
        {'vendor': 'Ives HOA', 'Amount': 301, 'broad_category_id': 7, 'narrow_category_id': 38, 'person_id': None, 'notes': ""},
        {'vendor': 'Caliber', 'Amount': 1068.02, 'broad_category_id': 7, 'narrow_category_id': 39, 'person_id': None, 'notes': ""},
        {'vendor': 'Wells Student Loan', 'Amount': 151.54, 'broad_category_id': 15, 'person_id': None, 'notes': ""},
        {'vendor': 'Apple iCloud', 'Amount': 2.99, 'broad_category_id': 5, 'narrow_category_id': 6, 'person_id': None, 'notes': ""},
        {'vendor': 'Makespace', 'Amount': 325.21, 'broad_category_id': 1, 'narrow_category_id': 40, 'person_id': None, 'notes': ""},
        {'vendor': 'Spotify', 'Amount': 10.99, 'broad_category_id': 14, 'narrow_category_id': 46, 'person_id': None, 'notes': ""},
        {'vendor': 'Netflix', 'Amount': 9.90, 'broad_category_id': 14, 'narrow_category_id': 46, 'person_id': None, 'notes': ""},
        {'vendor': 'Xfinity Mobile', 'Amount': 36.20, 'broad_category_id': 5, 'narrow_category_id': 33, 'person_id': None, 'notes': ""} 
    ]
    for expense in expensesList:
        today_str = today.strftime("%m/%d/%Y")
        expense['Date'] = today_str
        insert_expense(expense)
else: print("Not loading expenses today...")
