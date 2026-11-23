const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#todo-list");
const message = document.querySelector("#message");

// READ: ask the API for all to-dos, then draw them
async function loadTodos() {
  const res = await fetch("/api/todos");
  const todos = await res.json();
  list.innerHTML = ""; // clear the old list
  for (const todo of todos) {
    list.appendChild(renderTodo(todo));
  }
}

// Builds one <li>: checkbox + text + Delete button
function renderTodo(todo) {
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.done;
  checkbox.addEventListener("change", () =>
    toggleTodo(todo._id, checkbox.checked),
  );

  const text = document.createElement("span");
  text.textContent = todo.task; // textContent = shown as plain text, never as HTML
  if (todo.done) text.classList.add("done");

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteTodo(todo._id));

  li.append(checkbox, text, deleteButton);
  return li;
}

// Shows the API's error message, if the request failed
async function showErrorIfAny(res) {
  if (res.ok) {
    message.textContent = "";
    return false;
  }
  const data = await res.json();
  message.textContent = data.error;
  return true;
}

// CREATE: send the typed task to the API
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop the browser from reloading the page
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: input.value }),
  });
  if (await showErrorIfAny(res)) return;
  input.value = "";
  loadTodos();
});

// UPDATE: tick / untick
async function toggleTodo(id, done) {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  });
  await showErrorIfAny(res);
  loadTodos();
}

// DELETE
async function deleteTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  await showErrorIfAny(res);
  loadTodos();
}

loadTodos(); // draw the list when the page opens
