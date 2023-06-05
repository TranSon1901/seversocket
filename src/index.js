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

      /*save user_id & socket id to array array_user_socket */
      let socket_id = socket.id;
      addUser(userId, socket.id);
      
      /*send user id & socket id to socket client */
      io.to(socket.id).emit("getUser", {userId , socket_id});
      console.log(array_user_socket);
   })

   socket.on("get_friend_socket_id", (uid_user_friend) =>{

      /*get socket id from uid_user_friend */
      let socket_id_friend = get_socket_id(uid_user_friend);

      /*send socket id to socket client */
      if(socket_id_friend != "") io.to(socket.id).emit("socket_id_friend", socket_id_friend);
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

      /*get socket id from uid_friend */
      let uid_socket_friend = get_socket_id(uid_friend)
      if(uid_socket_friend != ""){

         /*send msg: socket message & uid_user, message to socket client friend */
         io.to(uid_socket_friend).emit("socket_message", {uid_user,message});
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

   /*socket on sending message and emit get sending client */
   socket.on("friend_status", (str_uid_user_friend)=>{

      /*get friend list status */
      let array_friend = str_uid_user_friend.split(",");
      let array_friend_status = [];
      for(let i = 0; i < array_friend.length; i++){
         let uid_user_friend = array_friend[i];

         /*check uid_user in user_socket */
         let user_status = "0";
         if(array_user_socket.hasOwnProperty(uid_user_friend)) user_status = "1";

         array_friend_status[i].uid_user = uid_user_friend;
         array_friend_status[i].status = user_status;
      }
      io.to(socket.id).emit("friend_list_status", JSON.stringify(array_friend_status));
   })
});

