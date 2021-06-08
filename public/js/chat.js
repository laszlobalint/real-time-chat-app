const socket = io();

const $form = document.querySelector('#message-form');
const $input = $form.querySelector('input');
const $button = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { name, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageHeight = $newMessage.offsetHeight + parseInt(getComputedStyle($newMessage).marginBottom);

  const visibleHeight = $messages.offsetHeight;

  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) $messages.scrollTop = $messages.scrollHeight;
};

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    name: message.name,
    message: message.text,
    createdAt: moment(message.createdAt).format('kk:mm.ss'),
  });
  $messages.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(urlTemplate, {
    name: message.name,
    url: message.url,
    createdAt: moment(message.createdAt).format('kk:mm.ss'),
  });
  $messages.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, { room, users });
  document.querySelector('#sidebar').innerHTML = html;
});

$form.addEventListener('submit', (event) => {
  event.preventDefault();
  $form.setAttribute('disabled', 'disabled');

  socket.emit('sendMessage', event.target.elements.message.value, (error) => {
    $form.removeAttribute('disabled');
    $input.value = '';
    $input.focus();

    if (error) return alert(error);
  });
});

$button.addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation is not supported by your browser.');

  $button.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) =>
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $button.removeAttribute('disabled');
      },
    ),
  );
});

socket.emit('join', { name, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
