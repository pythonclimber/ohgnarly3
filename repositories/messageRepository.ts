import {Message, MessageDocument, MessageModel} from '../models/message';


export class MessageRepository {
    getRecentMessagesByPage = async (millisAgo: number, page: number) => {
        return await MessageModel.find({createdAt: {$gt: new Date(Date.now() - millisAgo)}})
            .sort("-createdAt")
            .skip(page * 25)
            .limit(25)
            .exec() as MessageDocument[];
    };

    addMessage = async (message: Message) => {
        const added = new MessageModel(message);
        return await added.save() as any as MessageDocument;
    };

    searchByText = async (searchText: string) => {
        return await MessageModel.find({messageBody: {$regex: searchText, $options: 'i'}}).exec() as MessageDocument[];
    };

    searchByDate = async (startDate: Date, endDate: Date) => {
        return await MessageModel.find({createdAt: {$gt: startDate, $lt: endDate}}).exec() as MessageDocument[];
    };
}