require('dotenv').config()
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
//const logger = require('morgan');
const { createConnection } =require("typeorm") ;



const loadTypeDefs = loadFilesSync(path.join(__dirname,'./api/**/*.graphql'));
const loadResolvers = loadFilesSync(path.join(__dirname,'./api/**/*.resolvers.*'));
const typeDefs = mergeTypeDefs(loadTypeDefs);
const resolvers = mergeResolvers(loadResolvers);
console.log(resolvers)
console.log("resolvers")
// const PORT: number | string = process.env.PORT || 4000;
// const GRAPHQL_ENDPOINT: string = "/graphql";

// interface MyContext {
//   token?: String;
// }
createConnection().then(() => {
  console.log("Connected to database");
}).catch((error) => {
  console.log("Error connecting to database:", error);
});


const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
server.start().then(() => {
  app.use(
    '/graphql',
    cors(),
    
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );

  httpServer.listen({ port: 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  });
});