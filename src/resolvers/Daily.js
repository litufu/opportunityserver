const Daily = {
    company: ({ id }, args, context) => {
        return context.prisma.daily({ id }).company()
    },
  }
    
  module.exports = {
    Daily,
  }