const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = require('./schema');
const { resolvers } = require('./resolvers')
const { prisma } = require('./generated/prisma-client')


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: request => {
        return {
          ...request,
          prisma,
        }
      },
  });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 7000 }, () =>
  console.log(`🚀 Server ready at http://localhost:7000${server.graphqlPath}`)
);