const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime

  type Query {
    companies(keyword:String!): [Company]
    companiesByCodeOrName(inputvalue:String!):[Company]
    companiesByInfluence(keyword:String!,keywordDirection:Direction!):[Company]
    products(inputvalue:String!):[Product]
    industries(inputvalue:String!):[Industry]
    keywords(inputvalue:String!):[Keyword]
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    getCompanies:Boolean!
    updateCompanyScopAndDesc:Boolean!
    createProduct(name:String!,introduce:String!):Product!
    createIndustry(name:String!,desc:String!):Industry!
    productLinkIndustry(industryName:String!,productName:String!,deal:String!):Industry
    companyLinkIndustry(companyNames:[String!]!,industryName:String!):Industry
    industryResearch(industryName:String!,research:String!):Industry!
    addKeyword(keyword:String!):Keyword!
    addIndustryInfluence(industryName:String!,keyword:String!,keywordDirection:Direction!,kind:FactorKind!,desc:String!,direction:Direction!):IndustryInfluence!
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

type Keyword{
  id: ID!
  name:String!
}

type IndustryEvent{
  id: ID!
  title:String!
  src:String!
  reportTime:DateTime!
  happen:TimeKind!
  happenTime:DateTime!
  content:String!
  Keywords:[Keyword!]!
}

type CompanyEvent{
  id: ID!
  title:String!
  content:String!
  reportTime:DateTime!
  happen:TimeKind!
  happenTime:DateTime!
  influence:String!
  kind:FactorKind!
  direction:Direction!
  company:Company!
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

type IndustryInfluence{
  id: ID!
  keyword:Keyword
  keywordDirection:Direction!
  kind:FactorKind!
  desc:String!
  industry:Industry!
  direction:Direction!
}

type Product{
  id: ID!
  name:String!
  introduce:String!
  inputs:[Industry!]!
  outputs:[Industry!]!
}

type Research{
  id: ID!
  desc:String!
}

type Industry{
  id: ID!
  code:String
  name:String! 
  desc:String!
  researches:[Research!]!
  companies:[Company]
  influences:[IndustryInfluence]
  purchases:[Product]
  selles:[Product]
}



type Company{
  id: ID!
  symbol:String!
  name:String!
  area:String
  industry:String
  fullname:String
  enname:String
  market:String
  exchange:String
  currType:String
  listStatus:String
  listDate:String
  delistDate:String
  isHS:String
  scope:String
  desc:String
  trades:[Industry]
  events:[CompanyEvent]
}

  
`;
module.exports = typeDefs;