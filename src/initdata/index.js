const Papa = require('papaparse');
const fs = require('fs')
const _ = require('lodash');
const {prisma} = require('../generated/prisma-client')

const companyDescFile = './src/initdata/data/company.csv'
const dailyFile = './src/initdata/data/daily.csv'

const readFile = function (fileName, encode) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, encode, function (error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};

const parseCsv = function (data) {
  return new Promise(function (resolve, reject) {
    Papa.parse(data, {
      complete: function (results) {
        resolve(results);
      }
    });
  });
};

const parseDate = (date) => {
  // 将20120202字符串转换为日期格式
  const year = parseInt(date.slice(0,4))
  const month = parseInt(date.slice(4,6))
  const day = parseInt(date.slice(6,8))
  const d = new Date(year,month-1,day)
  return d
}

// 添加公司描述信息

async function addComapny() {
  try {
    const file = await readFile(companyDescFile, 'utf8')
    const results = await parseCsv(file)
    for (const value of results.data) {
      try {
        const company  = await prisma.updateCompany({
            where:{symbol:value[2]},
            data:{
              scope:value[3],
              desc:value[4],
            }
          })
        
        console.log(company);
      } catch (err) {
        console.log(err)
        continue
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function addDaily() {
  try {
    const file = await readFile(dailyFile, 'utf8')
    const results = await parseCsv(file)
    for (const value of results.data) {
      try {
        const symbol = _.split(value[2], ".")[0]
        const tradeDate = parseDate(value[3])
        const open = parseFloat(value[4]) 
        const high = parseFloat(value[5])
        const low = parseFloat(value[6])
        const close = parseFloat(value[7])
        const preClose = parseFloat(value[8])
        const change = parseFloat(value[9])
        const pctChg = parseFloat(value[10])
        const vol = parseFloat(value[11])
        const amount = parseFloat(value[12])
        const daily  = await prisma.createDaily({
            symbol,
            tradeDate,
            open,
            high,
            low,
            close,
            preClose,
            change,
            pctChg,
            vol,
            amount,
            company:{connect:{symbol}}
          })
        
        console.log(daily);
      } catch (err) {
        console.log(err)
        continue
      }
    }
  } catch (err) {
    console.log(err);
  }
}


// addComapny()
addDaily()