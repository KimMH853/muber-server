import { withFilter } from "graphql-subscriptions";
import User from "src/entities/User";

const resolvers = {
    Subscription: {
        RideStatusSubscription: {
            subscribe: withFilter((_, __, {pubsub}) => pubsub.asyncIterator("rideUpdate"), (payload, _, {currentUser}) =>{
                const user: User = currentUser;
                const {
                    RideStatusSubscription: {driverId, passengerId}
                } = payload;
                return user.id === driverId || user.id === passengerId
            })
        }
    }
}

export default resolvers;