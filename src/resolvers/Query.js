const _ = require('lodash');
const { getBottomPct,getBeforeDate,getChangePct,parseDate,getToday } = require('../utils')

const Query = {
  allCompanies:(parent, args, ctx) => {
    return ctx.prisma.companies()
  },
  companies: (parent, {keyword}, ctx) => {
    return ctx.prisma.companies({ 
      where:{desc_contains:keyword},
      first:30
     })
  },
  companiesByCodeOrName: (parent, {inputvalue}, ctx) => {
    if(_.startsWith(inputvalue,"6")||_.startsWith(inputvalue,"3")||_.startsWith(inputvalue,"0")){
      return ctx.prisma.companies({ 
        where:{symbol_starts_with:inputvalue},
        first:10
       })
    }
    return ctx.prisma.companies({ 
      where:{name_contains:inputvalue},
      first:10
     })
  },
  companiesByInfluence: async (parent, {keyword,keywordDirection}, ctx) => {
    const industryInfluences = await ctx.prisma.industryInfluences({
      where:{
        AND:[
          {keyword:{name:keyword}},
          {keywordDirection}
        ]
      }
    })
    let allCompanies = []
    for(const industryInfluence of industryInfluences){
      const companies = await ctx.prisma.industryInfluence({id:industryInfluence.id}).industry().companies()
      allCompanies = [...allCompanies,...companies]
    } 
    return allCompanies
  },
  influencesByCompany:async (parent, {symbol}, ctx) => {
    const industries = await ctx.prisma.company({symbol}).trades()
    
    
    let allInflueces = []
    for(const industry of industries){
      const influences = await ctx.prisma.industry({id:industry.id}).influences()
      allInflueces = [...allInflueces,...influences]
    } 
    return allInflueces
  },
  company:async (parent, {symbol}, ctx) => {
    return ctx.prisma.company({ symbol})
     
  },
  finaIndicators:async (parent,{endDate},ctx)=>{
    return ctx.prisma.finaIndicators({
      where:{endDate:new Date(endDate)}
    })
  },
  conditionSearchCompanies:async (parent, {years,qSalesYoy,dtNetprofitYoy,endDate}, ctx) => {
    const today = getToday()
    const companies = await ctx.prisma.companies()
    const newCompanies = companies.filter(async company=>{
      const companyfinaIndicators = await ctx.prisma.finaIndicators({
        where:{
          AND:[
            {endDate:new Date(endDate)},
            {symbol:company.symbol}
          ]
        }
      })
      const listDate = parseDate(company.listDate)
      const dateSpan = today - listDate
      const iDays = parseInt(dateSpan / (24 * 3600 * 1000))
      if(iDays>(years-1)*365 && iDays<(years*365) 
      && (companyfinaIndicators.length>0)
      && (companyfinaIndicators[0].qSalesYoy>qSalesYoy)
      && (companyfinaIndicators[0].dtNetprofitYoy>dtNetprofitYoy)
      ){
        return true
      }
      return false
    })
    return newCompanies
     
  },
  products:(parent, {inputvalue}, ctx) => {
    return ctx.prisma.products({ 
      where:{name_contains:inputvalue},
      first:10
     })
  },
  companyProducts:(parent, {inputvalue}, ctx) => {
    return ctx.prisma.companyProducts({ 
      where:{name_contains:inputvalue},
      first:10
     })
  },
  industries:(parent, {inputvalue}, ctx) => {
    return ctx.prisma.industries({ 
      where:{name_contains:inputvalue},
      first:10
     })
  },
  keywords:(parent, {inputvalue}, ctx) => {
    return ctx.prisma.keywords({ 
      where:{name_contains:inputvalue},
      first:10
     })
  },
  allKeywords:(parent,args,ctx)=>{
    return ctx.prisma.keywords()
  },
  bottomCrossCompanies:async (parent,{nowDay,beforeDays,firstNum,resNum},ctx)=>{
    
    const today = new Date(nowDay)
    const beforeDay = getBeforeDate(nowDay,beforeDays)
    const dailies = await ctx.prisma.dailies({
      where:{tradeDate:today}
    })
    dailies.sort(function(a, b){
      return getBottomPct(b)-getBottomPct(a)
    });
    const firstDailies = dailies.slice(0,firstNum)
    const companySymbols = firstDailies.map(daily=>daily.symbol)
    const beforeDailies = await ctx.prisma.dailies({
      where:{
        AND:[
          {tradeDate:beforeDay},
          {symbol_in:companySymbols}
        ]
      }
    })
    firstDailies.sort(function(a,b){
      return getChangePct(b,beforeDailies) - getChangePct(a,beforeDailies)
    })
    const resDailies = firstDailies.slice(0,resNum)
    
    const companies = []
    for(const daily of resDailies){
      const company = await ctx.prisma.company({symbol:daily.symbol})
      companies.push(company)
    }
    return companies
  },
  bottomVolume:async (parent,{nowDay,yesterday,beforeDays,firstNum,resNum},ctx)=>{
    
    const today = new Date(nowDay)
    const lastDay = new Date(yesterday)
    const beforeDay = getBeforeDate(nowDay,beforeDays)
    console.log(beforeDay)
    const dailies = await ctx.prisma.dailies({
      where:{tradeDate:today}
    })
    const lastDailies = await ctx.prisma.dailies({
      where:{tradeDate:lastDay}
    })
    const res = []
    for(const daily of dailies){
      const symbol = daily.symbol
      const vol = daily.vol
      const yesterdayDaily = lastDailies.filter(d=>d.symbol===symbol)
      if(yesterdayDaily.length>0){
        const yesterdayVol = yesterdayDaily[0].vol
        res.push({symbol,change:vol/yesterdayVol})
      }
    }
    res.sort(function(a, b){
      return b.change-a.change
    });
    const companySymbols = res.slice(0,firstNum).map(r=>r.symbol)
    const firstDailies = await ctx.prisma.dailies({
      where:{
        AND:[
          {tradeDate:today},
          {symbol_in:companySymbols}
        ]
      }
    })
    const beforeDailies = await ctx.prisma.dailies({
      where:{
        AND:[
          {tradeDate:beforeDay},
          {symbol_in:companySymbols}
        ]
      }
    })
    firstDailies.sort(function(a,b){
      return getChangePct(b,beforeDailies) - getChangePct(a,beforeDailies)
    })
    const resDailies = firstDailies.slice(0,resNum)
    
    const companies = []
    for(const daily of resDailies){
      const company = await ctx.prisma.company({symbol:daily.symbol})
      companies.push(company)
    }
    return companies
  },
  companyFinaIndicators:(parent, {symbol}, ctx) => {
    return ctx.prisma.finaIndicators({ 
      where:{company:{symbol}}
    })
  },
}

module.exports = {
  Query,
}