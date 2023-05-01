import User from "../../../entities/User";
import { GetMyPlacesResponse } from "../../../types/graph";
import { Resolvers } from "../../../types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { createConnection } from "typeorm";

const resolvers: Resolvers = {
Query: {
GetMyPlaces: privateResolver(
async (_, __, { req }): Promise<GetMyPlacesResponse> => {
try {
    const connection = await createConnection();
const user = await connection
.getRepository(User)
.createQueryBuilder("user")
.leftJoinAndSelect("user.places", "place")
.where("user.id = :id", { id: req.user.id })
.getOne();
if (user) {
return {
ok: true,
places: user.places,
error: null
};
} else {
return {
ok: false,
places: null,
error: "User not found"
};
}
} catch (error) {
return {
ok: false,
error: error.message,
places: null
};
}
}
)
}
};
export default resolvers;