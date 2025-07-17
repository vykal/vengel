import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

// === USER ID ===
const userId = Math.random().toString(36).substring(2);

// === VIDEO ===
const video = document.getElementById("myVideo");
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});

// === PLAYER POSITION ===
let x = Math.random() * 500;
let y = Math.random() * 500;
const speed = 5;

// === SEND POSITION TO FIREBASE ===
function sendPosition() {
  set(ref(db, 'players/' + userId), {
    x, y
  });
}
sendPosition();

// === HANDLE MOVEMENT ===
document.addEventListener("keydown", (e) => {
  if (e.key === "w") y -= speed;
  if (e.key === "s") y += speed;
  if (e.key === "a") x -= speed;
  if (e.key === "d") x += speed;
  sendPosition();
});

// === HIDDEN CANVAS for snapshot ===
const hiddenCanvas = document.createElement("canvas");
const hiddenCtx = hiddenCanvas.getContext("2d");

// === SEND VIDEO FRAME TO FIREBASE ===
function sendVideoFrame() {
  hiddenCanvas.width = 80;
  hiddenCanvas.height = 80;
  hiddenCtx.drawImage(video, 0, 0, 80, 80);
  const dataUrl = hiddenCanvas.toDataURL("image/jpeg", 0.3);
  set(ref(db, 'players/' + userId), {
    x, y,
    img: dataUrl
  });
}
setInterval(sendVideoFrame, 1000); // každú sekundu

// === READ OTHER PLAYERS ===
let players = {};
onValue(ref(db, 'players'), (snapshot) => {
  players = snapshot.val() || {};
});

// === CANVAS ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// === DRAW LOOP ===
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    const p = players[id];
    if (!p) continue;

    if (id === userId) {
      ctx.drawImage(video, p.x, p.y, 80, 80);
    } else {
      if (p.img) {
        const img = new Image();
        img.src = p.img;
        ctx.drawImage(img, p.x, p.y, 80, 80);
      } else {
        ctx.fillStyle = "gray";
        ctx.fillRect(p.x, p.y, 80, 80);
      }
    }
  }
  requestAnimationFrame(draw);
}
draw();
