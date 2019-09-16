const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime

  type Query {
    allCompanies:[Company]
    companies(keyword:String!): [Company]
    companiesByCodeOrName(inputvalue:String!):[Company]
    companiesByInfluence(keyword:String!,keywordDirection:Direction!):[Company]
    company(symbol:String!):Company!
    conditionSearchCompanies(years:Int,qSalesYoy:Float,dtNetprofitYoy:Float,endDate:String):[Company]
    influencesByCompany(symbol:String!):[IndustryInfluence]
    products(inputvalue:String!):[Product]
    companyProducts(inputvalue:String!):[CompanyProduct]
    industries(inputvalue:String!):[Industry]
    keywords(inputvalue:String!):[Keyword]
    allKeywords:[Keyword]
    bottomCrossCompanies(nowDay:String!,beforeDays:Int,firstNum:Int,resNum:Int):[Company]
    bottomVolume(nowDay:String!,yesterday:String!,beforeDays:Int,firstNum:Int,resNum:Int):[Company]
    companyFinaIndicators(symbol:String!):[FinaIndicator]
    finaIndicators(endDate:String):[FinaIndicator]
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
    addFinaIndicator(code:String):Boolean!
    addAllFinaIndicator:Boolean!
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
  finaIndicators:[FinaIndicator]
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

type FinaIndicator{
  id: ID!
  company:Company!
  symbol:String
  annDate:DateTime
  endDate:DateTime
  eps:Float
  dtEps:Float
  totalRevenuePs:Float
  revenuePs:Float
  capitalResePs:Float
  surplusResePs:Float
  undistProfitPs:Float
  extraItem:Float
  profitDedt:Float
  grossMargin:Float
  currentRatio:Float
  quickRatio:Float
  cashRatio:Float
  invturnDays:Float
  arturnDays:Float
  invTurn:Float
  arTurn:Float
  caTurn:Float
  faTurn:Float
  assetsTurn:Float
  opIncome:Float
  valuechangeIncome:Float
  interstIncome:Float
  daa:Float
  ebit:Float
  ebitda:Float
  fcff:Float
  fcfe:Float
  currentExint:Float
  noncurrentExint:Float
  interestdebt:Float
  netdebt:Float
  tangibleAsset:Float
  workingCapital:Float
  networkingCapital:Float
  investCapital:Float
  retainedEarnings:Float
  diluted2Eps:Float
  bps:Float
  ocfps:Float
  retainedps:Float
  cfps:Float
  ebitPs:Float
  fcffPs:Float
  fcfePs:Float
  netprofitMargin:Float
  grossprofitMargin:Float
  cogsOfSales:Float
  expenseOfSales:Float
  profitToGr:Float
  saleexpToGr:Float
  adminexpOfGr:Float
  finaexpOfGr:Float
  impaiTtm:Float
  gcOfGr:Float
  opOfGr:Float
  ebitOfGr:Float
  roe:Float
  roeWaa:Float
  roeDt:Float
  roa:Float
  npta:Float
  roic:Float
  roeYearly:Float
  roa2Yearly:Float
  roeAvg:Float
  opincomeOfEbt:Float
  investincomeOfEbt:Float
  nOpProfitOfEbt:Float
  taxToEbt:Float
  dtprofitToProfit:Float
  salescashToOr:Float
  ocfToOr:Float
  ocfToOpincome:Float
  capitalizedToDa:Float
  debtToAssets:Float
  assetsToEqt:Float
  dpAssetsToEqt:Float
  caToAssets:Float
  ncaToAssets:Float
  tbassetsToTotalassets:Float
  intToTalcap:Float
  eqtToTalcapital:Float
  currentdebtToDebt:Float
  longdebToDebt:Float
  ocfToShortdebt:Float
  debtToEqt:Float
  eqtToDebt:Float
  eqtToInterestdebt:Float
  tangibleassetToDebt:Float
  tangassetToIntdebt:Float
  tangibleassetToNetdebt:Float
  ocfToDebt:Float
  ocfToInterestdebt:Float
  ocfToNetdebt:Float
  ebitToInterest:Float
  longdebtToWorkingcapital:Float
  ebitdaToDebt:Float
  turnDays:Float
  roaYearly:Float
  roaDp:Float
  fixedAssets:Float
  profitPrefinExp:Float
  nonOpProfit:Float
  opToEbt:Float
  nopToEbt:Float
  ocfToProfit:Float
  cashToLiqdebt:Float
  cashToLiqdebtWithinterest:Float
  opToLiqdebt:Float
  opToDebt:Float
  roicYearly:Float
  totalFaTrun:Float
  profitToOp:Float
  qOpincome:Float
  qInvestincome:Float
  qDtprofit:Float
  qEps:Float
  qNetprofitMargin:Float
  qGsprofitMargin:Float
  qExpToSales:Float
  qProfitToGr:Float
  qSaleexpToGr:Float
  qAdminexpToGr:Float
  qFinaexpToGr:Float
  qImpairToGrTtm:Float
  qGcToGr:Float
  qOpToGr:Float
  qRoe:Float
  qDtRoe:Float
  qNpta:Float
  qOpincomeToEbt:Float
  qInvestincomeToEbt:Float
  qDtprofitToProfit:Float
  qSalescashToOr:Float
  qOcfToSales:Float
  qOcfToOr:Float
  basicEpsYoy:Float
  dtEpsYoy:Float
  cfpsYoy:Float
  opYoy:Float
  ebtYoy:Float
  netprofitYoy:Float
  dtNetprofitYoy:Float
  ocfYoy:Float
  roeYoy:Float
  bpsYoy:Float
  assetsYoy:Float
  eqtYoy:Float
  trYoy:Float
  orYoy:Float
  qGrYoy:Float
  qGrQoq:Float
  qSalesYoy:Float
  qSalesQoq:Float
  qOpYoy:Float
  qOpQoq:Float
  qProfitYoy:Float
  qProfitQoq:Float
  qNetprofitYoy:Float
  qNetprofitQoq:Float
  equityYoy:Float
  rdExp:Float
  updateFlag:String
}

  
`;
module.exports = typeDefs;