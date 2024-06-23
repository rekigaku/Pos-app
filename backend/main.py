from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import mysql.connector
import logging
import os

app = FastAPI()

# ログ設定
logging.basicConfig(level=logging.INFO, filename='app.log', filemode='a',
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

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
    'user': os.environ['DB_USER'],
    'password': os.environ['DB_PASSWORD'],
    'host': os.environ['DB_HOST'],  # docker-compose で定義されたサービス名を使用
    'database': os.environ['DB_NAME'],
    'raise_on_warnings': True
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
        # ttl_amt_ex_taxの値を小数点以下2桁に丸める
        ttl_amt_ex_tax_rounded = round(transaction.ttl_amt_ex_tax, 2)
        logging.info(f"Rounded TTL_AMT_EX_TAX: {ttl_amt_ex_tax_rounded}")

        cursor.execute(
            "INSERT INTO transactions (EMP_CD, STORE_CD, POS_NO, TOTAL_AMT, TTL_AMT_EX_TAX) VALUES (%s, %s, %s, %s, %s)",
            (transaction.emp_cd, transaction.store_cd, transaction.pos_no, transaction.total_amt, ttl_amt_ex_tax_rounded)
        )
        trd_id = cursor.lastrowid
        logging.info(f"Inserted into transactions: {trd_id}")

        for product in transaction.products:
            cursor.execute(
                "INSERT INTO transaction_details (TRD_ID, PRD_ID, PRD_CODE, PRD_NAME, PRD_PRICE, TAX_CD) "
                "SELECT %s, PRD_ID, CODE, NAME, PRICE, '1' FROM products WHERE PRD_ID = %s",
                (trd_id, product.product_id)
            )
            logging.info(f"Inserted into transaction_details: TRD_ID={trd_id}, PRD_ID={product.product_id}")

        conn.commit()
        logging.info("Transaction committed successfully")

    except mysql.connector.Error as err:
        conn.rollback()
        logging.error(f"Transaction failed: {err}")
        raise HTTPException(status_code=400, detail=f"Transaction failed: {err}")

    finally:
        cursor.close()
        conn.close()

    return {"message": "Transaction created successfully"}
