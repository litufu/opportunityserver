const Company = {
    influences: ({ id }, args, context) => {
        return context.prisma.company({ id }).influences()
    },
    purchases: ({ id }, args, context) => {
        return context.prisma.company({ id }).purchases()
    },
    selles: ({ id }, args, context) => {
        return context.prisma.company({ id }).selles()
    },
  }
    
  module.exports = {
    Company,
  }