import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { SendChatMessageMutationArgs, SendChatMessageResponse } from '../../../types/graph';
import User from "../../../entities/User";
import Chat from "../../../entities/Chat";
import Message from "../../../entities/Message";

const resolvers: Resolvers = {
    Mutation: {
        SendChatMessage: privateResolver(async(_, args: SendChatMessageMutationArgs, {req, pubsub}):Promise<SendChatMessageResponse> =>{
            const user: User = req.user;
            try {
                const chat = await Chat.findOneBy({id: args.chatId});
                if(chat) {
                    if(chat.passengerId ===user.id || chat.driverId===user.id) {
                        const message = await Message.create({text: args.text, chat, user}).save();
                        pubsub.publish("newChatMessage", {MessageSubscription: message})
                        return {
                            ok: true,
                            error: null,
                            message
                        }
                    } else {
                        return {
                            ok: false,
                            error: "Unauthorized",
                            message: null
                        }
                    }
                } else {
                    return {
                        ok: false,
                        error: "Chat not found",
                        message: null
                    }
                }
            }catch(error) {
                return {
                    ok: false,
                    error: error.message,
                    message: null
                }
            }

        })
    }
};

export default resolvers;
