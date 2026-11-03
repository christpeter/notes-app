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
  app.innerHTML = `
    <main class="page">
      <h1>Catatan</h1>
      <button type="button" id="add" class="primary">Tambah catatan</button>
      <label for="note-search">Cari</label>
      <input id="note-search" type="search" autocomplete="off" />
      <div id="results"></div>
    </main>
  `;

  const searchInput = app.querySelector("#note-search");
  const results = app.querySelector("#results");

  function renderResults(searchText = searchInput.value) {
    const notes = searchText ? store.search(searchText) : store.list();
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

    results.innerHTML = notes.length
      ? `<ul class="notes">${items}</ul>`
      : `<p class="empty">${
          searchText
            ? "Tidak ada catatan yang cocok"
            : "Belum ada catatan. Tekan tombol di atas untuk membuat yang pertama."
        }</p>`;
  }

  renderResults("");
  searchInput.addEventListener("input", () => renderResults());
  app.querySelector("#add").addEventListener("click", () => showEditor());

  results.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.classList.contains("note-open")) {
      const note = store.list().find((item) => item.id === button.dataset.id);
      if (note) showEditor(note);
    } else if (button.classList.contains("note-delete")) {
      store.remove(button.dataset.id);
      renderResults();
    }
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

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
}