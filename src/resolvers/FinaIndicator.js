const FinaIndicator = {
    company: ({ id }, args, context) => {
        return context.prisma.finaIndicator({ id }).company()
    },
  }
    
  module.exports = {
    FinaIndicator,
  }