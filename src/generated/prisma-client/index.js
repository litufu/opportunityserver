"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "TimeKind",
    embedded: false
  },
  {
    name: "Role",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "SrcKind",
    embedded: false
  },
  {
    name: "KeyWord",
    embedded: false
  },
  {
    name: "Event",
    embedded: false
  },
  {
    name: "Direction",
    embedded: false
  },
  {
    name: "FactorKind",
    embedded: false
  },
  {
    name: "Influence",
    embedded: false
  },
  {
    name: "Product",
    embedded: false
  },
  {
    name: "Company",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `http://192.168.99.100:4488`
});
exports.prisma = new exports.Prisma();
