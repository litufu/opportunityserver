const Product = {
    inputs: ({ id }, args, context) => {
        return context.prisma.product({ id }).inputs()
    },
    outputs: ({ id }, args, context) => {
        return context.prisma.product({ id }).outputs()
    },
  }
    
  module.exports = {
    Product,
  }