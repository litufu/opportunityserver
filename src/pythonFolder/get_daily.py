import os
import sys
import json
import time
import tushare as ts
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Daily

pro = ts.pro_api('bf9ac3f395ddedda4e8be0cbc6243098ba839ca9a42c0170f44a1b20')
engine = create_engine('sqlite:///company.sqlite?check_same_thread=False')
DBSession = sessionmaker(bind=engine)
session = DBSession()


def get_dailies(start_date,end_date):
    df_date = pro.trade_cal(exchange='', start_date=start_date, end_date=end_date)
    df_date = df_date[df_date["is_open"]==1]
    for date in df_date["cal_date"]:
        df = pro.daily(trade_date=date)
        print(df)
        for i in range(len(df)):
            ts_code = df.iat[i, 0]
            trade_date = df.iat[i, 1]
            open = df.iat[i, 2]
            high = df.iat[i, 3]
            low = df.iat[i, 4]
            close = df.iat[i, 5]
            pre_close = df.iat[i, 6]
            change = df.iat[i, 7]
            pct_chg = df.iat[i, 8]
            vol = df.iat[i, 9]
            amount = df.iat[i, 10]
            daily = Daily(
                ts_code=ts_code,
                trade_date=trade_date,
                open=open,
                high=high,
                low=low,
                close=close,
                pre_close=pre_close,
                change=change,
                pct_chg=pct_chg,
                vol=vol,
                amount=amount,
            )
            session.add(daily)
        session.commit()


if __name__ == "__main__":
    # start_date = sys.argv[1]
    # end_date = sys.argv[2]
    get_dailies("20190801","20190912")