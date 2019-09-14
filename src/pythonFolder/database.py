# -*- coding:utf-8 -*-

import os
import sys
from sqlalchemy import Column, DateTime, String, Integer, ForeignKey, func,Boolean,Float
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine

Base = declarative_base()


# 财务报表科目
class Company(Base):
    __tablename__ = 'company'
    id = Column(Integer, primary_key=True)
    code = Column(String)
    scope = Column(String)
    desc = Column(String)

# 财务报表科目
class Daily(Base):
    __tablename__ = 'daily'
    id = Column(Integer, primary_key=True)
    ts_code = Column(String)
    trade_date = Column(String)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    pre_close = Column(Float)
    change = Column(Float)
    pct_chg = Column(Float)
    vol = Column(Float)
    amount = Column(Float)

      
if __name__ == "__main__":
    engine = create_engine('sqlite:///company.sqlite?check_same_thread=False')  
    Base.metadata.create_all(engine)
