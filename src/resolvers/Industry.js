const Industry = {
    companies: ({ id }, args, context) => {
        return context.prisma.industry({ id }).companies()
    },
    influences: ({ id }, args, context) => {
        return context.prisma.industry({ id }).influences()
    },
    purchases: ({ id }, args, context) => {
        return context.prisma.industry({ id }).purchases()
    },
    selles: ({ id }, args, context) => {
        return context.prisma.industry({ id }).selles()
    },
    researches: ({ id }, args, context) => {
        return context.prisma.industry({ id }).researches()
    },
  }
    
  module.exports = {
    Industry,
  }