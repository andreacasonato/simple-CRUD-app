const updateButton = document.querySelector("#update-button");

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
