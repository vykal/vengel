// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 👉 Tvoja konfigurácia Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBm0hGeh0qLP5CDDozyzdX9KqqHqjI08D0",
  authDomain: "kamerachat-dd4ac.firebaseapp.com",
  databaseURL: "https://kamerachat-dd4ac-default-rtdb.firebaseio.com",
  projectId: "kamerachat-dd4ac",
  storageBucket: "kamerachat-dd4ac.appspot.com",
  messagingSenderId: "433568916887",
  appId: "1:433568916887:web:7e32c3023555805ae650d2",
  measurementId: "G-BFLZ8PYJZ3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// 🎥 Spustenie kamery
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 🧑 Generuj ID pre používateľa
const userId = Math.random().toString(36).substring(2, 9);
let x = Math.random() * canvas.width;
let y = Math.random() * canvas.height;
let users = {};

function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in users) {
    const user = users[id];
    if (user.image) {
      const img = new Image();
      img.src = user.image;
      ctx.drawImage(img, user.x, user.y, 80, 80);
    } else {
      ctx.fillStyle = id === userId ? "blue" : "gray";
      ctx.fillRect(user.x, user.y, 80, 80);
    }
  }
}

function updatePosition() {
  const imageData = captureImage();
  set(ref(db, 'users/' + userId), { x, y, image: imageData });
}

function captureImage() {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 80;
  tempCanvas.height = 80;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(video, 0, 0, 80, 80);
  return tempCanvas.toDataURL('image/jpeg');
}

document.addEventListener('keydown', e => {
  const speed = 5;
  if (e.key === 'w') y -= speed;
  if (e.key === 's') y += speed;
  if (e.key === 'a') x -= speed;
  if (e.key === 'd') x += speed;
  updatePosition();
});

onValue(ref(db, 'users'), snapshot => {
  users = snapshot.val() || {};
  drawAll();
});

setInterval(updatePosition, 1000);
