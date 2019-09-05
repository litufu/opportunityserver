const IndustryInfluence = {
    keywords: ({ id }, args, context) => {
        return context.prisma.industryInfluence({ id }).keywords()
    },
    industry: ({ id }, args, context) => {
        return context.prisma.industryInfluence({ id }).industry()
    },
  }
    
  module.exports = {
    IndustryInfluence,
  }