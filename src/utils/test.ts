const mongoose = require('mongoose')
const {ObjectId} = require('mongodb')
const { createServer } = require('http')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { makeExecutableSchema } = require ('@graphql-tools/schema')
const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const {resolvers,typeDefs} = require('./graphql')
const jwt = require('jsonwebtoken')
const {onConnect,onDisconnect} = require('./controllers/User')
require('dotenv').config()
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js')
const { EventEmitter } = require('events')
const { PubSub } =require('graphql-subscriptions')
const { RedisPubSub } =require('graphql-redis-subscriptions')
const Redis = require('ioredis')
const 
{
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageGraphQLPlayground,
    ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core')
const { WebSocketServer} = require('ws')
const {useServer } = require('graphql-ws/lib/use/ws')
const path = require('path')
const bodyParser = require('body-parser')

const biggerEventEmitter = new EventEmitter();
biggerEventEmitter.setMaxListeners(0);



const options = {
    host: process.env.REDIS_DOMAIN_NAME,
    port: process.env.PORT_NUMBER,
    password:process.env.REDIS_PASSWORD,
    retryStrategy: times => {
        // reconnect after
        return Math.min(times * 50, 2000);
      }
  };

  
  const pubsub = process.env.NODE_ENV === 'development' ? new PubSub({eventEmitter: biggerEventEmitter}) : new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
});
mongoose.connect(process.env.BBDD,
{},(err,_)=>
{
    if(err)
    {
        console.log("Error de conexion")
    }
    else
    {
        console.log("Conexion Base de datos Correcta")
        server()
    }
})

async function server()
{
    const app = express()
    
    const httpServer = createServer(app)
    const schema = makeExecutableSchema({ typeDefs, resolvers })
    const PORT = process.env.APP_PORT

    const getDynamicContext = async (ctx, msg, args) => {
       if (ctx.connectionParams.authToken) {
          const user = jwt.verify(ctx.connectionParams.authToken.replace("Bearer ", ""),process.env.KEY);
          return { user, pubsub};
        }
        return { user: null };
      };
    const wsServer = new WebSocketServer(
        { 
            server: httpServer,
            path: '/graphql'
        })

    const serverCleanup = useServer({ 
        schema,
        context: (ctx, msg, args) => {
            return getDynamicContext(ctx, msg, args)
         },
        onConnect: async (ctx) => {
            console.log('onConnect');
            let connectionParams = ctx.connectionParams
            try
            {
                if (connectionParams.authToken) 
                {   
                    const user = jwt.verify(connectionParams.authToken.replace("Bearer ", ""),process.env.KEY)
                    await onConnect(user.id,pubsub)
                    return { user , pubsub}
                }
            }
            catch(error)
            {
                throw new Error('Missing auth token!')
            }
          },
        async onDisconnect(context)
        {
            console.log('onDisconnect');
            try
            {
                if(context.connectionParams&&context.connectionParams.authToken)
                {
                    const user = jwt.verify(context.connectionParams.authToken.replace("Bearer ", ""),process.env.KEY)
                    await onDisconnect(user.id,pubsub)  
                        
                }
            }
            catch(error)
            {
                /* throw new Error('Missing context!') */
            }
           
            
            
        }, }, wsServer)

    const server = new ApolloServer(
        {
            schema,
            persistedQueries:false,
            context: async ({ req ,connection }) => 
            {
                let authorization = req.headers.authorization
                try 
                {
                    if(authorization)
                    {   
                        user = jwt.verify(authorization.replace("Bearer ", ""),process.env.KEY) 
                        return{
                            user,
                            pubsub
                        }
                    }
                } 
                catch (error) 
                {
                    throw new Error("Token invalido");
                }

            },
            csrfPrevention: true,
            cache: 'bounded',
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
                ApolloServerPluginLandingPageLocalDefault({ embed: true }),
                {
                    async serverWillStart() {
                      return {
                        async drainServer() {
                          await serverCleanup.dispose();
                        },
                      };
                    },
                  }]
        })

        app.use(graphqlUploadExpress())
        await server.start()
    server.applyMiddleware({ app })

    httpServer.listen(process.env.PORT||4000, () => {
        console.log(
          `Server is now running on http://localhost:${process.env.PORT||4000}${server.graphqlPath}`,
        );
      });
    
} 
