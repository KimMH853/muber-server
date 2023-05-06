import { withFilter } from 'graphql-subscriptions';
import User from 'src/entities/User';

const resolvers ={
    Subscription: {
        NearbyRideSubscription: {
            subscribe: withFilter((_, __, {pubsub}) => pubsub.asyncIterator("rideRequest"),(payload, _, {currentUser})=>{
                const user: User = currentUser;
                const {
                    NearbyRideSubscription: {pickUpLat, pickUpLng}
                } = payload;
                const {lastLat: userLastLat, lastLng: userLastLng} = user;
                return (
                    pickUpLat >= userLastLat - 0.05 && pickUpLat <= userLastLat + 0.05 &&
                    pickUpLng >= userLastLng - 0.05 &&
                    pickUpLng <= userLastLng + 0.05
                );
            })
        }
    }
}

export default resolvers;