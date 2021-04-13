import './styles/main.css';
import soundClick from './assets/schelchok.mp3';

import img1 from './assets/images/1.jpg';
import img2 from './assets/images/2.jpg';
import img3 from './assets/images/3.jpg';
import img4 from './assets/images/4.jpg';
import img5 from './assets/images/5.jpg';
import img6 from './assets/images/6.jpg';
import img7 from './assets/images/7.jpg';
import img8 from './assets/images/8.jpg';
import img9 from './assets/images/9.jpg';
import img10 from './assets/images/10.jpg';

const img = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

let steps = 0;
let time = 0;
let sound = true;
const minFieldSize = 3;
const maxFieldSize = 8;
const defFieldSize = 4;

const createElementFunction = (type, attributes, parentElement = document.body) => {
  const elementHTML = document.createElement(type);
  for (let i = 0; i < attributes.length; i++) {
    elementHTML.setAttribute(attributes[i].name, attributes[i].value);
  }
  parentElement.append(elementHTML);
  return elementHTML;
}

const audio = createElementFunction('audio', [{name: 'src', value: soundClick}]);
const puzzle = createElementFunction('div', [{name: 'id', value: 'puzzle'}]);
const inputSize = createElementFunction('input', [{name: 'type', value: 'number'}, {name: 'min', value: minFieldSize}, {name: 'max', value: maxFieldSize}], puzzle);

if (localStorage.getItem('fieldSize') === null) {
  inputSize.setAttribute('value', defFieldSize);
} else {
  inputSize.setAttribute('value', localStorage.getItem('fieldSize'));
  time = localStorage.getItem('time');
  steps = localStorage.getItem('steps');
}

let fieldSize = parseInt(inputSize.value);
const btnReset = createElementFunction('button', [], puzzle);
btnReset.innerText = 'Reset';

btnReset.addEventListener('click', () => {
  localStorage.removeItem('fragments');
  localStorage.removeItem('time');
  localStorage.removeItem('steps');
  message.textContent = '';
  steps = 0;
  clearInterval(timerId);
  time = 0;
  divContainer.innerHTML = '';
  divContainer.style.opacity = 1;
  arrayTarget = [];
  arrayFragments = [];
  if (!inputSize.value) inputSize.value = defFieldSize;
  if (parseInt(inputSize.value) < minFieldSize) inputSize.value = minFieldSize;
  if (parseInt(inputSize.value) > maxFieldSize) inputSize.value = maxFieldSize;
  localStorage.setItem('fieldSize', inputSize.value);
  fillContainer(parseInt(inputSize.value));
  startTimer();
});

const lblSound =  createElementFunction('label', [], puzzle);
lblSound.textContent = 'Звук';
const chkSound = createElementFunction('input', [{name: 'type', value: 'checkbox'}, {name: 'checked', value: 'checked'}], lblSound);
chkSound.addEventListener('click', () => sound = !sound);
const message = createElementFunction('p', []);
message.textContent = '';

let timerId;
const startTimer = () => {
    timerId = setInterval(() => {
    time++;
    message.textContent = `Время - ${Math.floor(time / 60)}:${time % 60}, ходы - ${steps}`;
  }, 1000);
}
startTimer();

let arrayTarget = [];
let arrayFragments = [];

const turnFragment = (prop, direction) => Math.round((parseFloat(prop) + 100 * direction / fieldSize) * 10000) / 10000 + '%';

