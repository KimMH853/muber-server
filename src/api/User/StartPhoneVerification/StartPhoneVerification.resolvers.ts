import { Resolvers } from "src/types/resolvers";
import Verification from "../../../entities/Verification";
import sendSMS from "../../../utils/sendSMS";
import { StartPhoneVerificationMutationArgs, StartPhoneVerificationResponse } from "../../../types/graph";


const resolvers: Resolvers ={
    Mutation: {
        StartPhoneVerification: async (
            _,
            args: StartPhoneVerificationMutationArgs
        ): Promise<StartPhoneVerificationResponse> =>{
            const {phoneNumber} = args;
            try {
                const existingVerification = await Verification.findOneBy({payload: phoneNumber});
                if(existingVerification) {
                    existingVerification.remove();
                }
                const newVerification = await Verification.create({payload: phoneNumber,
                target: "PHONE"}).save();
                 await sendSMS(newVerification.payload, newVerification.key);
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