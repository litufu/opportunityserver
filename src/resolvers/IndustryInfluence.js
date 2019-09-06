const IndustryInfluence = {
    keyword: ({ id }, args, context) => {
        return context.prisma.industryInfluence({ id }).keyword()
    },
    industry: ({ id }, args, context) => {
        return context.prisma.industryInfluence({ id }).industry()
    },
  }
    
  module.exports = {
    IndustryInfluence,
  }