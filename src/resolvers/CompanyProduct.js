const CompanyProduct = {
    inputs: ({ id }, args, context) => {
        return context.prisma.companyProduct({ id }).inputs()
    },
    outputs: ({ id }, args, context) => {
      return context.prisma.companyProduct({ id }).outputs()
    },
  }
    
  module.exports = {
    CompanyProduct,
  }