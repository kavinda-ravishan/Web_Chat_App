const userDatabase = require("../Database/userDatabase");
const mongoose = require("../Database/mongoDatabase");
const io = require("../modules/modules").io;
const jwt = require("jsonwebtoken");
const Message = require("../model/message");
const connectedUsers = {};
const Messages = [];

function socketEvents(socket) {
  socket.on("init", (token) => {
    try {
      const ticket = jwt.verify(token, process.env.TOKEN_SECRET);
      userDatabase.findOne({ _id: ticket._id }, (err, user) => {
        if (err) {
          io.to(socket.id).emit("chatMessage", {
            name: "Server",
            msg: "Something went wrong !",
          });
          return;
        }
        if (!user) {
          io.to(socket.id).emit("chatMessage", {
            name: "Server",
            msg: "Sign out and Login Agin",
          });
          return;
        }
        connectedUsers[socket.id] = user.userName;
        io.to(socket.id).emit("initChatMessages", Messages);
        socket.broadcast.emit("userConnected", user.userName);
      });
    } catch (err) {
      return;
    }
  });

  socket.on("disconnect", () => {
    const name = connectedUsers[socket.id];
    if (name) {
      delete connectedUsers[socket.id];
      socket.broadcast.emit("userDisconnected", name);
    }
  });

  socket.on("chatMessage", async (msg) => {
    const message = { name: connectedUsers[socket.id], msg: msg };

    if (message.name) {
      const msgDataForMongoDB = new Message(message);

      if (Messages.length < 20) {
        try {
          if (mongoose.connection.readyState === 1)
            await msgDataForMongoDB.save();
        } catch (err) {}
        Messages.push(message);
      } else {
        try {
          if (mongoose.connection.readyState === 1)
            await msgDataForMongoDB.save();
        } catch (err) {}
        Messages.push(message);

        Message.deleteOne({}, function (_err, _noMessages) {});
        Messages.shift();
      }
      io.emit("chatMessage", message);
    } else {
      io.to(socket.id).emit("chatMessage", {
        name: "Server",
        msg: "Please refresh the page or Sign out and Login Agin",
      });
    }
  });
}

module.exports.socketEvents = socketEvents;
module.exports.connectedUsers = connectedUsers;
module.exports.Messages = Messages;
