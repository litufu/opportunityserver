const Papa = require('papaparse');
const fs = require('fs')
const {prisma} = require('../generated/prisma-client')

const companyDescFile = './src/initdata/data/company.csv'

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


addComapny()