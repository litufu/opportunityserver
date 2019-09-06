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
        console.log(res.symbol)
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
}

module.exports = {
  Mutation,
}