import Place from "../../../entities/Place";
import { GetMyPlacesResponse } from "../../../types/graph";
import { Resolvers } from "../../../types/resolvers";
import privateResolver from "../../../utils/privateResolver";

const resolvers: Resolvers = {
  Query: {
    GetMyPlaces: privateResolver(
      async (_, __, { req }): Promise<GetMyPlacesResponse> => {
        try {
          const places = await Place.find({
            where: {
                userId: req.user.id
            }
            
          })
          if (places) {
            return {
              ok: true,
              places: places,
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