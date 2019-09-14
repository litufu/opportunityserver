const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime

  type Query {
    companies(keyword:String!): [Company]
    companiesByCodeOrName(inputvalue:String!):[Company]
    companiesByInfluence(keyword:String!,keywordDirection:Direction!):[Company]
    company(symbol:String!):Company!
    influencesByCompany(symbol:String!):[IndustryInfluence]
    products(inputvalue:String!):[Product]
    companyProducts(inputvalue:String!):[CompanyProduct]
    industries(inputvalue:String!):[Industry]
    keywords(inputvalue:String!):[Keyword]
    allKeywords:[Keyword]
    bottomCrossCompanies(nowDay:String!,beforeDays:Int,firstNum:Int,resNum:Int):[Company]
    bottomVolume(nowDay:String!,yesterday:String!,beforeDays:Int,firstNum:Int,resNum:Int):[Company]
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    getCompanies:Boolean!
    updateCompanyScopAndDesc:Boolean!
    createProduct(name:String!,introduce:String!):Product!
    createCompanyProduct(name:String!,introduce:String!):CompanyProduct!
    createIndustry(name:String!,desc:String!):Industry!
    productLinkIndustry(industryName:String!,productName:String!,deal:String!):Industry
    productLinkCompany(companyName:String!,productName:String!,deal:String!):Company
    companyLinkIndustry(companyNames:[String!]!,industryName:String!):Industry
    industryResearch(industryName:String!,research:String!):Industry!
    addKeyword(keyword:String!):Keyword!
    addIndustryInfluence(industryName:String!,keyword:String!,keywordDirection:Direction!,kind:FactorKind!,desc:String!,direction:Direction!):IndustryInfluence!
    addCompanyComment(companyName:String!,comment:String!):Comment!
    addDailyFromTushare(date:String,startDate:String,endDate:String!):Boolean!
    addCurrentDaily:Boolean!
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


type Comment{
  id: ID!
  createTime:DateTime
  desc:String!
  company:Company
}

type CompanyProduct{
  id: ID!
  name:String!
  introduce:String!
  inputs:[Company]
  outputs:[Company]
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
  comments:[Comment]
  purchases:[CompanyProduct]
  selles:[CompanyProduct]
  pool:Boolean
  trades:[Industry]
  events:[CompanyEvent]
  dailies:[Daily]
}

type Daily{
  id: ID!
  company:Company!
  symbol:String
  tradeDate:DateTime!
  open:Float
  high:Float
  low:Float
  close:Float
  preClose:Float
  change:Float
  pctChg:Float
  vol:Float
  amount:Float
}

  
`;
module.exports = typeDefs;