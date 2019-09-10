const _ = require('lodash');

const Query = {
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
}

module.exports = {
  Query,
}