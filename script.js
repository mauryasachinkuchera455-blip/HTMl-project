const STORAGE_KEY = "campuscare_id_requests";
const readRequests = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
const saveRequests = items => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
const makeId = () => "IDR-" + Math.floor(100000 + Math.random() * 900000);
const form = document.getElementById("applicationForm");
const message = document.getElementById("formMessage");

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const request = {
    id: makeId(), name: data.get("name").trim(), reg: data.get("reg").trim(),
    course: data.get("course").trim(), year: data.get("year"), email: data.get("email").trim(),
    phone: data.get("phone").trim(), reason: data.get("reason"), contact: data.get("contact"),
    details: data.get("details").trim(), docs: data.getAll("docs"),
    date: new Date().toLocaleDateString("en-IN"), status: "Pending"
  };
  const items = readRequests();
  items.unshift(request);
  saveRequests(items);
  message.textContent = `Application submitted successfully. Your Application ID is ${request.id}. Save this ID to track your request.`;
  form.reset();
  renderAdmin();
  document.getElementById("trackId").value = request.id;
  renderTrack(request.id);
});

function renderTrack(id) {
  const target = document.getElementById("trackResult");
  const item = readRequests().find(x => x.id.toLowerCase() === id.trim().toLowerCase());
  if (!item) {
    target.innerHTML = '<div class="result-card">No application found. Check the ID and try again.</div>';
    return;
  }
  target.innerHTML = `<div class="result-card"><strong>${escapeHtml(item.name)}</strong> · ${escapeHtml(item.reg)}<br>Application: <strong>${item.id}</strong><br>Reason: ${escapeHtml(item.reason)}<br>Submitted: ${item.date}<br>Status: <span class="status ${item.status}">${item.status}</span><br><small>Course: ${escapeHtml(item.course)} · ${item.docs.length} checklist item(s) selected</small></div>`;
}
document.getElementById("trackForm").addEventListener("submit", e => {
  e.preventDefault(); renderTrack(document.getElementById("trackId").value);
});

function renderAdmin() {
  const body = document.getElementById("adminRows");
  const items = readRequests();
  if (!items.length) {
    body.innerHTML = '<tr><td colspan="6" class="empty">No applications submitted yet.</td></tr>';
    return;
  }
  body.innerHTML = items.map(item => `<tr><td><b>${item.id}</b></td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.reason)}</td><td>${item.date}</td><td><span class="status ${item.status}">${item.status}</span></td><td><select data-id="${item.id}" aria-label="Update status for ${item.id}"><option ${item.status==="Pending"?"selected":""}>Pending</option><option ${item.status==="Approved"?"selected":""}>Approved</option><option ${item.status==="Rejected"?"selected":""}>Rejected</option></select></td></tr>`).join("");
  body.querySelectorAll("select").forEach(select => select.addEventListener("change", () => {
    const updated = readRequests().map(x => x.id === select.dataset.id ? {...x, status: select.value} : x);
    saveRequests(updated); renderAdmin();
  }));
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
document.getElementById("refreshAdmin").addEventListener("click", renderAdmin);
document.getElementById("menuBtn").addEventListener("click", () => document.querySelector(".topbar nav").classList.toggle("open"));
document.querySelectorAll(".topbar nav a").forEach(a => a.addEventListener("click", () => document.querySelector(".topbar nav").classList.remove("open")));
renderAdmin();