import { NextFunction, Response } from "express";
import decodeJWT from "./utils/decodeJWT";

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
const jwt = async ( req, res:Response, next:NextFunction): Promise<void> =>{
  const token = req.get("X-JWT");
  if(token) {
    console.log(token)
    const user = await decodeJWT(token);
    if(user) {
      req.user=user;
    }else{
      req.user=undefined;
    }
  }
  next();
}


const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async requestDidStart(requestContext) {
        return {
          async willSendRequest(requestContext) {
            const { response, context } = requestContext;
            if (response.body.kind === 'single' && 'data' in response.body.singleResult) {
              response.body.singleResult.extensions = {
                ...response.body.singleResult.extensions,
                hello: 'world',
              };
              if (context && context.req && context.req.headers) {
                context.req.headers.set('Authorization', "1234");
              }
            }
          },
        };
      }
    },
  ],
});
server.start().then(() => {
  app.use(
    '/graphql',
    cors(),
    jwt,
    bodyParser.json(),
    expressMiddleware(server, {
      context: ({req}) => {
        return {
          req
        };
      }
    }
      
    ),
  );

  

  httpServer.listen({ port: 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  });
});