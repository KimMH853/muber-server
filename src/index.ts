import { NextFunction, Response } from "express";
import decodeJWT from "./utils/decodeJWT";
import { WebSocketServer } from 'ws' ;   
import { useServer } from 'graphql-ws/lib/use/ws' ;
import { makeExecutableSchema } from '@graphql-tools/schema';
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
const { PubSub } =require('graphql-subscriptions')


const loadTypeDefs = loadFilesSync(path.join(__dirname,'./api/**/*.graphql'));
const loadResolvers = loadFilesSync(path.join(__dirname,'./api/**/*.resolvers.*'));
const typeDefs = mergeTypeDefs(loadTypeDefs);
const resolvers = mergeResolvers(loadResolvers);
// const PORT: number | string = process.env.PORT || 4000;
// const GRAPHQL_ENDPOINT: string = "/graphql";

// interface MyContext {
//   token?: String;
// }
const schema = makeExecutableSchema({ typeDefs, resolvers });

createConnection().then(() => {
  console.log("Connected to database");
}).catch((error) => {
  console.log("Error connecting to database:", error);
});
const jwt = async ( req, res:Response, next:NextFunction): Promise<void> =>{
  const token = req.get("X-JWT");
  if(token) {
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
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});
// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  path: '/graphql',
});

const pubsub = new PubSub();

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const findUser = async (token:string) => {
  // Find a user by their auth token
  if(token) {
    const user = await decodeJWT(token);
    return user;
  }
  return null;
}
const getDynamicContext = async (ctx, msg, args) => {
  // ctx is the graphql-ws Context where connectionParams live
  if (ctx.connectionParams) {
    const currentUser = await findUser(ctx.connectionParams["X-JWT"]);
    return { currentUser, pubsub };
  }
  // Otherwise let our resolvers know we don't have a current user
  return { currentUser: null };
};

const serverCleanup = useServer({
      schema,
      context: async (ctx, msg, args) => {
        // Returning an object will add that information to
        // contextValue, which all of our resolvers have access to.
        console.log(ctx)
        return getDynamicContext(ctx, msg, args); 
      },
      
       
    }, wsServer);
server.start().then(() => {
  app.use(
    '/graphql',
    cors(),
    jwt,
    bodyParser.json(),
    expressMiddleware(server, {
      context: ({req}) => {
        return {
          req,
          pubsub
        };
      }
    }
      
    ),
  );

  

  httpServer.listen({ port: 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  });
});