const moveFragment = (id, fieldSize) => {
  const fragment = document.getElementById(id);
  const position = arrayFragments.indexOf(parseInt(id));
  if (arrayFragments[position + 1] === null && parseFloat(fragment.style.left) / (fieldSize - 1) < (100 / fieldSize - 1)) {
    fragment.style.left = turnFragment(fragment.style.left, 1);
    if (sound) {
      audio.currentTime = 0;
      audio.play();
    }
    arrayFragments[position + 1] = arrayFragments[position];
    arrayFragments[position] = null;
    steps++;
  } else if (arrayFragments[position - 1] === null && parseInt(fragment.style.left) != 0) {
    fragment.style.left = turnFragment(fragment.style.left, -1);
    if (sound) {
      audio.currentTime = 0;
      audio.play();
    }
    arrayFragments[position - 1] = arrayFragments[position];
    arrayFragments[position] = null;
    steps++;
  } else if (arrayFragments[position + fieldSize] === null) {
    fragment.style.top = turnFragment(fragment.style.top, 1);
    if (sound) {
      audio.currentTime = 0;
      audio.play();
    }
    arrayFragments[position + fieldSize] = arrayFragments[position];
    arrayFragments[position] = null;
    steps++;
  } else if (arrayFragments[position - fieldSize] === null) {
    fragment.style.top = turnFragment(fragment.style.top, -1);
    if (sound) {
      audio.currentTime = 0;
      audio.play();
    }
    arrayFragments[position - fieldSize] = arrayFragments[position];
    arrayFragments[position] = null;
    steps++;
  }
  message.textContent = `Время - ${Math.floor(time / 60)}:${time % 60}, ходы - ${steps}`;
  localStorage.setItem('fragments', JSON.stringify(arrayFragments));
  localStorage.setItem('time', time);
  localStorage.setItem('steps', steps);
  if (JSON.stringify(arrayFragments) === JSON.stringify(arrayTarget)) {
    clearInterval(timerId);
    message.textContent = `Ура! Вы решили головоломку за ${Math.floor(time / 60)}:${time % 60} и ${steps} ходов`;
    localStorage.removeItem('fragments');
  };
}

const dragStart = function (e) {
  e.dataTransfer.setData('id', e.target.id);
  setTimeout(() => {
      this.classList.add('hide');
  }, 0);
};

const dragEnd = function () {
  this.classList.remove('hide');
};

const dragOver = function (evt) {
  evt.preventDefault();
};

const dragDrop = function (e) {
  const itemId = e.dataTransfer.getData('id');
  moveFragment(itemId, parseInt(inputSize.value));
};

let divContainer = document.createElement('div');
divContainer.id = 'container';
divContainer.ondrop = dragDrop;
divContainer.ondragover = dragOver;
document.body.append(divContainer);

function fillContainer(fieldSize) {

  if (localStorage.getItem('fragments') === null) {
    for (let i = 0; i < fieldSize * fieldSize; i++) {
      let random;
      do {
        random = Math.round(Math.random() * (fieldSize * fieldSize - 1) + 1);
      } while (arrayFragments.indexOf(random) != -1);
      arrayFragments.push(random);
    }
    arrayFragments[arrayFragments.indexOf(fieldSize * fieldSize)] = null;
    steps = 0;
  } else {
    arrayFragments = JSON.parse(localStorage.getItem('fragments'));
  }

  for (let i = 1; i < fieldSize * fieldSize; i++) {
    arrayTarget.push(i);
  }
  arrayTarget.push(null);

  const backgroundImage = `url(${img[Math.floor(Math.random() * 10)]})`;

  arrayFragments.forEach((item, index) => {
    if (item !== null) {
      const divFragment = document.createElement('div');
      divFragment.textContent = item;
      divFragment.classList.add('fragment');
      divFragment.id = item;
      divFragment.setAttribute('draggable', 'true');
      divFragment.style.width = 'calc(100%/' + fieldSize + ')';
      divFragment.style.height = 'calc(100%/' + fieldSize + ')';
      divFragment.style.backgroundImage = backgroundImage;
      divFragment.style.backgroundSize = 'calc(100%*' + fieldSize + ')';
      divFragment.style.backgroundPositionX = (item - 1) / (fieldSize - 1) * 100 + '%';

      let row = 0;
      if (index > fieldSize - 1 && index < fieldSize * 2)
        row = 1;
      if (index > fieldSize * 2 - 1 && index < fieldSize * 3)
        row = 2;
      if (index > fieldSize * 3 - 1 && index < fieldSize * 4)
        row = 3;
      if (index > fieldSize * 4 - 1 && index < fieldSize * 5)
        row = 4;
      if (index > fieldSize * 5 - 1 && index < fieldSize * 6)
        row = 5;
      if (index > fieldSize * 6 - 1 && index < fieldSize * 7)
        row = 6;
      if (index > fieldSize * 7 - 1 && index < fieldSize * 8)
        row = 7;
      divFragment.style.backgroundPositionY = Math.floor((item - 1) / fieldSize) / (fieldSize - 1) * 100 + '%';
      divFragment.style.top = row * 100 / fieldSize + '%';
      divFragment.style.left = (index - row * fieldSize) * 100 / fieldSize + '%';
      divContainer.append(divFragment);

      divFragment.ondragstart = dragStart;
      divFragment.ondragend = dragEnd;

      divFragment.addEventListener('click', () => {
        moveFragment(item, fieldSize);
      });
    }

  });
}

fillContainer(parseInt(inputSize.value));






