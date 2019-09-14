const Company = {
    trades: ({ id }, args, context) => {
        return context.prisma.company({ id }).trades()
    },
    events: ({ id }, args, context) => {
        return context.prisma.company({ id }).events()
    },
    comments: ({ id }, args, context) => {
      return context.prisma.company({ id }).comments()
    },
    purchases:({ id }, args, context) => {
      return context.prisma.company({ id }).purchases()
    },
    selles:({ id }, args, context) => {
      return context.prisma.company({ id }).selles()
    },
    dailies:({ id }, args, context) => {
      return context.prisma.company({ id }).dailies()
    },
  }
    
  module.exports = {
    Company,
  }