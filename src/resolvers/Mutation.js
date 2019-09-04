const { spawn, spawnSync} = require('child_process');
const path = require('path')
const _ = require('lodash');


const Mutation = {
  getCompanies:async (parent,args, ctx) => {
    const getCompaniesPath = path.join(path.resolve(__dirname, '..'), './pythonFolder/get_companies.py')
    // 1/获取公司股票列表
    const getCompaniesListProcess = spawn('python',[getCompaniesPath]);
    getCompaniesListProcess.stdout.on('data', async (data) => {
        res = JSON.parse(data)
        if(Array.isArray(res)){
            for (let i=0;i<res.length;i++) {
                const symbol = res[i].symbol
                const name = res[i].name
                const area = res[i].area
                const industry = res[i].industry
                const enname = res[i].enname
                const fullname = res[i].fullname
                const market = res[i].market
                const exchange = res[i].exchange
                const currType = res[i].curr_type
                const listStatus = res[i].list_status
                const listDate = res[i].list_date
                const delistDate = res[i].delist_date
                const isHS = res[i].is_hs
              await ctx.prisma.upsertCompany({
                  where:{symbol},
                  create:{
                    symbol,
                    name,
                    area,
                    industry,
                    enname,
                    fullname,
                    market,
                    exchange,
                    currType,
                    listStatus,
                    listDate,
                    delistDate,
                    isHS   
                  },
                  update:{
                    name,
                    area,
                    industry,
                    enname,
                    fullname,
                    market,
                    exchange,
                    currType,
                    listStatus,
                    listDate,
                    delistDate,
                    isHS 
                  }
              })
            }
          }
    });
    getCompaniesListProcess.stderr.on('data', (data) => {
      throw new Error(`获取公司列表信息失败${data}`)
    });
    
    return true
  },
  updateCompanyScopAndDesc:async (parent,args, ctx) => {
      const scopeAndDescPath = path.join(path.resolve(__dirname, '..'), './pythonFolder/get_scope_and_desc.py')
      const getCompanyScopeAndDescProcess = spawn('python',[scopeAndDescPath]);
      getCompanyScopeAndDescProcess.stdout.on('data', async (data) => {
        res = JSON.parse(data)
        await ctx.prisma.updateCompany({
          where:{symbol:res.symbol},
          data:{
            scope:res.scope,
            desc:res.desc,
          }
        })
      })
      getCompanyScopeAndDescProcess.stderr.on('data', (data) => {
          throw new Error(`获取公司经营范围失败${data}`)
        });
       
      return true
  }
}

module.exports = {
  Mutation,
}