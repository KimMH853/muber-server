import { Resolvers } from "src/types/resolvers";
import { EmailSignInMutationArgs, EmailSignInResponse } from 'src/types/graph';
import User from "../../../entities/User";
import createJWT from "../../../utils/createJWT";

const resolvers: Resolvers = {
    Query: {
        user: (parent, args, {req}) => {
          console.log(req);
          return "";
        }
      },
    Mutation: {
        EmailSignIn: async (
            _, 
            args: EmailSignInMutationArgs,
            context
        ): Promise<EmailSignInResponse> => {
            const {email, password} = args;
            try{
                const user = await User.findOneBy({email: email});
                if(!user){
                    return {
                        ok: false,
                        error: "No user found with that email",
                        token: null
                    };
                }
                const checkPassword = await user.comparePassword(password);
                const token = createJWT(user.id);
                if(checkPassword) {
                    return {
                        ok: true,
                        error: null,
                        token
                    };
                } else {
                    return {
                        ok: false,
                        error: "Wrong password",
                        token: null
                    }
                }
            } catch(error) {
                return {
                    ok: false,
                    error: error.message,
                    token: null
                }
            }
        }
    }
}

export default resolvers;