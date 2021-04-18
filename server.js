const http = require('http');  
const url = require('url'); 
const io = require('socket.io')(http); 

const mongoConnect = require('./util/database').mongoConnect;

const chatRouter = require('./chatRouter');

const ChatMessage = require('./models/chatMessage');

const  users = {}  //to store users
  
const server= http.createServer(chatRouter.handler);  //node http server
mongoConnect(() =>{
    //starting node server
    server.listen(3000, () => {
        console.log("Server is running on 3000 port");
    });      
});
 

//related to the socket io functionality
const listener = io.listen(server); 

listener.sockets.on('connection', function(socket){  
   //receiving message from client
    socket.on('new-user', name => {
        users[socket.id] = name; //assigning a user with unique socket id
        //sending message to all the clients
        socket.broadcast.emit('user-connected', name);   
    });
    //receiving message from the client  
    socket.on('send-chat-message', (message) =>{  
        //sending message to all the clients
        let logMsg = {name: users[socket.id], message: message};
        socket.broadcast.emit('chat-message', 
            {message: message, name: users[socket.id] } ); //to send every one, excluding sender
        //console.log("Logging message: " + JSON.stringify(logMsg));
        let chatMsg_ = new ChatMessage(logMsg.name, logMsg.message);
        chatMsg_.save();
    }); 
    
    socket.on('disconnect', () => {
        //sending message to all the clients
        //printing the user related chat messages.
        console.log("User disconnected: ", users[socket.id]);
        let chatMsgs = ChatMessage.fetchMsgByUser(users[socket.id]);    
        chatMsgs.then(msgs =>{
            console.log(msgs);
        })
        .catch(err => {
            console.log(err);
        });    
        

        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id];
    });
}); 