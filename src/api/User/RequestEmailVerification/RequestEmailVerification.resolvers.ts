import User from "../../../entities/User";
import Verification from "../../../entities/Verification";
import { RequestEmailVerificationResponse } from "src/types/graph";
import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { sendVerificationEmail } from "../../../utils/sendEmail";

const resolvers: Resolvers ={
    Mutation: {
        RequestEmailVerification: privateResolver(
            async(_, __, {req}): Promise<RequestEmailVerificationResponse> =>{
                const user: User = req.user;
                if(user.email && !user.verifiedEmail) {
                    try{
                        const oldVerification = await Verification.findOneBy({payload: user.email});
                        if(oldVerification){
                            oldVerification.remove();
                        }
                        const newVerification = await Verification.create({payload: user.email,
                        target: "EMAIL"}).save();
                        await sendVerificationEmail(newVerification.payload, newVerification.key);
                        return {
                            ok: true,
                            error: null
                        };
                    }catch(error) {
                        return {
                            ok: false,
                            error: error.message
                        };
                    }
                } else {
                    return {
                        ok: false,
                        error: "Your user has no email to verify"
                    }
                } 
            }
        )
    }
}
export default resolvers