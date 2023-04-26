

module.exports = {
  Query: {
    GetMyProfile: async (_, __, { req }) => {
      const { user } = req;
      try{
        return {
            ok: true,
            error: null,
            user
          };
      } catch{
        return {
            ok: false,
            error: "your not user",
            user: null
        }
      }
      
    }
  }
};
