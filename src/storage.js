const STORAGE_KEY = "notes";

function addBodyAlias(note) {
  const result = {
    ...note,
    content: note.content ?? note.body ?? "",
  };

  delete result.body;
  Object.defineProperty(result, "body", {
    get() {
      return result.content;
    },
  });

  return result;
}

function getContent(note) {
  if (Object.hasOwn(note, "body")) {
    return note.body ?? "";
  }

  return note.content ?? "";
}

export function createStore(storage = window.localStorage) {
  function list() {
    const storedNotes = storage.getItem(STORAGE_KEY);

    if (storedNotes === null) {
      return [];
    }

    try {
      const notes = JSON.parse(storedNotes);
      return Array.isArray(notes) ? notes.map(addBodyAlias) : [];
    } catch {
      return [];
    }
  }

  function save(note) {
    const notes = list();
    const hasId = note.id !== undefined && note.id !== null;
    const noteId = hasId ? note.id : crypto.randomUUID();
    const savedNote = {
      id: noteId,
      title: note.title,
      content: getContent(note),
      updatedAt: Date.now(),
    };
    const existingIndex = notes.findIndex((item) => item.id === noteId);

    if (existingIndex !== -1) {
      notes.splice(existingIndex, 1);
    }

    notes.unshift(savedNote);
    storage.setItem(STORAGE_KEY, JSON.stringify(notes));

    return addBodyAlias(savedNote);
  }

  function remove(id) {
    const notes = list();
    const remainingNotes = notes.filter((note) => note.id !== id);

    if (remainingNotes.length !== notes.length) {
      storage.setItem(STORAGE_KEY, JSON.stringify(remainingNotes));
    }
  }

  function search(text) {
    const query = String(text ?? "").toLowerCase();

    return list().filter((note) => {
      const title = String(note.title ?? "").toLowerCase();
      const content = String(note.content ?? note.body ?? "").toLowerCase();

      return title.includes(query) || content.includes(query);
    });
  }

  return { list, save, remove, search };
}
