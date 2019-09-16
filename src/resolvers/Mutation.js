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
          console.log(data.toString())
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
        console.log(url)
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
  addFinaIndicator: async (parent,{code},ctx)=>{
    console.log(code)
    if(_.startsWith(code,"6")){
      marketSymbol = code + ".SH"
    }else{
      marketSymbol = code + ".SZ"
    }
    const getFinaIndicatorPath = path.join(path.resolve(__dirname, '..'), './pythonFolder/get_fina_indicator.py')
    const getFinaIndicatorProcess = spawn('python',[getFinaIndicatorPath,marketSymbol]);
    getFinaIndicatorProcess.stdout.on('data', async (data) => {
      try {
        res = JSON.parse(data)
        if(Array.isArray(res)){
            for (let i=0;i<res.length;i++) {
                const symbol = _.split(res[i].ts_code, ".")[0]
                const annDate = parseDate(res[i].ann_date)
                const endDate = parseDate(res[i].end_date)
                const eps = res[i].eps  
                const dtEps = res[i].dt_eps
                const totalRevenuePs = res[i].total_revenue_ps
                const revenuePs = res[i].revenue_ps
                const capitalResePs = res[i].capital_rese_ps  
                const surplusResePs = res[i].surplus_rese_ps
                const undistProfitPs = res[i].undist_profit_ps  
                const extraItem = res[i].extra_item
                const profitDedt = res[i].profit_dedt
                const grossMargin = res[i].gross_margin
                const currentRatio = res[i].current_ratio
                const quickRatio = res[i].quick_ratio
                const cashRatio = res[i].cash_ratio
                const invturnDays = res[i].invturn_days
                const arturnDays = res[i].arturn_days
                const invTurn = res[i].inv_turn
                const arTurn = res[i].ar_turn
                const caTurn = res[i].ca_turn
                const faTurn = res[i].fa_turn
                const assetsTurn = res[i].assets_turn
                const opIncome = res[i].op_income
                const valuechangeIncome = res[i].valuechange_income
                const interstIncome = res[i].interst_income
                const daa = res[i].daa
                const ebit = res[i].ebit
                const ebitda = res[i].ebitda
                const fcff = res[i].fcff
                const fcfe = res[i].fcfe
                const currentExint = res[i].current_exint
                const noncurrentExint = res[i].noncurrent_exint
                const interestdebt = res[i].interestdebt
                const netdebt = res[i].netdebt
                const tangibleAsset = res[i].tangible_asset
                const workingCapital = res[i].working_capital
                const networkingCapital = res[i].networking_capital
                const investCapital = res[i].invest_capital
                const retainedEarnings = res[i].retained_earnings
                const diluted2Eps = res[i].diluted2_eps
                const bps = res[i].bps
                const ocfps = res[i].ocfps
                const retainedps = res[i].retainedps
                const cfps = res[i].cfps
                const ebitPs = res[i].ebit_ps
                const fcffPs = res[i].fcff_ps
                const fcfePs = res[i].fcfe_ps
                const netprofitMargin = res[i].netprofit_margin
                const grossprofitMargin = res[i].grossprofit_margin
                const cogsOfSales = res[i].cogs_of_sales
                const expenseOfSales = res[i].expense_of_sales
                const profitToGr = res[i].profit_to_gr
                const saleexpToGr = res[i].saleexp_to_gr
                const adminexpOfGr = res[i].adminexp_of_gr
                const finaexpOfGr = res[i].finaexp_of_gr
                const impaiTtm = res[i].impai_ttm
                const gcOfGr = res[i].gc_of_gr
                const opOfGr = res[i].op_of_gr
                const ebitOfGr = res[i].ebit_of_gr
                const roe = res[i].roe
                const roeWaa = res[i].roe_waa
                const roeDt = res[i].roe_dt
                const roa = res[i].roa
                const npta = res[i].npta
                const roic = res[i].roic
                const roeYearly = res[i].roe_yearly
                const roa2Yearly = res[i].roa2_yearly
                const roeAvg = res[i].roe_avg
                const opincomeOfEbt = res[i].opincome_of_ebt
                const investincomeOfEbt = res[i].investincome_of_ebt
                const nOpProfitOfEbt = res[i].n_op_profit_of_ebt
                const taxToEbt = res[i].tax_to_ebt
                const dtprofitToProfit = res[i].dtprofit_to_profit
                const salescashToOr = res[i].salescash_to_or
                const ocfToOr = res[i].ocf_to_or
                const ocfToOpincome = res[i].ocf_to_opincome
                const capitalizedToDa = res[i].capitalized_to_da
                const debtToAssets = res[i].debt_to_assets
                const assetsToEqt = res[i].assets_to_eqt
                const dpAssetsToEqt = res[i].dp_assets_to_eqt
                const caToAssets = res[i].ca_to_assets
                const ncaToAssets = res[i].nca_to_assets
                const tbassetsToTotalassets = res[i].tbassets_to_totalassets
                const intToTalcap = res[i].int_to_talcap
                const eqtToTalcapital = res[i].eqt_to_talcapital
                const currentdebtToDebt = res[i].currentdebt_to_debt
                const longdebToDebt = res[i].longdeb_to_debt
                const ocfToShortdebt = res[i].ocf_to_shortdebt
                const debtToEqt = res[i].debt_to_eqt
                const eqtToDebt = res[i].eqt_to_debt
                const eqtToInterestdebt = res[i].eqt_to_interestdebt
                const tangibleassetToDebt = res[i].tangibleasset_to_debt
                const tangassetToIntdebt = res[i].tangasset_to_intdebt
                const tangibleassetToNetdebt = res[i].tangibleasset_to_netdebt
                const ocfToDebt = res[i].ocf_to_debt
                const ocfToInterestdebt = res[i].ocf_to_interestdebt
                const ocfToNetdebt = res[i].ocf_to_netdebt
                const ebitToInterest = res[i].ebit_to_interest
                const longdebtToWorkingcapital = res[i].longdebt_to_workingcapital
                const ebitdaToDebt = res[i].ebitda_to_debt
                const turnDays = res[i].turn_days
                const roaYearly = res[i].roa_yearly
                const roaDp = res[i].roa_dp
                const fixedAssets = res[i].fixed_assets
                const profitPrefinExp = res[i].profit_prefin_exp
                const nonOpProfit = res[i].non_op_profit
                const opToEbt = res[i].op_to_ebt
                const nopToEbt = res[i].nop_to_ebt
                const ocfToProfit = res[i].ocf_to_profit
                const cashToLiqdebt = res[i].cash_to_liqdebt
                const cashToLiqdebtWithinterest = res[i].cash_to_liqdebt_withinterest
                const opToLiqdebt = res[i].op_to_liqdebt
                const opToDebt = res[i].op_to_debt
                const roicYearly = res[i].roic_yearly
                const totalFaTrun = res[i].total_fa_trun
                const profitToOp = res[i].profit_to_op
                const qOpincome = res[i].q_opincome
                const qInvestincome = res[i].q_investincome
                const qDtprofit = res[i].q_dtprofit
                const qEps = res[i].q_eps
                const qNetprofitMargin = res[i].q_netprofit_margin
                const qGsprofitMargin = res[i].q_gsprofit_margin
                const qExpToSales = res[i].q_exp_to_sales
                const qProfitToGr = res[i].q_profit_to_gr
                const qSaleexpToGr = res[i].q_saleexp_to_gr
                const qAdminexpToGr = res[i].q_adminexp_to_gr
                const qFinaexpToGr = res[i].q_finaexp_to_gr
                const qImpairToGrTtm = res[i].q_impair_to_gr_ttm
                const qGcToGr = res[i].q_gc_to_gr
                const qOpToGr = res[i].q_op_to_gr
                const qRoe = res[i].q_roe
                const qDtRoe = res[i].q_dt_roe
                const qNpta = res[i].q_npta
                const qOpincomeToEbt = res[i].q_opincome_to_ebt
                const qInvestincomeToEbt = res[i].q_investincome_to_ebt
                const qDtprofitToProfit = res[i].q_dtprofit_to_profit
                const qSalescashToOr = res[i].q_salescash_to_or
                const qOcfToSales = res[i].q_ocf_to_sales
                const qOcfToOr = res[i].q_ocf_to_or
                const basicEpsYoy = res[i].basic_eps_yoy
                const dtEpsYoy = res[i].dt_eps_yoy
                const cfpsYoy = res[i].cfps_yoy
                const opYoy = res[i].op_yoy
                const ebtYoy = res[i].ebt_yoy
                const netprofitYoy = res[i].netprofit_yoy
                const dtNetprofitYoy = res[i].dt_netprofit_yoy
                const ocfYoy = res[i].ocf_yoy
                const roeYoy = res[i].roe_yoy
                const bpsYoy = res[i].bps_yoy
                const assetsYoy = res[i].assets_yoy
                const eqtYoy = res[i].eqt_yoy
                const trYoy = res[i].tr_yoy
                const orYoy = res[i].or_yoy
                const qGrYoy = res[i].q_gr_yoy
                const qGrQoq = res[i].q_gr_qoq
                const qSalesYoy = res[i].q_sales_yoy
                const qSalesQoq = res[i].q_sales_qoq
                const qOpYoy = res[i].q_op_yoy
                const qOpQoq = res[i].q_op_qoq
                const qProfitYoy = res[i].q_profit_yoy
                const qProfitQoq = res[i].q_profit_qoq
                const qNetprofitYoy = res[i].q_netprofit_yoy
                const qNetprofitQoq = res[i].q_netprofit_qoq
                const equityYoy = res[i].equity_yoy
                const rdExp = res[i].rd_exp
                const updateFlag = res[i].update_flag

                const finaIndicators = await ctx.prisma.finaIndicators({
                  where:{
                      AND:[
                        {symbol},
                        {endDate}
                    ]
                  }
                })
                const newData = {
                    eps,  dtEps,  totalRevenuePs,  revenuePs,  capitalResePs,  surplusResePs,  undistProfitPs,  extraItem,
                    profitDedt,  grossMargin,  currentRatio,  quickRatio,  cashRatio,  invturnDays,  arturnDays,  invTurn,
                    arTurn,  caTurn,  faTurn,  assetsTurn,  opIncome,  valuechangeIncome,  interstIncome,  daa,  ebit,
                    ebitda,  fcff,  fcfe,  currentExint,  noncurrentExint,  interestdebt,  netdebt,  tangibleAsset,
                    workingCapital,  networkingCapital,  investCapital,  retainedEarnings,  diluted2Eps,  bps,  ocfps,
                    retainedps,  cfps,  ebitPs,  fcffPs,  fcfePs,  netprofitMargin,  grossprofitMargin,  cogsOfSales,  expenseOfSales,
                    profitToGr,  saleexpToGr,  adminexpOfGr,  finaexpOfGr,  impaiTtm,  gcOfGr,  opOfGr,  ebitOfGr,  roe,
                    roeWaa,  roeDt,  roa,  npta,  roic,  roeYearly,  roa2Yearly,  roeAvg,  opincomeOfEbt,  investincomeOfEbt,
                    nOpProfitOfEbt,  taxToEbt,  dtprofitToProfit,  salescashToOr,  ocfToOr,  ocfToOpincome,  capitalizedToDa,
                    debtToAssets,  assetsToEqt,  dpAssetsToEqt,  caToAssets,  ncaToAssets,  tbassetsToTotalassets,  intToTalcap,
                    eqtToTalcapital,  currentdebtToDebt,  longdebToDebt,  ocfToShortdebt,  debtToEqt,  eqtToDebt,  eqtToInterestdebt,
                    tangibleassetToDebt,  tangassetToIntdebt,  tangibleassetToNetdebt,  ocfToDebt,  ocfToInterestdebt,
                    ocfToNetdebt,  ebitToInterest,  longdebtToWorkingcapital,  ebitdaToDebt,  turnDays,  roaYearly,
                    roaDp,  fixedAssets,  profitPrefinExp,  nonOpProfit,  opToEbt,  nopToEbt,  ocfToProfit,  cashToLiqdebt,
                    cashToLiqdebtWithinterest,  opToLiqdebt,  opToDebt,  roicYearly,  totalFaTrun,  profitToOp,  qOpincome,
                    qInvestincome,  qDtprofit,  qEps,  qNetprofitMargin,  qGsprofitMargin,  qExpToSales,  qProfitToGr,
                    qSaleexpToGr,  qAdminexpToGr,  qFinaexpToGr,  qImpairToGrTtm,  qGcToGr,  qOpToGr,  qRoe,  qDtRoe,
                    qNpta,  qOpincomeToEbt,  qInvestincomeToEbt,  qDtprofitToProfit,  qSalescashToOr,  qOcfToSales,
                    qOcfToOr,  basicEpsYoy,  dtEpsYoy,  cfpsYoy,  opYoy,  ebtYoy,  netprofitYoy,  dtNetprofitYoy,
                    ocfYoy,  roeYoy,  bpsYoy,  assetsYoy,  eqtYoy,  trYoy,  orYoy,  qGrYoy,  qGrQoq,  qSalesYoy,
                    qSalesQoq,  qOpYoy,  qOpQoq,  qProfitYoy,  qProfitQoq,  qNetprofitYoy,  qNetprofitQoq,  equityYoy,  rdExp,
                    updateFlag }

                if(finaIndicators.length>0){
                  await ctx.prisma.updateFinaIndicator({
                    where:{id:finaIndicators[0].id},
                    data:newData
                  })
                }else{
                  await ctx.prisma.createFinaIndicator({
                    company:{connect:{symbol}},
                    symbol,
                    annDate,
                    endDate,
                    ...newData
                  })
                }
              }
            }
      }
      catch(err) {
          console.log(data.toString())
          console.log(err)
      }
    });
    getFinaIndicatorProcess.stderr.on('data', (data) => {
      throw new Error(`获取交易信息失败${data}`)
    });
    getFinaIndicatorProcess.on('exit', (code) => {
      if(code!==0){
        throw new Error(`客户信息下载失败，请确认客户名称是否正确`)
      }else{
        console.log("添加日交易记录完成")
      }
    });
    
    return true
  },
  addAllFinaIndicator: async (parent,args,ctx)=>{
    
    const getAllFinaIndicatorPath = path.join(path.resolve(__dirname, '..'), './pythonFolder/get_all_fina_indicator.py')
    const getAllFinaIndicatorProcess = spawn('python',[getAllFinaIndicatorPath]);
    getAllFinaIndicatorProcess.stdout.on('data', async (data) => {
      try {
        res = JSON.parse(data)
        if(Array.isArray(res)){
            for (let i=0;i<res.length;i++) {
                const symbol = _.split(res[i].ts_code, ".")[0]
                console.log(symbol)
                const annDate = parseDate(res[i].ann_date)
                const endDate = parseDate(res[i].end_date)
                const eps = res[i].eps  
                const dtEps = res[i].dt_eps
                const totalRevenuePs = res[i].total_revenue_ps
                const revenuePs = res[i].revenue_ps
                const capitalResePs = res[i].capital_rese_ps  
                const surplusResePs = res[i].surplus_rese_ps
                const undistProfitPs = res[i].undist_profit_ps  
                const extraItem = res[i].extra_item
                const profitDedt = res[i].profit_dedt
                const grossMargin = res[i].gross_margin
                const currentRatio = res[i].current_ratio
                const quickRatio = res[i].quick_ratio
                const cashRatio = res[i].cash_ratio
                const invturnDays = res[i].invturn_days
                const arturnDays = res[i].arturn_days
                const invTurn = res[i].inv_turn
                const arTurn = res[i].ar_turn
                const caTurn = res[i].ca_turn
                const faTurn = res[i].fa_turn
                const assetsTurn = res[i].assets_turn
                const opIncome = res[i].op_income
                const valuechangeIncome = res[i].valuechange_income
                const interstIncome = res[i].interst_income
                const daa = res[i].daa
                const ebit = res[i].ebit
                const ebitda = res[i].ebitda
                const fcff = res[i].fcff
                const fcfe = res[i].fcfe
                const currentExint = res[i].current_exint
                const noncurrentExint = res[i].noncurrent_exint
                const interestdebt = res[i].interestdebt
                const netdebt = res[i].netdebt
                const tangibleAsset = res[i].tangible_asset
                const workingCapital = res[i].working_capital
                const networkingCapital = res[i].networking_capital
                const investCapital = res[i].invest_capital
                const retainedEarnings = res[i].retained_earnings
                const diluted2Eps = res[i].diluted2_eps
                const bps = res[i].bps
                const ocfps = res[i].ocfps
                const retainedps = res[i].retainedps
                const cfps = res[i].cfps
                const ebitPs = res[i].ebit_ps
                const fcffPs = res[i].fcff_ps
                const fcfePs = res[i].fcfe_ps
                const netprofitMargin = res[i].netprofit_margin
                const grossprofitMargin = res[i].grossprofit_margin
                const cogsOfSales = res[i].cogs_of_sales
                const expenseOfSales = res[i].expense_of_sales
                const profitToGr = res[i].profit_to_gr
                const saleexpToGr = res[i].saleexp_to_gr
                const adminexpOfGr = res[i].adminexp_of_gr
                const finaexpOfGr = res[i].finaexp_of_gr
                const impaiTtm = res[i].impai_ttm
                const gcOfGr = res[i].gc_of_gr
                const opOfGr = res[i].op_of_gr
                const ebitOfGr = res[i].ebit_of_gr
                const roe = res[i].roe
                const roeWaa = res[i].roe_waa
                const roeDt = res[i].roe_dt
                const roa = res[i].roa
                const npta = res[i].npta
                const roic = res[i].roic
                const roeYearly = res[i].roe_yearly
                const roa2Yearly = res[i].roa2_yearly
                const roeAvg = res[i].roe_avg
                const opincomeOfEbt = res[i].opincome_of_ebt
                const investincomeOfEbt = res[i].investincome_of_ebt
                const nOpProfitOfEbt = res[i].n_op_profit_of_ebt
                const taxToEbt = res[i].tax_to_ebt
                const dtprofitToProfit = res[i].dtprofit_to_profit
                const salescashToOr = res[i].salescash_to_or
                const ocfToOr = res[i].ocf_to_or
                const ocfToOpincome = res[i].ocf_to_opincome
                const capitalizedToDa = res[i].capitalized_to_da
                const debtToAssets = res[i].debt_to_assets
                const assetsToEqt = res[i].assets_to_eqt
                const dpAssetsToEqt = res[i].dp_assets_to_eqt
                const caToAssets = res[i].ca_to_assets
                const ncaToAssets = res[i].nca_to_assets
                const tbassetsToTotalassets = res[i].tbassets_to_totalassets
                const intToTalcap = res[i].int_to_talcap
                const eqtToTalcapital = res[i].eqt_to_talcapital
                const currentdebtToDebt = res[i].currentdebt_to_debt
                const longdebToDebt = res[i].longdeb_to_debt
                const ocfToShortdebt = res[i].ocf_to_shortdebt
                const debtToEqt = res[i].debt_to_eqt
                const eqtToDebt = res[i].eqt_to_debt
                const eqtToInterestdebt = res[i].eqt_to_interestdebt
                const tangibleassetToDebt = res[i].tangibleasset_to_debt
                const tangassetToIntdebt = res[i].tangasset_to_intdebt
                const tangibleassetToNetdebt = res[i].tangibleasset_to_netdebt
                const ocfToDebt = res[i].ocf_to_debt
                const ocfToInterestdebt = res[i].ocf_to_interestdebt
                const ocfToNetdebt = res[i].ocf_to_netdebt
                const ebitToInterest = res[i].ebit_to_interest
                const longdebtToWorkingcapital = res[i].longdebt_to_workingcapital
                const ebitdaToDebt = res[i].ebitda_to_debt
                const turnDays = res[i].turn_days
                const roaYearly = res[i].roa_yearly
                const roaDp = res[i].roa_dp
                const fixedAssets = res[i].fixed_assets
                const profitPrefinExp = res[i].profit_prefin_exp
                const nonOpProfit = res[i].non_op_profit
                const opToEbt = res[i].op_to_ebt
                const nopToEbt = res[i].nop_to_ebt
                const ocfToProfit = res[i].ocf_to_profit
                const cashToLiqdebt = res[i].cash_to_liqdebt
                const cashToLiqdebtWithinterest = res[i].cash_to_liqdebt_withinterest
                const opToLiqdebt = res[i].op_to_liqdebt
                const opToDebt = res[i].op_to_debt
                const roicYearly = res[i].roic_yearly
                const totalFaTrun = res[i].total_fa_trun
                const profitToOp = res[i].profit_to_op
                const qOpincome = res[i].q_opincome
                const qInvestincome = res[i].q_investincome
                const qDtprofit = res[i].q_dtprofit
                const qEps = res[i].q_eps
                const qNetprofitMargin = res[i].q_netprofit_margin
                const qGsprofitMargin = res[i].q_gsprofit_margin
                const qExpToSales = res[i].q_exp_to_sales
                const qProfitToGr = res[i].q_profit_to_gr
                const qSaleexpToGr = res[i].q_saleexp_to_gr
                const qAdminexpToGr = res[i].q_adminexp_to_gr
                const qFinaexpToGr = res[i].q_finaexp_to_gr
                const qImpairToGrTtm = res[i].q_impair_to_gr_ttm
                const qGcToGr = res[i].q_gc_to_gr
                const qOpToGr = res[i].q_op_to_gr
                const qRoe = res[i].q_roe
                const qDtRoe = res[i].q_dt_roe
                const qNpta = res[i].q_npta
                const qOpincomeToEbt = res[i].q_opincome_to_ebt
                const qInvestincomeToEbt = res[i].q_investincome_to_ebt
                const qDtprofitToProfit = res[i].q_dtprofit_to_profit
                const qSalescashToOr = res[i].q_salescash_to_or
                const qOcfToSales = res[i].q_ocf_to_sales
                const qOcfToOr = res[i].q_ocf_to_or
                const basicEpsYoy = res[i].basic_eps_yoy
                const dtEpsYoy = res[i].dt_eps_yoy
                const cfpsYoy = res[i].cfps_yoy
                const opYoy = res[i].op_yoy
                const ebtYoy = res[i].ebt_yoy
                const netprofitYoy = res[i].netprofit_yoy
                const dtNetprofitYoy = res[i].dt_netprofit_yoy
                const ocfYoy = res[i].ocf_yoy
                const roeYoy = res[i].roe_yoy
                const bpsYoy = res[i].bps_yoy
                const assetsYoy = res[i].assets_yoy
                const eqtYoy = res[i].eqt_yoy
                const trYoy = res[i].tr_yoy
                const orYoy = res[i].or_yoy
                const qGrYoy = res[i].q_gr_yoy
                const qGrQoq = res[i].q_gr_qoq
                const qSalesYoy = res[i].q_sales_yoy
                const qSalesQoq = res[i].q_sales_qoq
                const qOpYoy = res[i].q_op_yoy
                const qOpQoq = res[i].q_op_qoq
                const qProfitYoy = res[i].q_profit_yoy
                const qProfitQoq = res[i].q_profit_qoq
                const qNetprofitYoy = res[i].q_netprofit_yoy
                const qNetprofitQoq = res[i].q_netprofit_qoq
                const equityYoy = res[i].equity_yoy
                const rdExp = res[i].rd_exp
                const updateFlag = res[i].update_flag

                const finaIndicators = await ctx.prisma.finaIndicators({
                  where:{
                      AND:[
                        {symbol},
                        {endDate}
                    ]
                  }
                })
                const newData = {
                    eps,  dtEps,  totalRevenuePs,  revenuePs,  capitalResePs,  surplusResePs,  undistProfitPs,  extraItem,
                    profitDedt,  grossMargin,  currentRatio,  quickRatio,  cashRatio,  invturnDays,  arturnDays,  invTurn,
                    arTurn,  caTurn,  faTurn,  assetsTurn,  opIncome,  valuechangeIncome,  interstIncome,  daa,  ebit,
                    ebitda,  fcff,  fcfe,  currentExint,  noncurrentExint,  interestdebt,  netdebt,  tangibleAsset,
                    workingCapital,  networkingCapital,  investCapital,  retainedEarnings,  diluted2Eps,  bps,  ocfps,
                    retainedps,  cfps,  ebitPs,  fcffPs,  fcfePs,  netprofitMargin,  grossprofitMargin,  cogsOfSales,  expenseOfSales,
                    profitToGr,  saleexpToGr,  adminexpOfGr,  finaexpOfGr,  impaiTtm,  gcOfGr,  opOfGr,  ebitOfGr,  roe,
                    roeWaa,  roeDt,  roa,  npta,  roic,  roeYearly,  roa2Yearly,  roeAvg,  opincomeOfEbt,  investincomeOfEbt,
                    nOpProfitOfEbt,  taxToEbt,  dtprofitToProfit,  salescashToOr,  ocfToOr,  ocfToOpincome,  capitalizedToDa,
                    debtToAssets,  assetsToEqt,  dpAssetsToEqt,  caToAssets,  ncaToAssets,  tbassetsToTotalassets,  intToTalcap,
                    eqtToTalcapital,  currentdebtToDebt,  longdebToDebt,  ocfToShortdebt,  debtToEqt,  eqtToDebt,  eqtToInterestdebt,
                    tangibleassetToDebt,  tangassetToIntdebt,  tangibleassetToNetdebt,  ocfToDebt,  ocfToInterestdebt,
                    ocfToNetdebt,  ebitToInterest,  longdebtToWorkingcapital,  ebitdaToDebt,  turnDays,  roaYearly,
                    roaDp,  fixedAssets,  profitPrefinExp,  nonOpProfit,  opToEbt,  nopToEbt,  ocfToProfit,  cashToLiqdebt,
                    cashToLiqdebtWithinterest,  opToLiqdebt,  opToDebt,  roicYearly,  totalFaTrun,  profitToOp,  qOpincome,
                    qInvestincome,  qDtprofit,  qEps,  qNetprofitMargin,  qGsprofitMargin,  qExpToSales,  qProfitToGr,
                    qSaleexpToGr,  qAdminexpToGr,  qFinaexpToGr,  qImpairToGrTtm,  qGcToGr,  qOpToGr,  qRoe,  qDtRoe,
                    qNpta,  qOpincomeToEbt,  qInvestincomeToEbt,  qDtprofitToProfit,  qSalescashToOr,  qOcfToSales,
                    qOcfToOr,  basicEpsYoy,  dtEpsYoy,  cfpsYoy,  opYoy,  ebtYoy,  netprofitYoy,  dtNetprofitYoy,
                    ocfYoy,  roeYoy,  bpsYoy,  assetsYoy,  eqtYoy,  trYoy,  orYoy,  qGrYoy,  qGrQoq,  qSalesYoy,
                    qSalesQoq,  qOpYoy,  qOpQoq,  qProfitYoy,  qProfitQoq,  qNetprofitYoy,  qNetprofitQoq,  equityYoy,  rdExp,
                    updateFlag }

                if(finaIndicators.length>0){
                  await ctx.prisma.updateFinaIndicator({
                    where:{id:finaIndicators[0].id},
                    data:newData
                  })
                }else{
                  await ctx.prisma.createFinaIndicator({
                    company:{connect:{symbol}},
                    symbol,
                    annDate,
                    endDate,
                    ...newData
                  })
                }
              }
            }
      }
      catch(err) {
          console.log(data.toString())
          console.log(err)
      }
    });
    getAllFinaIndicatorProcess.stderr.on('data', (data) => {
      throw new Error(`获取交易信息失败${data}`)
    });
    getAllFinaIndicatorProcess.on('exit', (code) => {
      if(code!==0){
        throw new Error(`客户信息下载失败，请确认客户名称是否正确`)
      }else{
        console.log("添加日交易记录完成")
      }
    });
    
    return true
  },
}

module.exports = {
  Mutation,
}