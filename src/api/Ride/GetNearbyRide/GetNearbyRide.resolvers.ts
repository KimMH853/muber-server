import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { GetNearbyRideResponse } from '../../../types/graph';
import User from "../../../entities/User";
import Ride from "../../../entities/Ride";
import { Between } from "typeorm";

const resolvers: Resolvers ={
    Query: {
        GetNearbyRide: privateResolver(
            async(_, __, {req}): Promise<GetNearbyRideResponse> =>{
                const user: User = req.user;
                if(user.isDriving) {
                    const {lastLat, lastLng} = user;
                    try {
                        const ride = await Ride.findOne({
                            where: {
                                status: "REQUESTING",
                                pickUpLat: Between(lastLat - 0.05, lastLat + 0.05),
                                pickUpLng: Between(lastLng - 0.05, lastLng + 0.05)
                                
                            }
                        })
                        return {
                            ok: true,
                            error: null,
                            ride
                        };
                    }catch(error) {
                        return {
                            ok: false,
                            error: error.message,
                            ride: null
                        };
                    }
                } else {
                    return {
                        ok: false,
                        error: "You are not a driver",
                        ride: null
                    }
                }
            }
        )
    }
}
export default resolvers;