import { Resolvers } from "src/types/resolvers";
import Verification from "../../../entities/Verification";
import { StartEmailVerificationMutationArgs, StartEmailVerificationResponse } from "src/types/graph";
import { sendVerificationEmail } from "../../../utils/sendEmail";


const resolvers: Resolvers ={
    Mutation: {
        StartEmailVerification: async (
            _,
            args: StartEmailVerificationMutationArgs
        ): Promise<StartEmailVerificationResponse> =>{
            const {email} = args;
            try {
                const existingVerification = await Verification.findOneBy({payload: email});
                if(existingVerification) {
                    existingVerification.remove();
                }
                const newVerification=await Verification.create({payload: email,
                target: "EMAIL"}).save();
                 await sendVerificationEmail(newVerification.payload, newVerification.key);
                return{
                    ok: true,
                    error: null
                }
            } catch(error) {
                return{
                    ok: false,
                    error: error.message
                }
            }
        }
    }
}

export default resolvers;