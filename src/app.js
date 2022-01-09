const express = require("express")
const app = express();
const path = require("path")

const port = process.env.PORT || 3000
const hbs = require('hbs');
const cors = require('cors')
/*** encryption/hashing of password */
const bcrypt = require("bcryptjs")

/***connecting to databaase */
require("./db/conn");
const Register = require("./models/newUser")// db collection
const Contact = require("./models/contact")// db collection

/***to read the data obtained by post method */

app.use(express.json());
app.use(express.urlencoded({ extended: false }))// so that data received is not undefined


/**for socket.io */
const server = require('http').Server(app);//creates a server
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})// passes theat server to socket.io

/** PEERjs  */
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.use('/peerjs', peerServer);
/*cors */
app.use(cors())

/******        STATIC FILES    ***********/

const static_path = path.join(__dirname, "../public")
app.use(express.static(static_path))

/*********** View Engine ******/


app.set("view engine", 'hbs')
const views_path = path.join(__dirname, "../templates/views")
app.set("views", views_path)

/****including partials */


const partials_path = path.join(__dirname, "../templates/partials")
hbs.registerPartials(partials_path)

//Routes
const mainRouter = require('./routes/main_router');
const { connection } = require("mongoose");
app.use('/', mainRouter);

// socket connection

io.on('connection', socket => {

    /*added here*/ socket.on('join-room', (roomId, userId, userName) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId)// will broadcaast to everyone  else a new user joined in the room except for yourself
    socket.on('message', (message) => {
          /*added here*/  io.to(roomId).emit('createMessage', message, userName)// it will be send to users in that particular room id only
    })

    socket.on('disconnect', () => {
        socket.broadcast.to(roomId).emit('user-disconnected', userId)
            ;

    })
})
})
server.listen(port, () => {
    console.log(`listening to "http://localhost:${port}"`)
})