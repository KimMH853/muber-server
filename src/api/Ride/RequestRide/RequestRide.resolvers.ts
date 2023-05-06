import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { RequestRideMutationArgs, RequestRideResponse } from '../../../types/graph';
import User from "../../../entities/User";
import Ride from "../../../entities/Ride";

const resolvers: Resolvers ={
    Mutation: {
        RequestRide: privateResolver(
            async(_, args: RequestRideMutationArgs, {req, pubsub}): Promise<RequestRideResponse> =>{
                const user: User = req.user;
                if(!user.isRiding){
                    try{
                        const ride = await Ride.create({...args, passenger: user}).save();
                        pubsub.publish("rideRequest", {NearbyRideSubscription: ride});
                        return {
                            ok: true,
                            error: null,
                            ride
                        }
                    }catch(error) {
                        return {
                            ok: false,
                            error: error.message,
                            ride: null
                        }
                    }
                } else {
                    return {
                        ok: false,
                        error: "You con't request two rides",
                        ride: null
                    }
                }
                
            }
        )
    }
};

export default resolvers;