import { Resolvers } from "src/types/resolvers";
import { EmailSignInMutationArgs, EmailSignInResponse } from '../../../types/graph';
import User from "../../../entities/User";
import createJWT from "../../../utils/createJWT";

const resolvers : Resolvers ={
  
    Mutation: {
        EmailSignUp: async (
            _,
            args: EmailSignInMutationArgs
        ): Promise<EmailSignInResponse> =>{
            const {email} = args;
            try{
                const existingUser = await User.findOneBy({email});
                if(existingUser) {
                    return {
                        ok: false,
                        error: "You should log in in instead",
                        token: null
                    };
                }else {
                    const newUser= await User.create({...args}).save();
                    const token = createJWT(newUser.id)
                    return {
                        ok: true,
                        error: null,
                        token
                    };
                }
            }catch(error) {
                return {
                    ok: false,
                    error: error.message,
                    token: null 
                };
                
            }
        }
    }
}

export default resolvers;