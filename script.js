// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Netlify form success UX (works on static hosts too)
if (window.location.hash === "#thanks") {
  alert("Thanks! We'll confirm via Instagram DM.");
}
