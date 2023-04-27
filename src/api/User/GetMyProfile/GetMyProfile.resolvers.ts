import { Resolvers } from "src/types/resolvers";

const resolvers: Resolvers = {
  Query: {
    GetMyProfile: async (parent, args, {req}, info)=>{
      return {
        ok: true,
        error: null,


      }
    }
  }
}

export default resolvers;