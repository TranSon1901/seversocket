var express = require('express');
var app = express();
let server = require('http').Server(app);
const io = require("socket.io")(server, {
   cors: {
     
   },
});
server.listen(3004, ()=>{
   console.log("server connnet listen 3004");
});

var array_user_socket = {};

/*add user */
const addUser = (userId, socketId) => {
   /*array_user_socket */
   array_user_socket[userId] = {"socket_id":socketId, "uid_user":userId};
};

/*remove user */
const removeUser = (socketId) => {
   for( var key in array_user_socket ) {
      if(array_user_socket[key].socket_id == socketId){
         uid_user = array_user_socket[key].uid_user;
         delete array_user_socket[key];
         return uid_user;
      }
   }
};

/*get user */
function get_socket_id (userId) {
   if(!array_user_socket.hasOwnProperty(userId)) return "";
   return array_user_socket[userId].socket_id;
}

/*connect socket */
io.on('connection', (socket) => {
   console.log('have user connected');

   /*take user_id and socket_id form user */
   socket.on("addUser", (userId) =>{
      let socket_id = socket.id;
      addUser(userId, socket.id);
      io.emit("getUser", {userId , socket_id} );
      console.log(array_user_socket);
   })
   socket.on("get_friend_socket_id", (uid_user_friend) =>{
      let socket_id_friend = get_socket_id(uid_user_friend);
      if(socket_id_friend != "") io.emit("socket_id_friend", socket_id_friend);
   })

   /*check user disconnect and emit user online client*/
   socket.on("disconnect", () => {
      console.log("a user disconnected!");
      let uid_user = removeUser(socket.id);
      io.emit("offline_user", uid_user);
      console.log(array_user_socket);
    });

   /*socket on listen send message and emit message client */
   socket.on("send-msg", ({uid_user, uid_friend, message }) => {
      let uid_socket_friend = get_socket_id(uid_friend)
      if(uid_socket_friend != ""){
         io.to(uid_socket_friend).emit("socket_message", {
            uid_user,
            message,
         });
      }

   });

   /*socket on sending message and emit get sending client */
   socket.on("typing", (uid_user_friend)=>{
      let uid_socket_friend = get_socket_id(uid_user_friend);
      if(uid_socket_friend != "") io.to(uid_socket_friend).emit("get_typing", "đang soạn tin nhắn ...");
   })

   /*socket on stopsending message and emit get sending client */
   socket.on("stop_typing", (uid_user_friend)=>{
      let uid_socket_friend = get_socket_id(uid_user_friend);
      if(uid_socket_friend != "") io.to(uid_socket_friend).emit("get_typing", "");
   })
});

