import { withFilter } from 'graphql-subscriptions';
import User from 'src/entities/User';

const resolvers = {
    Subscription: {
      DriversSubscription: {
        subscribe: withFilter((_, __, context)=> context.pubsub.asyncIterator("driverUpdate"), (payload, _, context) =>{
          const user: User = context.currentUser;
          const {
            DriversSubscription: {
              lastLat: driverLastLat,
              lastLng: driverLastLng
            }
          } = payload;
          const { lastLat: userLastLat, lastLng: userLastLng } = user;
          return (
            driverLastLat >= userLastLat - 0.05 &&
            driverLastLat <= userLastLat + 0.05 &&
            driverLastLng >= userLastLng - 0.05 &&
            driverLastLng <= userLastLng + 0.05
          )
        }
      )
    }
  }
}

  export default resolvers;