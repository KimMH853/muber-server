import { Resolvers } from "src/types/resolvers";
import { StartPhoneVerificationMutationArgs, StartPhoneVerificationResponse } from '../../../types/graph';
import Verification from "../../../entities/Verification";
import sendSMS from "../../../utils/sendSMS";


const resolvers: Resolvers ={
    Mutation: {
        StartPhoneVerification: async (
            _,
            args: StartPhoneVerificationMutationArgs
        ): Promise<StartPhoneVerificationResponse> =>{
            const {phoneNumber} = args;
            console.log("start")
            try {
                const existingVerification = await Verification.findOneBy({payload: phoneNumber});
                if(existingVerification) {
                    existingVerification.remove();
                }
                const newVerification = await Verification.create({payload: phoneNumber,
                target: "PHONE"}).save();
                const result= await sendSMS(newVerification.payload, newVerification.key);
                    console.log(result)
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