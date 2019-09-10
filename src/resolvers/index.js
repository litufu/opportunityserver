const { Query } = require('./Query')
const { Mutation } = require('./Mutation')
const { Company } = require('./Company')
const { Industry } = require('./Industry')
const { Product } = require('./Product')
const { IndustryInfluence } = require('./IndustryInfluence')
const {Comment} = require('./Comment')
const {CompanyProduct} = require('./CompanyProduct')

const resolvers = {
  Query,
  Mutation,
  Company,
  Industry,
  Product,
  IndustryInfluence,
  Comment,
  CompanyProduct,
}

module.exports = {
  resolvers,
}