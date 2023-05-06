import { getRepository } from "typeorm";
import { GetMyPlacesResponse } from "../../../types/graph";
import { Resolvers } from "../../../types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import User from "../../../entities/User";

const resolvers: Resolvers = {
  Query: {
    GetMyPlaces: privateResolver(
      async (_, __, { req }): Promise<GetMyPlacesResponse> => {
        try {
          const result = await getRepository(User).createQueryBuilder("user")
          .leftJoinAndSelect("user.places", "place")
          .where("user.id = :id", { id: req.user.id })
          .getOne();
          
          if (result) {
            return {
              ok: true,
              places: result.places,
              error: null
            };
          } else {
            return {
              ok: false,
              places: null,
              error: "Place not found"
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