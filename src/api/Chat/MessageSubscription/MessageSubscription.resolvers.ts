import { withFilter } from "graphql-subscriptions";
import Chat from "../../../entities/Chat";
import User from "../../../entities/User";

const resolvers = {
    Subscription: {
        MessageSubscription: {
            subscribe: withFilter((_, __, {pubsub}) => pubsub.asyncIterator("newChatMessage"), async(payload, _, context)=>{
                const user: User = context.currentUser;
                console.log(context)
                const {
                    MessageSubscription: {chatId}
                } = payload;
                console.log(chatId);
                try {
                    const chat = await Chat.findOneBy({id: chatId});
                    if(chat) {
                        return chat.driverId===user.id||chat.passengerId===user.id
                    } else {
                        return false;
                    }
                }catch(error){
                    return false
                }
            })
        }
    }
}

export default resolvers;