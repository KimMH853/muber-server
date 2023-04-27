import User from "../entities/User";
import jwt from 'jsonwebtoken'

const decodeJWT = async (token: string): Promise<User|undefined> =>{
    try {
        const decode: any = jwt.verify(token, process.env.JWT_TOKEN||"");
        const {id} = decode;
        const user = await User.findOneBy({id});
        return user||undefined;

    } catch(error) {
        return undefined;
    }
}

export default decodeJWT;
