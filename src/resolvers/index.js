const { Query } = require('./Query')
const { Mutation } = require('./Mutation')
const { Company } = require('./Company')
const { Industry } = require('./Industry')
const { Product } = require('./Product')
const { IndustryInfluence } = require('./IndustryInfluence')

const resolvers = {
  Query,
  Mutation,
  Company,
  Industry,
  Product,
  IndustryInfluence,
}

module.exports = {
  resolvers,
}