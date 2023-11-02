const express = require('express');
const app = express();
var server = require('http').createServer(app);

app.use(express.static('public'));
app.use('/bulma', express.static(__dirname + '/node_modules/bulma/css'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`listening on *: ${PORT}`);
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

// Use Socket.IO
const io = require('socket.io')(server);

var users = [];
var usersID = [];

io.on('connection', (socket) => {
	socket.on('newUserName', (userName) => {
		users.push(userName);
		usersID.push(socket.id);

		var socketIndex = usersID.indexOf(socket.id);
		var onlineUser = users[socketIndex];

		if (onlineUser > '') {
			console.log('User ', onlineUser, 'is connected with socket ID: ', socket.id);
		}

		io.emit('listOfAvailableUsers', usersID, users);
	});

	//  User is typing  Implementation
	socket.on('focusTypingStatus', () => {
		socket.broadcast.emit('focusStatusFromServer');
	});
	socket.on('keyupTypingStatus', () => {
		socket.broadcast.emit('keyupStatusFromServer');
	});
	socket.on('keydownTypingStatus', () => {
		socket.broadcast.emit('keydownStatusFromServer');
	});
	socket.on('blurTypingStatus', () => {
		socket.broadcast.emit('blurStatusFromServer');
	});
	socket.on('falseTypingStatus', () => {
		socket.broadcast.emit('falseStatusFromServer');
	});
	//  User is typing  Implementation end

	socket.on('messageFromClient', (data) => {
		var receiverID = usersID[users.indexOf(data.receiver)];
		console.log(receiverID);
		console.log(data);
		io.to(receiverID).emit('messageFromServer', data);
	});

	socket.on('disconnect', () => {
		var socketIndex = usersID.indexOf(socket.id);
		var offlineUser = users[socketIndex];

		var disconnectedUserInfo = {
			userID: socket.id,
			user: offlineUser
		};

		if (offlineUser > '') {
			console.log('User ', offlineUser, 'is disconnected, from socket ID: ', socket.id);
		}

		io.emit('userDisconnectedFromServer', disconnectedUserInfo);

		// removing disconnected user from array variables
		users.splice(socketIndex, 1);
		usersID.splice(socketIndex, 1);
	});
});
