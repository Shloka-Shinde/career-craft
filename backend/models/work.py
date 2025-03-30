import psycopg2

# Connect to your database
conn = psycopg2.connect(
    host="db.vkopufpkafrfvdkdmtgk.supabase.co",
    database="postgres",
    user="postgres",
    password="Shloka@2004supabase",
    port="5432"
)

# Create a cursor
cur = conn.cursor()

# Get list of tables
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public'
""")
tables = cur.fetchall()

print("Available tables:")
for table in tables:
    print(table[0])

# For each table, show column info and some sample data
for table in tables:
    table_name = table[0]
    print(f"\nTable: {table_name}")
    
    # Get column info
    cur.execute(f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '{table_name}'
    """)
    columns = cur.fetchall()
    print("Columns:")
    for col in columns:
        print(f"  {col[0]} ({col[1]})")
    
    # Get sample data
    try:
        cur.execute(f"SELECT * FROM {table_name} LIMIT 5")
        sample_data = cur.fetchall()
        print("Sample rows:")
        for row in sample_data:
            print(row)
    except:
        print("Could not fetch sample data")

# Close connection
cur.close()
conn.close()