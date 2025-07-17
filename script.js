const db = firebase.database();
const map = document.getElementById("map");

// Generate random ID and initial position
const userId = "user_" + Math.random().toString(36).substr(2, 9);
let pos = { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight };

// Create local video element
const box = document.createElement("div");
box.className = "video-box";
box.style.left = pos.x + "px";
box.style.top = pos.y + "px";
const video = document.createElement("video");
video.autoplay = true;
video.muted = true;
box.appendChild(video);
map.appendChild(box);

// Get camera stream
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// Handle WSAD movement
document.addEventListener("keydown", e => {
  const speed = 5;
  if (e.key === "w") pos.y -= speed;
  if (e.key === "s") pos.y += speed;
  if (e.key === "a") pos.x -= speed;
  if (e.key === "d") pos.x += speed;
  updatePosition();
});

function updatePosition() {
  box.style.left = pos.x + "px";
  box.style.top = pos.y + "px";
  db.ref("users/" + userId).set(pos);
}

// Update our position regularly
setInterval(updatePosition, 1000);

// Listen for other users
db.ref("users").on("value", snapshot => {
  const data = snapshot.val() || {};
  for (let id in data) {
    if (id === userId) continue;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.className = "video-box";
      el.id = id;
      el.innerHTML = `<div style=\"width:100%;height:100%;background:#555;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;\">${id}</div>`;
      map.appendChild(el);
    }
    el.style.left = data[id].x + "px";
    el.style.top = data[id].y + "px";
  }
});
