const { Query } = require('./Query')
const { Mutation } = require('./Mutation')
const { Company } = require('./Company')

const resolvers = {
  Query,
  Mutation,
  Company,
}

module.exports = {
  resolvers,
}