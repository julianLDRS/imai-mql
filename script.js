(function () {
  // Questions 2–7 are PLACEHOLDERS — replace with the real copy.
  var QUESTIONS = [
    {
      id: "profile",
      q: "Which best describes you?",
      options: [
        "Agency managing multiple brands or clients",
        "Large brand or company",
        "Growing company / established SMB",
        "Small business / startup",
        "Individual creator / freelancer / student"
      ]
    },
    { id: "q2", q: "Question 2 (placeholder)", options: ["Option A", "Option B", "Option C", "Option D"] },
    { id: "q3", q: "Question 3 (placeholder)", options: ["Option A", "Option B", "Option C", "Option D"] },
    { id: "q4", q: "Question 4 (placeholder)", options: ["Option A", "Option B", "Option C"] },
    { id: "q5", q: "Question 5 (placeholder)", options: ["Option A", "Option B", "Option C", "Option D"] },
    { id: "q6", q: "Question 6 (placeholder)", options: ["Option A", "Option B", "Option C"] },
    { id: "q7", q: "Question 7 (placeholder)", options: ["Option A", "Option B", "Option C", "Option D", "Option E"] }
  ];

  var root = document.getElementById("mql");
  var stage = document.getElementById("mqlStage");
  var elQ = document.getElementById("mqlQuestion");
  var elHint = document.getElementById("mqlHint");
  var elOpts = document.getElementById("mqlOptions");
  var elCount = document.getElementById("mqlCount");
  var elBar = document.getElementById("mqlProgressBar");
  var elProgress = document.getElementById("mqlProgress");
  var elBack = document.getElementById("mqlBack");
  var elDone = document.getElementById("mqlDone");

  var answers = {};
  var index = 0;
  var busy = false;

  var CHECK = '<svg class="mql_option-check" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="currentColor"/><path d="m6 10.2 2.6 2.6L14 7.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function render() {
    var item = QUESTIONS[index];
    elQ.textContent = item.q;
    elHint.textContent = item.hint || "";
    elCount.textContent = "Question " + (index + 1) + " of " + QUESTIONS.length;
    elBar.style.width = ((index + 1) / QUESTIONS.length) * 100 + "%";
    elProgress.setAttribute("aria-valuenow", index + 1);
    elBack.disabled = index === 0;
    root.classList.toggle("is-compact", index > 0);

    elOpts.innerHTML = "";
    item.options.forEach(function (label, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "mql_option";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", answers[item.id] === label ? "true" : "false");
      if (answers[item.id] === label) b.classList.add("is-selected");
      b.style.animationDelay = i * 45 + "ms";
      b.innerHTML =
        '<span class="mql_option-key">' + (i + 1) + "</span>" +
        '<span class="mql_option-label"></span>' + CHECK;
      b.querySelector(".mql_option-label").textContent = label;
      b.addEventListener("click", function () { choose(i); });
      elOpts.appendChild(b);
    });
  }

  function go(next, back) {
    busy = true;
    stage.classList.toggle("is-back", !!back);
    stage.classList.add("is-leaving");
    setTimeout(function () {
      index = next;
      render();
      stage.classList.remove("is-leaving");
      stage.classList.add("is-entering");
      stage.offsetWidth; // reflow
      stage.classList.remove("is-entering");
      busy = false;
    }, 280);
  }

  function choose(i) {
    if (busy) return;
    var item = QUESTIONS[index];
    answers[item.id] = item.options[i];
    Array.prototype.forEach.call(elOpts.children, function (b, n) {
      b.classList.toggle("is-selected", n === i);
      b.setAttribute("aria-checked", n === i ? "true" : "false");
    });
    busy = true;
    setTimeout(function () {
      busy = false;
      if (index < QUESTIONS.length - 1) go(index + 1);
      else finish();
    }, 320);
  }

  function finish() {
    stage.hidden = true;
    elDone.hidden = false;
    root.classList.add("is-done");
    // Hook for Webflow form / CRM submission:
    root.dispatchEvent(new CustomEvent("mql:complete", { detail: answers, bubbles: true }));
  }

  elBack.addEventListener("click", function () {
    if (!busy && index > 0) go(index - 1, true);
  });

  document.addEventListener("keydown", function (e) {
    if (root.classList.contains("is-done") || e.metaKey || e.ctrlKey || e.altKey) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= QUESTIONS[index].options.length) choose(n - 1);
    if (e.key === "Backspace" && index > 0 && !busy) go(index - 1, true);
  });

  render();
})();
