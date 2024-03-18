import mongoose from 'mongoose';
import {User, UserDocument, userModel, userSchema} from '../models/user';


const chatUserModel = mongoose.model("ChatUser", userSchema, "ChatUsers");
export const PendingUserModel = mongoose.model("PendingUser", userSchema, "PendingUsers");

export class UserRepository {
    getUserByUserName = async (userName: string) => {
        const user = await userModel.findOne({userName: userName}).exec() as UserDocument;
        return user;
    };

    updateUser = async(userName: string, user: User) => {
        await userModel
            .findOneAndUpdate({userName: userName}, user, {useFindAndModify: false})
            .exec();
        return await this.getUserByUserName(userName);
    }

    getAllUsers = async () => {
        const users = await userModel.find().exec() as UserDocument[];
        return users;
    }

    getUserByEmailAddress = async (emailAddress: string) => {
        return await userModel.findOne({emailAddress: emailAddress}).exec() as UserDocument;
    };

    getChatUser = async (userName: string) => {
        return await chatUserModel.findOne({userName: userName}).exec() as UserDocument;
    };

    addPendingUser = async (user: User) => {
        const pendingUser = new PendingUserModel(user);
        return pendingUser.save();
    };

    deletePendingUser = async(userName: string) => {
        return await PendingUserModel.deleteOne({userName: userName}).exec();
    }

    getAllPendingUsers = async () => {
        return await PendingUserModel.find().exec() as UserDocument[];
    };
}