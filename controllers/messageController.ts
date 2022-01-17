import {Request, Response} from 'express';
import {Message, MessageDocument} from '../models/message';
import {MessageRepository} from '../repositories/messageRepository';
import {stringifyParam, sortMessages} from '../services/utilities';


export class MessageController {
    io: any;
    private readonly messageRepository: MessageRepository;

    constructor(io: any, messageRepository?: MessageRepository) {
        this.io = io;
        this.messageRepository = messageRepository || new MessageRepository();
    }

    getMessages = async (req: Request, res: Response) => {
        try {
            let pageNumber = parseInt(stringifyParam(req.query.pageNumber)) || 0;
            const millisAgo = (14 * 24 * 60 * 60 * 1000);
            let messages = await this.messageRepository.getRecentMessagesByPage(millisAgo, pageNumber);
            messages = sortMessages(messages);
            res.send(messages);
        } catch (err) {
            return res.send(err);
        }
    };

    createMessage = async (req: Request, res: Response) => {
        try {
            const message = await this.messageRepository.addMessage(req.body);
            this.io.emit('chat-message', message);
            return res.status(200).end();
        } catch (err) {
            return res.send(err);
        }
    };

    searchMessages = async (req: Request, res: Response) => {
        try {
            if (!req.body.searchDate && !req.body.searchText) {
                res.send({error: 'Must provide search value'});
            }

            let messages: MessageDocument[];
            if (req.body.searchDate) {
                const startDate = new Date(req.body.searchDate);
                const endDate = new Date(req.body.searchDate);
                endDate.setDate(endDate.getDate() + 1);
                console.log(`Debug: ${startDate} - ${endDate}`)
                messages = await this.messageRepository.searchByDate(startDate, endDate);
            } else {
                messages = await this.messageRepository.searchByText(req.body.searchText);
            }

            res.send(sortMessages(messages));
        } catch (err) {
            res.send(err);
        }
    };

    addMessage = async (msg: Message) => {
        const message = await this.messageRepository.addMessage(msg);
        this.io.emit('chat-message', message);
    };

// getConversations: RequestHandler = (req, res) => {
//     const userId = req.params.userId;
//     let conversations = new Array<any>();
//     Conversation.find({userId1: {$eq: userId}}).exec((err: any, convos1: any) => {
//         if (err) {
//             console.error(err);
//             res.status(500);
//         }
//
//         conversations = conversations.concat(convos1);
//         Conversation.find({userId2: {$eq: userId}}).exec((err: any, convos2: any) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500);
//             }
//
//             conversations = conversations.concat(convos2);
//             res.send(conversations);
//         });
//     });
// };
//
// getConversation: RequestHandler = (req, res) => {
//     const conversationId = req.params.conversationId;
//     const result: any = {};
//     Conversation.findById(conversationId).exec((err: any, conversation: any) => {
//         if (err) {
//             console.error(err);
//             res.status(505);
//         }
//
//         result.conversationId = conversation.conversationId;
//         result.userId1 = conversation.userId1;
//         result.userId2 = conversation.userId2;
//         User.findById(conversation.userId1).exec((err: any, user1: any) => {
//             if (err) {
//                 console.error(err);
//                 res.status(505);
//             }
//
//             result.user1 = user1;
//
//             User.findById(conversation.userId2).exec((err: any, user2: any) => {
//                 if (err) {
//                     console.error(err);
//                     res.status(505);
//                 }
//
//                 result.user2 = user2;
//                 res.send(result);
//             });
//         });
//     });
// };
//
// getConversationMessages: RequestHandler = (req, res) => {
//     const conversationId = req.params.conversationId;
//     messageModel.find({
//         conversationId: {$eq: conversationId},
//         createdAt: {$gt: new Date(Date.now() - (24 * 60 * 60 * 1000))}
//     }).exec((err: any, messages: any) => {
//         if (err) {
//             console.error(err);
//             res.status(500);
//         }
//
//         res.send(messages);
//     });
// };
}