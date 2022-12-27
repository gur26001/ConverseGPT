import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
	element.textContent = '';
	loadInterval = setInterval(() => {
		element.textContent += '.';
		if (element.textContent === '....') {
			element.textContent = '';
		}
	}, 300);
}

function typeText(element, text) {
	let index = 0;

	let interval = setInterval(() => {
		if (index < text.length) {
			element.innerHTML += text.charAt(index);
			index++;
		} else {
			clearInterval(interval);
		}
	}, 20); //type character by character
}

function generateUniqueID() {
	const timestamp = Date.now();
	const randomNumber = Math.random();
	const hexadecimalString = randomNumber.toString(16);
	return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, msg, uid) {
	return `
    <div class="wrapper ${isAi && 'ai'}" >

      <div class="chat" >
      <div class="profile">
          <img 
            src=${isAi ? bot : user}
            alt= "${isAi ? 'Bot' : 'Me'}"
          />
      </div>
      <div  class="message" id= ${uid} >
        ${msg}
      </div>

      </div>
    </div
  `;
}

const handleSubmit = async (e) => {
	e.preventDefault();
	// get data and load it
	const data = new FormData(form);

	// showing it on the user screen
	chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

	// clear all the text from user side , so that he she can retype
	form.reset();

	const uniqueId = generateUniqueID();
	chatContainer.innerHTML += chatStripe(true, data.get('prompt'), uniqueId);

	// scrolling down as screen goes down

	chatContainer.scrollTop = chatContainer.scrollHeight;

	const messageDiv = document.getElementById(uniqueId);
	// wait until you got response
	loader(messageDiv);

	// bot response

	const response = await fetch('http://localhost:5000/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			prompt: data.get('prompt'),
		}),
	});

	// stop loader once response got
	clearInterval(loadInterval);
	messageDiv.innerHTML = '';
	// response
	if (response.ok) {
		const data = await response.json();
		const parsedData = data.bot.trim();
		typeText(messageDiv, parsedData);
	} else {
		const err = await response.text();
		typeText(messageDiv, 'Something went wrong, type again please');
		console.log(err);
	}
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
	if (e.keyCode === 13) {
		handleSubmit(e);
	}
});
