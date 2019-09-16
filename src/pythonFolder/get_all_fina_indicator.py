import os
import sys
import json
import time
import tushare as ts

pro = ts.pro_api('bf9ac3f395ddedda4e8be0cbc6243098ba839ca9a42c0170f44a1b20')
df_companies = pro.stock_basic(exchange='', list_status='L', fields='ts_code,symbol')
goon = False
for ts_code in df_companies["ts_code"]:
    if ts_code.startswith("300263"):
        goon = True
    if goon:
        df = pro.fina_indicator(ts_code=ts_code)
        res = df.to_json(orient='records')
        print(res)
        time.sleep(5)