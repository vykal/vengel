import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyA-RcrnS3WDvHCMbsgVBI4baIoCE47PLkw",
  authDomain: "camera-move-chat.firebaseapp.com",
  databaseURL: "https://camera-move-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "camera-move-chat",
  storageBucket: "camera-move-chat.firebasestorage.app",
  messagingSenderId: "378756393393",
  appId: "1:378756393393:web:1e03dabe76ecb9e07b7590",
  measurementId: "G-KKHHWY78EY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// === Identifikácia používateľa ===
const userId = Math.random().toString(36).substring(2);

// === Kamera ===
const video = document.getElementById("myVideo");
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

// === Pozícia hráča ===
let x = Math.random() * 500;
let y = Math.random() * 500;
const speed = 5;

const userRef = ref(db, 'players/' + userId);
onDisconnect(userRef).remove(); // automatické odstránenie

function sendPosition() {
  set(userRef, {
    x,
    y
  });
}
sendPosition();

document.addEventListener("keydown", (e) => {
  if (e.key === "w") y -= speed;
  if (e.key === "s") y += speed;
  if (e.key === "a") x -= speed;
  if (e.key === "d") x += speed;
  sendPosition();
});

// === Odosielanie snímok videa ===
function getVideoFrame() {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 80;
  tempCanvas.height = 80;
  const ctx = tempCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, 80, 80);
  return tempCanvas.toDataURL('image/webp');
}

function sendFrame() {
  const img = getVideoFrame();
  set(ref(db, 'players/' + userId + '/frame'), img);
}

setInterval(sendFrame, 200); // každých 200 ms

// === Sledovanie ostatných hráčov ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let players = {};

onValue(ref(db, 'players'), (snapshot) => {
  players = snapshot.val() || {};
});

// === Kreslenie ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let id in players) {
    const p = players[id];
    if (id === userId) {
      ctx.drawImage(video, p.x, p.y, 80, 80);
    } else {
      if (p.frame) {
        const img = new Image();
        img.src = p.frame;
