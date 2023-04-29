import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { CompleteEmailVerificationMutationArgs, CompleteEmailVerificationResponse } from '../../../types/graph';
import Verification from "../../../entities/Verification";
import User from "../../../entities/User";

const resolvers: Resolvers = {
    Mutation: {
        CompleteEmailVerification: privateResolver(
            async (
                _, 
                args: CompleteEmailVerificationMutationArgs, {req}
                ): Promise<CompleteEmailVerificationResponse> => {
            const user: User = req.user;
            const {key} = args;
            if(user.email) {
                try {
                    const verification = await Verification.findOneBy({key, payload: user.email});
                    if(verification){
                        user.verifiedEmail = true;
                        user.save();
                        return {
                            ok: true,
                            error: null
                        }
                    }else{
                        return {
                            ok: false,
                            error: "Con't verify email"
                        };
                    }
                } catch (error) {
                    return {
                        ok: false,
                        error: error.message
                    };
                }
            } else {
                return {
                    ok: false,
                    error: "No email to verify"
                };
            }
        })
    }
    
};

export default resolvers;