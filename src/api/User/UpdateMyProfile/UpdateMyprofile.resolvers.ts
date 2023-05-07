import { Resolvers } from "src/types/resolvers";
import { UpdateMyProfileMutationArgs } from '../../../types/graph';
import privateResolver from "../../../utils/privateResolver";
import User from "../../../entities/User";
import cleanNullArgs from "../../../utils/cleanNullArg";

const resolvers: Resolvers = {
    Mutation: {
        UpdateMyProfile: privateResolver(
            async (_, args:UpdateMyProfileMutationArgs, {req})=>{
                const user: User = req.user;
                const notNull: any = cleanNullArgs(args);
                if(notNull.password) {
                    user.password = notNull.password;
                    user.save();
                    delete notNull.password;
                }
                try{
                    if(args.password !==null) {
                        user.password = args.password;
                        user.save();
                    }
                    await User.update({id:user.id}, {...notNull})
                    return {
                        ok: true,
                        error: null
                    };
                } catch (error) {
                    return {
                        ok: false,
                        error: error.message
                    }
                }
            }
        )
    }
}

export default resolvers;