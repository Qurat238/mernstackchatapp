import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";

//routes
import UserRoute from "./routes/UserRoute.js";
import ChatRoute from "./routes/ChatRoute.js";
import MessageRoute from "./routes/MessageRoute.js";

const app = express();

const corsConfig = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  method: ["GET", "POST", "PUT", "DELETE"],
};

app.options("", cors(corsConfig));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());

if(process.env.NODE_ENV !== "PRODUCTION"){
// config
dotenv.config({path:"config/config.env"});
}

//Creating server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

//Socket.io
const io = new Server(server, {
  pingTimeout:60000,
  cors: {
    origin: "https://mern-chat-app-frontend-chi.vercel.app"
  }
})

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("Connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // socket.on("typing", (room) => socket.in(room).emit("typing"));

  // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessage) => {
    var chat = newMessage.chat;
    if(!chat.users){
      return console.log("users not found");
    }
    chat.users.forEach((user) => {
      if(user._id == newMessage.sender._id) return;
      socket.in(user._id).emit("message received", newMessage);
    });
  });

  socket.off("setup", () => {
    console.log("User Disconnected");
    socket.leave(userData._id);
  });

});

//Connecting to MongoDB
const connectDatabase = () => {
  mongoose.connect(process.env.DB_URI,{useNewUrlParser:true,useUnifiedTopology:true
  }).then((data)=>{
      console.log(`Mongodb connected with server: ${data.connection.host}`);
  });
}
connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use('/api/v1/users', UserRoute);
app.use('/api/v1/chats', ChatRoute);
app.use('/api/v1/messages', MessageRoute);


