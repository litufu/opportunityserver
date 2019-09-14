const { spawn, spawnSync} = require('child_process');
const path = require('path')
const _ = require('lodash');
const fetch = require('node-fetch');

const { parseDate,parseSinaStock,getToday } = require('../utils')


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
      await getCompanies()
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
  },
  createProduct:async (parent,{name,introduce}, ctx) => {
      const products = await ctx.prisma.products({where:{name}})
      if(products.length>0){
        throw new Error("该产品已经存在，无需重复输入")
      }
      return ctx.prisma.createProduct({
        name,
        introduce
      })
  },
  createCompanyProduct:async (parent,{name,introduce}, ctx) => {
    const products = await ctx.prisma.companyProducts({where:{name}})
    if(products.length>0){
      throw new Error("该产品已经存在，无需重复输入")
    }
    return ctx.prisma.createCompanyProduct({
      name,
      introduce
    })
},
  createIndustry:async (parent,{name,desc}, ctx) => {
    const industries = await ctx.prisma.industries({
      where:{name}
    })
    if(industries.length>0){
      throw new Error("该行业已经存在，无需重复输入")
    }
    return ctx.prisma.createIndustry({
      name,
      desc
    })
},
  productLinkIndustry:async (parent,{industryName,productName,deal}, ctx) => {
    let newIndustry
    if(deal==="purchase"){
      newIndustry = await ctx.prisma.updateIndustry({
        where:{name:industryName},
        data:{purchases:{connect:{name:productName}}}
      })
    }else if(deal==="sell"){
      newIndustry = await ctx.prisma.updateIndustry({
        where:{name:industryName},
        data:{selles:{connect:{name:productName}}}
      })
    }else{
      throw new Error("交易性质错误")
    }
    return newIndustry
  },
  productLinkCompany:async (parent,{CompanyName,productName,deal}, ctx) => {
    let newCompany
    if(deal==="purchase"){
      newCompany = await ctx.prisma.updateCompany({
        where:{name:CompanyName},
        data:{purchases:{connect:{name:productName}}}
      })
    }else if(deal==="sell"){
      newCompany = await ctx.prisma.updateCompany({
        where:{name:CompanyName},
        data:{selles:{connect:{name:productName}}}
      })
    }else{
      throw new Error("交易性质错误")
    }
    return newCompany
  },
  companyLinkIndustry:async (parent,{companyNames,industryName}, ctx) => {
    const companyConnectNames = companyNames.map(companyName=>({name:companyName}))
    return ctx.prisma.updateIndustry({
      where:{name:industryName},
      data:{companies:{connect:companyConnectNames}}
    })
  },
  industryResearch:async (parent,{industryName,research}, ctx) => {
    return ctx.prisma.updateIndustry({
      where:{name:industryName},
      data:{researches:{create:{desc:research}}}
    })
  },
  addKeyword:async (parent,{keyword}, ctx) => {
    return ctx.prisma.createKeyword({
      name:keyword,
    })
  },
  addIndustryInfluence:async (parent,{industryName,keyword,keywordDirection,kind,desc,direction}, ctx) => {
    console.log(industryName)
    const industryInfluences = await ctx.prisma.industryInfluences({
      where:{
        AND:[
          {keyword:{name:keyword}},
          {keywordDirection},
          {industry:{name:industryName}}
        ]
      }
    })
    if(industryInfluences.length>0){
      throw new Error("已经存储过该关键因素的影响了")
    }
    return ctx.prisma.createIndustryInfluence({
      kind,
      desc,
      direction,
      keywordDirection,
      keyword:{connect:{name:keyword}},
      industry:{connect:{name:industryName}}
    })
  },
  addCompanyComment:async (parent,{companyName,comment}, ctx) => {
    return ctx.prisma.createComment({
      company:{connect:{name:companyName}},
      desc:comment
    })
  },
  addDailyFromTushare: async (parent,{startDate,endDate},ctx)=>{
    const getDailyPath = path.join(path.resolve(__dirname, '..'), './pythonFolder/get_daily.py')
    const getDailyProcess = spawn('python',[getDailyPath,startDate,endDate]);
    getDailyProcess.stdout.on('data', async (data) => {
      try {
        res = JSON.parse(data)
        if(Array.isArray(res)){
            for (let i=0;i<res.length;i++) {
                const companySymbol = _.split(res[i].ts_code, ".")[0]
                const tradeDate = parseDate(res[i].trade_date)
                const open = res[i].open  
                const high = res[i].high
                const low = res[i].low
                const close = res[i].close
                const preClose = res[i].pre_close  
                const change = res[i].change
                const pctChg = res[i].pct_chg  
                const vol = res[i].vol
                const amount = res[i].amount
                const dailies = await ctx.prisma.dailies({
                  where:{
                      AND:[
                        {symbol:companySymbol},
                        {tradeDate}
                    ]
                  }
                })
                if(dailies.length>0){
                  await ctx.prisma.updateDaily({
                    where:{id:dailies[0].id},
                    data:{
                      open,
                      high,
                      low,
                      close,
                      preClose,
                      change,
                      pctChg,
                      vol,
                      amount
                    }
                  })
                }else{
                  await ctx.prisma.createDaily({
                    company:{connect:{symbol:companySymbol}},
                    symbol:companySymbol,
                    tradeDate,
                    open,
                    high,
                    low,
                    close,
                    preClose,
                    change,
                    pctChg,
                    vol,
                    amount
                  })
                }
              }
            }
      }
      catch(err) {
          console.log('------------')
          console.log(data.toString())
          console.log('------------')
          console.log(err)
      }
    });
    getDailyProcess.stderr.on('data', (data) => {
      throw new Error(`获取交易信息失败${data}`)
    });
    getDailyProcess.on('exit', (code) => {
      if(code!==0){
        throw new Error(`客户信息下载失败，请确认客户名称是否正确`)
      }else{
        console.log("添加日交易记录完成")
      }
    });
    
    return true
  },
  addCurrentDaily: async (parent,args,ctx)=>{
    // 从sina获取当前时间的所有股票交易数据
    const companies = await ctx.prisma.companies()
    let symbols = []
    for(const company of companies){
      let symbol = company.symbol
      let marketSymbol
      if(_.startsWith(symbol,"6")){
        marketSymbol = "sh"+symbol
      }else{
        marketSymbol = 'sz'+symbol
      }
      symbols.push(marketSymbol)
      if(symbols.length==100){
        const symbolsStr = _.join(symbols,',')
        const url = `http://hq.sinajs.cn/list=${symbolsStr}`
        const res = await fetch(url)
        const text = await res.text();
        const results = parseSinaStock(text)
        for(const result of results){
          const dailies = await ctx.prisma.dailies({
            where:{
              AND:[
              {symbol:result.symbol},
              {tradeDate:getToday()}
            ]
            }
          })
          let daily
          if(dailies.length>0){
            daily = await ctx.prisma.updateDaily({
              where:{id:dailies[0].id},
              data:{
                open:result.open,
                high:result.high,
                low:result.low,
                close:result.close,
                preClose:result.preClose,
                vol:result.vol,
                amount:result.amount
              }
            })
          }else{
            daily = await ctx.prisma.createDaily({
              company:{connect:{symbol:result.symbol}},
              symbol:result.symbol,
              tradeDate:getToday(),
              open:result.open,
              high:result.high,
              low:result.low,
              close:result.close,
              preClose:result.preClose,
              vol:result.vol,
              amount:result.amount
            })
          }
        }
        symbols=[]
      }
    }
    
    return true
  },
}

module.exports = {
  Mutation,
}