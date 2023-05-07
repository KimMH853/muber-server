import { Resolvers } from "src/types/resolvers";
import privateResolver from "../../../utils/privateResolver";
import { GetChatQueryArgs, GetChatResponse } from '../../../types/graph';
import User from "../../../entities/User";
import Chat from "../../../entities/Chat";
import { getRepository } from "typeorm";

const resolvers : Resolvers = {
    Query: {
        GetChat: privateResolver(async(_,args: GetChatQueryArgs, {req}):
            Promise<GetChatResponse> =>{
                const user: User = req.user;
                try {
                    //const chat = await Chat.findOneBy({id: args.chatId});
                    const chat = await getRepository(Chat).createQueryBuilder("chat")
                        .leftJoinAndSelect("chat.messages", "message")
                        .where("chat.id = :id", { id: args.chatId })
                        .getOne();
                    if(chat) {
                        if(chat.passengerId ===user.id||chat.driverId === user.id) {
                            return {
                                ok: true,
                                error: null,
                                chat
                            };
                        }else {
                            return {
                                ok: false,
                                error: "Not authorized to see this chat",
                                chat: null
                            }
                        }
                    } else {
                        return {
                            ok: false,
                            error: "Not found",
                            chat: null
                        };
                    }
                }catch(error) {
                    return {
                        ok: false,
                        error: error.message,
                        chat: null
                    }
                }
            }
        )
    }
};

export default resolvers;