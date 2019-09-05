const Company = {
    trades: ({ id }, args, context) => {
        return context.prisma.company({ id }).trades()
    },
    events: ({ id }, args, context) => {
        return context.prisma.company({ id }).events()
    },
  }
    
  module.exports = {
    Company,
  }