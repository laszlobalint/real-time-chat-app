const socket = io();

const $form = document.querySelector('#message-form');
const $input = $form.querySelector('input');
const $button = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;

const { name, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, { message: message.text, createdAt: moment(message.createdAt).format('kk:mm.ss') });
  $messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(urlTemplate, { url: message.url, createdAt: moment(message.createdAt).format('kk:mm.ss') });
  $messages.insertAdjacentHTML('beforeend', html);
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

socket.emit('join', { name, room });
