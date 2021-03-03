from flaskr.expenses import insert_expense
from datetime import datetime

today = datetime.now()

print(f"Today is the {today.day}th day of the month")

if today.day == 2:
    print("Loading recurring expenses...")
    expensesList = [
        {'vendor': 'Google Play', 'Amount': 1.99, 'broad_category_id': 5, 'narrow_category_id': 6, 'person_id': None}, 
        {'vendor': 'New York Times', 'Amount': 4, 'broad_category_id': 14, 'narrow_category_id': 47, 'person_id': None}, 
        {'vendor': 'Planned parenthood', 'Amount': 10, 'broad_category_id': 17, 'person_id': None}, 
        {'vendor': 'Xfinity', 'Amount': 45.00, 'broad_category_id': 7, 'narrow_category_id': 1, 'person_id': None}, 
        {'vendor': 'Ives HOA', 'Amount': 301, 'broad_category_id': 7, 'narrow_category_id': 38, 'person_id': None}, 
        {'vendor': 'Caliber', 'Amount': 1068.02, 'broad_category_id': 7, 'narrow_category_id': 39, 'person_id': None}, 
        {'vendor': 'Wells Student Loan', 'Amount': 151.54, 'broad_category_id': 15, 'person_id': None}, 
        {'vendor': 'Apple iCloud', 'Amount': 2.99, 'broad_category_id': 5, 'narrow_category_id': , 'person_id': None6},
        {'vendor': 'Makespace', 'Amount': 325.21, 'broad_category_id': 1, 'narrow_category_id': 4, 'person_id': None0},
        {'vendor': 'Spotify', 'Amount': 10.99, 'broad_category_id': 14, 'narrow_category_id': 4, 'person_id': None6},
        {'vendor': 'Netflix', 'Amount': 9.90, 'broad_category_id': 14, 'narrow_category_id': 4, 'person_id': None6},
        {'vendor': 'Xfinity Mobile', 'Amount': 36.20, 'broad_category_id': 5, 'narrow_category_id': , 'person_id': None33}
    ]
    for expense in expensesList:
        today_str = today.strftime("%m/%d/%Y")
        expense['Date'] = today_str
        insert_expense(expense)
else: print("Not loading expenses today...")
