import os
import sys

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from weezy_cbs.database import engine, Base, create_all_tables

if __name__ == "__main__":
    print("Starting Database Initialization...")
    create_all_tables()
    print("Database Initialization Complete.")
