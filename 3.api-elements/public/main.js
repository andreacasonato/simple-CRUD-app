const form = document.querySelector("#search-form");
const input = document.querySelector("#name-input");
const result = document.querySelector("#result");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop the page from reloading

  const name = input.value.trim();
  if (name === "") return; // nothing typed: do nothing

  // Ask our API. encodeURIComponent makes the text safe to put in a URL.
  const res = await fetch(`/api/elements/${encodeURIComponent(name)}`);
  const data = await res.json();

  if (res.ok) {
    // Found (status 200): show the details as plain text
    result.className = "";
    result.innerText =
      `${data.name} (${data.symbol})\n` +
      `Atomic number: ${data.atomicNumber}\n` +
      `Category: ${data.category}`;
  } else {
    // Not found (status 404): show the API's error message
    result.className = "error";
    result.innerText = data.error;
  }
});
