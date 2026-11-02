import "./style.css";
import { createStore } from "./storage.js";

const store = createStore();
const app = document.querySelector("#app");

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Tampilan daftar catatan
function showList() {
  const notes = store.list();

  const items = notes
    .map(
      (note) => `
      <li class="note">
        <button type="button" class="note-open" data-id="${escapeHtml(note.id)}">
          <span class="note-title">${escapeHtml(note.title)}</span>
          <span class="note-preview">${escapeHtml(note.content)}</span>
        </button>
        <button type="button" class="note-delete" data-id="${escapeHtml(note.id)}">Hapus</button>
      </li>`
    )
    .join("");

  app.innerHTML = `
    <main class="page">
      <h1>Catatan</h1>
      <button type="button" id="add" class="primary">Tambah catatan</button>
      ${
        notes.length === 0
          ? '<p class="empty">Belum ada catatan. Tekan tombol di atas untuk membuat yang pertama.</p>'
          : `<ul class="notes">${items}</ul>`
      }
    </main>
  `;

  app.querySelector("#add").addEventListener("click", () => showEditor());

  app.querySelectorAll(".note-open").forEach((button) => {
    button.addEventListener("click", () => {
      const note = store.list().find((item) => item.id === button.dataset.id);
      if (note) showEditor(note);
    });
  });

  app.querySelectorAll(".note-delete").forEach((button) => {
    button.addEventListener("click", () => {
      store.remove(button.dataset.id);
      showList();
    });
  });
}

// Tampilan editor (catatan baru atau edit catatan yang sudah ada)
function showEditor(note) {
  app.innerHTML = `
    <main class="page">
      <h1>Catatan</h1>
      <form id="editor" class="editor">
        <label for="note-title">Judul</label>
        <input id="note-title" type="text" required autocomplete="off" />

        <label for="note-body">Isi</label>
        <textarea id="note-body" rows="6"></textarea>

        <div class="actions">
          <button type="submit" class="primary">Simpan</button>
          <button type="button" id="cancel">Batal</button>
        </div>
      </form>
    </main>
  `;

  const titleInput = app.querySelector("#note-title");
  const bodyInput = app.querySelector("#note-body");

  // Isi lewat properti .value supaya aman dari karakter khusus
  titleInput.value = note?.title ?? "";
  bodyInput.value = note?.content ?? "";
  titleInput.focus();

  app.querySelector("#editor").addEventListener("submit", (event) => {
    event.preventDefault();
    store.save({
      id: note?.id,
      title: titleInput.value.trim(),
      content: bodyInput.value,
    });
    showList();
  });

  app.querySelector("#cancel").addEventListener("click", showList);
}

showList();