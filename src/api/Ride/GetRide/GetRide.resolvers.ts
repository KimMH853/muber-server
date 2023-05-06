import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { GetRideQueryArgs, GetRideResponse } from '../../../types/graph';
import User from "../../../entities/User";
import Ride from "../../../entities/Ride";

const resolvers : Resolvers = {
    Query: {
        GetRide: privateResolver(
            async(_, args:GetRideQueryArgs, {req} ): Promise<GetRideResponse> =>{
                const user: User = req.user;
                try {
                    const ride = await Ride.findOneBy({
                        id: args.rideId
                    })
                    if(ride) {
                        if(ride.passengerId === user.id || ride.driverId === user.id) {
                            return {
                                ok: true,
                                error: null,
                                ride
                            }
                        } else {
                            return {
                                ok: false,
                                error: "Nat Authorized",
                                ride: null
                            };
                        }
                    } else {
                        return {
                            ok: false,
                            error: "Ride not found",
                            ride: null
                        };
                    }
                } catch(error) {
                    return {
                        ok: false,
                        error: error.message,
                        ride: null
                    }
                    

                }
            }
        )
    }
}
export default resolvers;