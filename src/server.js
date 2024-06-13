import { app } from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { CONNECTION, DISCONNECT, NEW_MESSAGE } from "./constants.js";
import { v4 as uuid } from "uuid";
import { verifyJWTSocket } from "./middlewares/auth.middleware.js";
import { Message } from "./models/message.model.js";

const server = createServer(app);
const io = new Server(server, {});
const userSocketIDs = new Map();

io.use(verifyJWTSocket);

io.on(CONNECTION, (socket) => {
    console.log("User Connected", socket.id);

    // Push Current User in Set
    userSocketIDs.set(socket.user._id.toString(), socket.id);

    socket.on(NEW_MESSAGE, async ({ chatID, content, members }) => {
        // Real Time Message
        const messageForRealTime = {
            _id: uuid(),
            content: content,
            sender: {
                senderId: socket.user._id,
                senderName: socket.user.name,
            },
            chat: chatID,
            createdAt: new Date().toISOString(),
        };

        // Get Other Online Members
        const onlineUsersInChat = members.map((member) =>
            userSocketIDs.get(member.toString())
        );

        // Real Time Message --> Emit --> Frontend
        io.to(onlineUsersInChat).emit(NEW_MESSAGE, {
            chatID,
            messageForRealTime,
        });
        io.to(onlineUsersInChat).emit(NEW_MESSAGE_ALERT, { chatID });
        
        // Message For DB
        const messageForDB = {
            _id: uuid(),
            content: content,
            sender: socket.user._id,
            chat: chatID,
        };

        // Message For DB --> Save in DB
        try {
            await Message.create(messageForDB);
        } catch (error) {
            throw new ApiError(400, "Couldn't Save Message in DB.");
        }
    });


    // TODO : SOME COOL FEATURES
    // socket.on(START_TYPING, ({ members, chatId }) => {
    //     const membersSockets = getSockets(members);
    //     socket.to(membersSockets).emit(START_TYPING, { chatId });
    //   });
    
    //   socket.on(STOP_TYPING, ({ members, chatId }) => {
    //     const membersSockets = getSockets(members);
    //     socket.to(membersSockets).emit(STOP_TYPING, { chatId });
    //   });

    socket.on(DISCONNECT, () => {
        console.log(`User ${socket.id} got Disconnected!`);
        userSocketIDs.delete(socket.user._id.toString());
    });
});

export { server };
