const socket = io();

const messagesTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;
const listTemplate = document.querySelector(
  '#list-users-template'
).innerHTML;
const messageInput = document.querySelector('#message-input');
const messages = document.querySelector('#messages');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const newMessage = messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = messages.offsetHeight

  // Height of messages container
  const containerHeight = messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
      messages.scrollTop = messages.scrollHeight
  }
}

socket.on('message', (message) => {
  const html = Mustache.render(messagesTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('kk:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll()
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.text,
    createdAt: moment(message.createdAt).format('kk:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll()
});


socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(listTemplate, {
    room,
    users
  });
  document.querySelector('#list').innerHTML = html
});

document.querySelector('#chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit('sendMessage', messageInput.value);
  messageInput.value = '';
});

document.querySelector('#send-location').addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  });
});

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
});
