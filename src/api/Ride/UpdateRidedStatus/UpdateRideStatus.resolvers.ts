import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { UpdateRideStatusMutationArgs, UpdateRideStatusResponse } from '../../../types/graph';
import User from "../../../entities/User";
import Ride from "../../../entities/Ride";
import Chat from "../../../entities/Chat";
import { getRepository } from "typeorm";

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
                        ride = await getRepository(Ride).createQueryBuilder("ride")
                        .leftJoinAndSelect("ride.passenger", "passenger")
                        .where("ride.id = :id", { id: args.rideId })
                        .andWhere("ride.status = :status", { status: "REQUESTING" })
                        .getOne();
                        console.log(ride)
                        if(ride) {
                            ride.driver = user;
                            user.isTaken = true;
                            user.save();
                            const chat = await Chat.create({
                                driver: user,
                                passenger: ride.passenger
                            }).save();
                            ride.chat = chat;
                            ride.save();
                            
                        }
                    }else {
                        ride = await Ride.findOneBy({
                            id: args.rideId,
                            driverId: user.id
                        });
                       
                    }
                    if(ride) {
                        ride.status = args.status;
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