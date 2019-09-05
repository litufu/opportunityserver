const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime

  type Query {
    companies(keyword:String!): [Company]
    companiesByCodeOrName(inputvalue:String!):[Company]
    products(inputvalue:String!):[Product]
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    getCompanies:Boolean!
    updateCompanyScopAndDesc:Boolean!
    createProduct(name:String!,introduce:String!):Product!
    productLinkCompany(companyName:String!,productName:String!,deal:String!):Company
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum Role {
      ADMIN
      CUSTOMER
  }

type User {
    id: ID!
    username: String!
    role:Role!
}


enum TimeKind {
  PAST
  FUTRUE
}

enum SrcKind {
  INNER
  OUTER
}

type KeyWord{
  id: ID!
  name:String!
}

type Event{
  id: ID!
  title:String!
  src:String!
  srcKind:SrcKind!
  reportTime:DateTime!
  happen:TimeKind!
  happenTime:DateTime!
  content:String!
  keyWords:[KeyWord]
}

enum Direction{
  GOOD
  BAD
}



enum FactorKind{
  ASSET
  DEBT
  EQUITY
  INCOME
  COST
  FEE
  BRAND
}

type Influence{
  id: ID!
  keywords:[KeyWord]!
  kind:FactorKind!
  name:String!
  desc:String!
  company:Company!
  dierction:Direction!
}

type Product{
  id: ID!
  name:String!
  introduce:String!
  firstClass:String
  secondClass:String
  thirdClass:String
  inputs:[Company]
  outputs:[Company]
}

type Company{
  id: ID!
  symbol:String!
  name:String!
  area:String!
  industry:String!
  fullname:String!
  enname:String!
  market:String!
  exchange:String
  currType:String
  listStatus:String
  listDate:String
  delistDate:String
  isHS:String
  scope:String
  desc:String
  influences:[Influence]
  purchases:[Product] 
  selles:[Product]
}

  
`;
module.exports = typeDefs;