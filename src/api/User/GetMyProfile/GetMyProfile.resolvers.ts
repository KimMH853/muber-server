import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";

const resolvers: Resolvers = {
  Query: {
    GetMyProfile: privateResolver (async (parent, args, {req}, info)=>{
      const { user } = req;
      return {
        ok: true,
        error: null,
        user
      };
    })
  }
}

export default resolvers;