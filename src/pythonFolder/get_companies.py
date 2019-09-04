# -*- coding:utf-8 -*-

import tushare as ts

pro = ts.pro_api('bf9ac3f395ddedda4e8be0cbc6243098ba839ca9a42c0170f44a1b20')
data = pro.stock_basic(exchange='', list_status='L',
fields='symbol,name,area,industry,fullname,enname,market,exchange,curr_type,list_status,list_date,delist_date,is_hs')
res = data.to_json(orient='records')
print(res)