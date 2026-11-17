(function () {
  "use strict";
  var dialog = document.getElementById("site-search");
  if (!dialog) return;
  var toggle = document.querySelector(".site-search-toggle");
  var input = document.getElementById("site-search-input");
  var status = document.getElementById("site-search-status");
  var results = document.getElementById("site-search-results");
  var entries = null;
  var loading = null;
  function render() {
    results.replaceChildren();
    var query = input.value.trim().toLowerCase();
    if (!query) { status.textContent = "Enter a word or phrase to search."; return; }
    if (!entries) { status.textContent = "Loading search…"; return; }
    var terms = query.split(/\s+/);
    var matches = entries.filter(function (entry) {
      var text = (entry.title + " " + entry.text).toLowerCase();
      return terms.every(function (term) { return text.indexOf(term) !== -1; });
    });
    status.textContent = matches.length ? matches.length + (matches.length === 1 ? " result" : " results") : "No results. Try another word or phrase.";
    matches.forEach(function (entry) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = entry.url;
      link.textContent = entry.title;
      item.appendChild(link);
      var text = entry.text.replace(/\s+/g, " ").trim();
      var position = text.toLowerCase().indexOf(terms[0]);
      var start = Math.max(0, position - 55);
      var excerpt = document.createElement("p");
      excerpt.textContent = (start ? "…" : "") + text.slice(start, start + 180) + (text.length > start + 180 ? "…" : "");
      item.appendChild(excerpt);
      results.appendChild(item);
    });
  }
  toggle.addEventListener("click", function () {
    dialog.showModal();
    input.focus();
    if (!loading) {
      var script = document.querySelector('script[src$="/assets/js/site-search.js"]');
      var url = new URL("../../search.json", script.src);
      loading = fetch(url).then(function (response) {
        if (!response.ok) throw new Error("Search index unavailable");
        return response.json();
      }).then(function (data) { entries = data; render(); }).catch(function () {
        loading = null;
        status.textContent = "Search could not load. Close and reopen search to try again.";
      });
    }
    render();
  });
  dialog.querySelector(".site-search-close").addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("close", function () { toggle.focus(); });
  input.addEventListener("input", render);
  dialog.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
    var first = results.querySelector("a");
    if (first) first.click();
  });
})();
