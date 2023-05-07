import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { GetNearbyRideResponse } from '../../../types/graph';
import User from "../../../entities/User";
import Ride from "../../../entities/Ride";
import { getRepository } from "typeorm";

const resolvers: Resolvers ={
    Query: {
        GetNearbyRide: privateResolver(
            async(_, __, {req}): Promise<GetNearbyRideResponse> =>{
                const user: User = req.user;
                if(user.isDriving) {
                    const {lastLat, lastLng} = user;
                    try {
                        const ride = await getRepository(Ride).createQueryBuilder("ride")
                            .leftJoinAndSelect("ride.passenger", "passenger")
                            .where("ride.status = :status", { status:  "REQUESTING" })
                            .andWhere("ride.pickUpLat BETWEEN :minLat AND :maxLat", {minLat: lastLat - 0.05, maxLat: lastLat + 0.05})
                            .andWhere("ride.pickUpLng BETWEEN :minLng AND :maxLng", {minLng: lastLng - 0.05, maxLng: lastLng + 0.05})
                            .getOne();
                       
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