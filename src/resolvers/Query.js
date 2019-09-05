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
  products:(parent, {inputvalue}, ctx) => {
    return ctx.prisma.products({ 
      where:{name_contains:inputvalue},
      first:10
     })
  },
}

module.exports = {
  Query,
}