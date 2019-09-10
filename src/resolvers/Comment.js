const Comment = {
    company: ({ id }, args, context) => {
        return context.prisma.comment({ id }).company()
    },
  }
    
  module.exports = {
    Comment,
  }