const socket = io();

var sender = '';
var receiver = '';
let messageField = document.getElementById('message');

function getUserName() {
	var userName = document.getElementById('userName').value;
	sender = userName;
	if (sender > '') {
		socket.emit('newUserName', userName);
		var loginFormArea = document.getElementById('loginFormArea');
		loginFormArea.style.display = 'none';

		var welcomeMessage = document.getElementById('welcomeMessage');
		welcomeMessage.setAttribute('class', 'welcomeTextCenter');

		var iTag = document.createElement('i');
		iTag.setAttribute('class', 'fa fa-comments');
		iTag.setAttribute('aria-hidden', 'true');
		iTag.setAttribute('style', 'font-size:100px;');
		welcomeMessage.appendChild(iTag);

		var h2Tag = document.createElement('h3');
		h2Tag.setAttribute('class', 'title is-3');
		var message = document.createTextNode('Select a Conversation');
		h2Tag.appendChild(message);
		welcomeMessage.appendChild(h2Tag);

		var pTag = document.createElement('p');
		pTag.setAttribute('class', 'subtitle is-5');
		var subMessage = document.createTextNode('Try selecting a conversation or searching for someone specific.');
		pTag.appendChild(subMessage);
		welcomeMessage.appendChild(pTag);

		var loginStatus = document.getElementById('loginStatus');
		var logedInUser = document.createElement('p');
		var bTag = document.createElement('b');
		logedInUser.appendChild(bTag);
		bTag.innerText = userName;
		loginStatus.appendChild(logedInUser);
	}
	return false;
}

socket.on('listOfAvailableUsers', (usersID, users) => {
	var onlineUsersList = document.getElementById('onlineUsersList');
	onlineUsersList.remove();

	var divTagClassButtons = document.createElement('div');
	divTagClassButtons.setAttribute('class', 'buttons');
	divTagClassButtons.setAttribute('id', 'onlineUsersList');

	var usersArea = document.getElementById('usersArea');
	usersArea.appendChild(divTagClassButtons);

	usersID.forEach(function(userID) {
		var onlineUsersList = document.getElementById('onlineUsersList');
		var buttonTag = document.createElement('button');
		buttonTag.setAttribute('class', 'button is-success is-light is-fullwidth');
		buttonTag.setAttribute('id', userID);
		buttonTag.setAttribute('onclick', 'showMessageBox(this.innerText);');

		var onlineUser = document.createTextNode(users[usersID.indexOf(userID)]);
		buttonTag.appendChild(onlineUser);
		onlineUsersList.appendChild(buttonTag);

		var lineSeparate = document.createElement('hr');
		onlineUsersList.appendChild(lineSeparate);
	});

	var selfUser = document.getElementById(socket.id);
	if (selfUser > '') {
		selfUser.remove();
	}
});

// Events for server
messageField.addEventListener('keyup', (e) => {
	if (e.target.value > '') {
		socket.emit('keyupTypingStatus');
	}
	if ((e.key = 'Backspace')) {
		if (e.target.value < ' ') {
			socket.emit('falseTypingStatus');
		}
	}
});

messageField.addEventListener('focus', (e) => {
	if (e.target.value > ' ') {
		console.log(e.target.value + ' From Focus Event');
		socket.emit('focusTypingStatus');
	}
	if (e.target.value < ' ') {
		console.log('Box is empty, from focus event!');
		socket.emit('falseTypingStatus');
	}
});

messageField.addEventListener('keydown', (e) => {
	if (e.target.value > ' ') {
		socket.emit('keydownTypingStatus');
	}
	if (e.target.value < ' ') {
		socket.emit('falseTypingStatus');
	}
});

messageField.addEventListener('blur', () => {
	socket.emit('blurTypingStatus');
});

// Events from Server
socket.on('focusStatusFromServer', () => {
	let typingSignalsDiv = document.getElementById('typingSignals');
	typingSignalsDiv.classList.add('showTypingSignals');
	typingSignalsDiv.classList.remove('hideTypingSignals');
});

socket.on('keyupStatusFromServer', () => {
	let typingSignalsDiv = document.getElementById('typingSignals');
	typingSignalsDiv.classList.add('showTypingSignals');
	typingSignalsDiv.classList.remove('hideTypingSignals');
});

socket.on('keydownStatusFromServer', () => {
	let typingSignalsDiv = document.getElementById('typingSignals');
	typingSignalsDiv.classList.add('showTypingSignals');
	typingSignalsDiv.classList.remove('hideTypingSignals');
});

socket.on('blurStatusFromServer', () => {
	let typingSignalsDiv = document.getElementById('typingSignals');
	typingSignalsDiv.classList.remove('showTypingSignals');
	typingSignalsDiv.classList.add('hideTypingSignals');
});

socket.on('falseStatusFromServer', () => {
	let typingSignalsDiv = document.getElementById('typingSignals');
	typingSignalsDiv.classList.remove('showTypingSignals');
	typingSignalsDiv.classList.add('hideTypingSignals');
});

// Message to server

function sendMessage() {
	var message = document.getElementById('message').value;
	var chats = document.getElementById('chats');

	socket.emit('messageFromClient', {
		sender: sender,
		receiver: receiver,
		message: message
	});

	var divTag = document.createElement('div');
	divTag.setAttribute('class', 'notification is-info is-light');
	var spanTag = document.createElement('span');
	var strongTag = document.createElement('strong');
	var emTag = document.createElement('em');
	var msgReceiver = document.createTextNode(`Me to ${receiver}: `);
	emTag.appendChild(msgReceiver);
	strongTag.appendChild(emTag);
	spanTag.appendChild(strongTag);
	var msgTxt = document.createTextNode(message);

	divTag.appendChild(spanTag);
	divTag.appendChild(msgTxt);
	chats.appendChild(divTag);

	document.getElementById('message').value = '';

	return false;
}

socket.on('userDisconnectedFromServer', (disconnectedUserInfo) => {
	var offlineUser = document.getElementById(disconnectedUserInfo.userID);
	if (offlineUser > '') {
		offlineUser.remove();
	}
});

function showMessageBox(reciverName) {
	receiver = reciverName;
	console.log('Sender: ', sender);
	console.log('Receiver: ', receiver);
	if (sender > '') {
		var welcomeMessage = document.getElementById('welcomeMessage');
		if (welcomeMessage > '') {
			welcomeMessage.remove();
			var chatFormArea = document.getElementById('chatFormArea');
			chatFormArea.style.display = 'block';
		} else {
			var chatFormArea = document.getElementById('chatFormArea');
			chatFormArea.style.display = 'block';
		}
	} else {
		alert('Please enter username to start chat!');
	}
}

socket.on('messageFromServer', (data) => {
	var welcomeMessage = document.getElementById('welcomeMessage');
	if (welcomeMessage > '') {
		welcomeMessage.remove();
	}
	var chats = document.getElementById('chats');
	var msgDiv = document.createElement('div');
	msgDiv.setAttribute('class', 'notification is-warning is-light');
	var divTxt = document.createTextNode(data.sender + ': ' + data.message);
	msgDiv.appendChild(divTxt);
	chats.appendChild(msgDiv);

	console.log(chats);
});
