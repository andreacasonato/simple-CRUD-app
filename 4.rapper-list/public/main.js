// Find every Like and Delete button on the page
const likeButtons = document.querySelectorAll(".like");
const deleteButtons = document.querySelectorAll(".delete");

// Give each button a click listener
likeButtons.forEach((button) => button.addEventListener("click", addLike));
deleteButtons.forEach((button) =>
  button.addEventListener("click", deleteRapper),
);

// UPDATE: +1 like
async function addLike() {
  // "this" = the button that was clicked; its parent <li> holds the rapper's _id
  const id = this.parentNode.dataset.id;
  try {
    const response = await fetch("/addOneLike", {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    console.log(data);
    location.reload(); // reload -> new GET request -> page shows the new count
  } catch (err) {
    console.log(err);
  }
}

// DELETE: remove this rapper
async function deleteRapper() {
  const id = this.parentNode.dataset.id;
  try {
    const response = await fetch("/deleteRapper", {
      method: "delete",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    console.log(data);
    location.reload();
  } catch (err) {
    console.log(err);
  }
}
