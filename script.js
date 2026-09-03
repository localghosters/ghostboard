const note = document.querySelector("#note");
const notes = document.querySelector("#notes");
const status = document.querySelector("#status");

const ghosts = ["Casper", "Byte", "Specter", "Null", "Phantom", "Wisp", "404"];

function load() {
  const saved = JSON.parse(localStorage.getItem("ghostboard-notes") || "[]");
  notes.innerHTML = saved.length
    ? saved.map(n => `<li>${escapeHtml(n)}</li>`).join("")
    : "<li>No notes yet.</li>";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

document.querySelector("#save").onclick = () => {
  const value = note.value.trim();
  if (!value) {
    status.textContent = "Write a note first.";
    return;
  }
  const saved = JSON.parse(localStorage.getItem("ghostboard-notes") || "[]");
  saved.unshift(value);
  localStorage.setItem("ghostboard-notes", JSON.stringify(saved.slice(0, 20)));
  note.value = "";
  status.textContent = "Saved locally.";
  load();
};

document.querySelector("#ghost").onclick = () => {
  const ghost = ghosts[Math.floor(Math.random() * ghosts.length)];
  status.textContent = `Your random ghost is ${ghost}.`;
};

load();
