# -*- coding:utf-8 -*-

import os
import sys
import time
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import tushare as ts
from database import Company

pro = ts.pro_api('bf9ac3f395ddedda4e8be0cbc6243098ba839ca9a42c0170f44a1b20')
engine = create_engine('sqlite:///company.sqlite?check_same_thread=False')
DBSession = sessionmaker(bind=engine)
session = DBSession()

def get_desc_and_scope(symbol):
    if symbol.startswith("6"):
        code = "sh"+symbol
    else:
        code = "sz" + symbol
    headless = True
    chrome_options = Options()
    chrome_options.add_argument(
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36')
    if headless:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    driver = webdriver.Chrome(
        executable_path="C:\Program Files (x86)\Google\Chrome\Application\chromedriver.exe",
        options=chrome_options)
    driver.get(url='http://f10.eastmoney.com/f10_v2/BusinessAnalysis.aspx?code={}'.format(code))
    time.sleep(5)
    content = driver.find_element_by_id("templateDiv")
    sections = content.find_elements_by_class_name("section")
    scope = sections[0].find_element_by_class_name("content")
    desc = sections[2].find_element_by_class_name("content")
    res = {"scope":scope.text.strip(),"desc":desc.text.strip(),"symbol":symbol}
    # res_string = json.dumps(res)
    # print(res_string)
    # sys.stdout.flush()
    driver.close()
    return res
    



if __name__ == '__main__':
    data = pro.stock_basic(exchange='', list_status='L',fields='symbol')
    goon = False
    for symbol in data["symbol"]:
        print(symbol)
        if symbol == "688388":
            goon = True
        if goon:
            res = get_desc_and_scope(symbol)
            time.sleep(5)
            print(res)
            company = Company(scope=res["scope"],desc=res["desc"],code=symbol)
            session.add(company)
            session.commit()
    



