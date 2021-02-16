from flaskr.expenses import insert_expense
from datetime import datetime

today = datetime.now()

if today.day == 1:
    expensesList = [
        {'vendor': 'Google Play', 'Amount': 1.99, 'broad_category_id': 5, 'narrow_category_id': 6}, 
        {'vendor': 'New York Times', 'Amount': 4, 'broad_category_id': 14, 'narrow_category_id': 47}, 
        {'vendor': 'Planned parenthood', 'Amount': 10, 'broad_category_id': 17}, 
        {'vendor': 'Xfinity', 'Amount': 45.00, 'broad_category_id': 7, 'narrow_category_id': 1}, 
        {'vendor': 'Ives HOA', 'Amount': 301, 'broad_category_id': 7, 'narrow_category_id': 38}, 
        {'vendor': 'Caliber', 'Amount': 1068.02, 'broad_category_id': 7, 'narrow_category_id': 39}, 
        {'vendor': 'Wells Student Loan', 'Amount': 151.54, 'broad_category_id': 15}, 
        {'vendor': 'Apple iCloud', 'Amount': 2.99, 'broad_category_id': 5, 'narrow_category_id': 6},
        {'vendor': 'Makespace', 'Amount': 325.21, 'broad_category_id': 1, 'narrow_category_id': 40},
        {'vendor': 'Spotify', 'Amount': 10.99, 'broad_category_id': 14, 'narrow_category_id': 46},
        {'vendor': 'Netflix', 'Amount': 9.90, 'broad_category_id': 14, 'narrow_category_id': 46},
        {'vendor': 'Xfinity Mobile', 'Amount': 36.20, 'broad_category_id': 5, 'narrow_category_id': 33}
    ]
    for expense in expensesList:
        today_str = today.strftime("%m/%d/%Y")
        expense.Date = today_str
        insert_expense(expense)

