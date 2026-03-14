# CoreInventory Backend (Flask)

Flask API for managing products and stock moves.

## Setup
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install flask mysql-connector-python flask-cors`
4. Run: `python app.py`

## Features
- All data is stored in the `core_inventory` database (MySQL via XAMPP).
- Every stock change is recorded as a `stock_move`.
