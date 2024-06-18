from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import mysql.connector
import logging

app = FastAPI()

# CORS設定を修正して、http://localhost:3001 も許可する
origins = ["http://localhost:3000", "http://localhost:3001"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_config = {
    'user': 'root',
    'password': 'example',
    'host': 'db',
    'database': 'pos_db'
}

class Product(BaseModel):
    product_id: int
    quantity: int

class Transaction(BaseModel):
    emp_cd: str
    store_cd: str
    pos_no: str
    total_amt: float
    ttl_amt_ex_tax: float
    products: List[Product]

@app.get("/lookup")
def lookup(barcode: str):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT PRD_ID as product_id, NAME as name, PRICE as price FROM products WHERE CODE = %s", (barcode,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if result:
        return result
    else:
        raise HTTPException(status_code=404, detail="Product not found")

@app.post("/transactions")
def create_transaction(transaction: Transaction):
    logging.info(f"Transaction data: {transaction}")
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO transactions (EMP_CD, STORE_CD, POS_NO, TOTAL_AMT, TTL_AMT_EX_TAX) VALUES (%s, %s, %s, %s, %s)",
            (transaction.emp_cd, transaction.store_cd, transaction.pos_no, transaction.total_amt, transaction.ttl_amt_ex_tax)
        )
        trd_id = cursor.lastrowid

        for product in transaction.products:
            cursor.execute(
                "INSERT INTO transaction_details (TRD_ID, PRD_ID, PRD_CODE, PRD_NAME, PRD_PRICE, TAX_CD) "
                "SELECT %s, PRD_ID, CODE, NAME, PRICE, '1' FROM products WHERE PRD_ID = %s",
                (trd_id, product.product_id)
            )

        conn.commit()

    except mysql.connector.Error as err:
        conn.rollback()
        logging.error(f"Transaction failed: {err}")
        raise HTTPException(status_code=400, detail=f"Transaction failed: {err}")

    finally:
        cursor.close()
        conn.close()

    return {"message": "Transaction created successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
