const updateButton = document.querySelector("#update-button");
const deleteButton = document.querySelector("#delete-button");
const messageDiv = document.querySelector("#message");

deleteButton.addEventListener("click", async () => {
  const res = await fetch("/quotes", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Darth Vader" }),
  });

  if (res.ok) {
    const data = await res.json();
    if (data === "No quote to delete") {
      messageDiv.textContent = "No Darth Vader quote to delete";
    } else {
      window.location.reload();
    }
  }
});

updateButton.addEventListener("click", async () => {
  const res = await fetch("/quotes", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Darth Vader",
      quote: "I find your lack of faith disturbing.",
    }),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(data);
    window.location.reload();
  }
});
