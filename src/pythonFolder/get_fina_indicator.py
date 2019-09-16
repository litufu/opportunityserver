import os
import sys
import json
import time
import tushare as ts

pro = ts.pro_api('bf9ac3f395ddedda4e8be0cbc6243098ba839ca9a42c0170f44a1b20')
df = pro.fina_indicator(ts_code=sys.argv[1])
res = df.to_json(orient='records')
print(res)