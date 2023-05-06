import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { UpdateRideStatusMutationArgs, UpdateRideStatusResponse } from '../../../types/graph';
import User from "../../../entities/User";
import Ride from "../../../entities/Ride";
import Chat from "../../../entities/Chat";

const resolvers: Resolvers = {
    Mutation: {
      UpdateRideStatus: privateResolver(
        async (
          _,
          args: UpdateRideStatusMutationArgs,
          { req, pubsub }
        ): Promise<UpdateRideStatusResponse> => {

            const user : User = req.user;
            if(user.isDriving ) {
                try {
                    let ride: any;
                    if(args.status === "ACCEPTED") {
                        ride = await Ride.findOneBy({
                            id: args.rideId,
                            status: "REQUESTING"
                            
                        })
                        if(ride) {
                            ride.driver = user;
                            user.isTaken = true;
                            user.save();
                            await Chat.create({
                                driver: user,
                                passengerId: ride.passengerId
                            }).save()
                            
                        }
                    }else {
                        ride = await Ride.findOneBy({
                            id: args.rideId,
                            driverId: user.id
                        });
                       
                    }
                    if(ride) {
                        ride.statues = args.status;
                        ride.save();
                        pubsub.publish("rideUpdate", {RideStatusSubscription: ride});
                        return {
                            ok: true,
                            error: null
                        }
                    } else {
                        return {
                            ok: false,
                            error: "Cant't update ride"
                        };
                    }
                } catch(error) {
                    return {
                        ok: false,
                        error: error.message
                    }
                }
            } else {
                return {
                    ok: false,
                    error: "Yor are not driving"
                }
            }
        }  
      )
    }
  };
  export default resolvers;