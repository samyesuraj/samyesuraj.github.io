// === Smooth Scroll and Back to Top Button ===
document.addEventListener("DOMContentLoaded", () => {
  const exploreBtn = document.getElementById("explore-btn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  const backToTop = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => {
    if (backToTop) {
      backToTop.style.display = window.scrollY > 300 ? "block" : "none";
    }
  });
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // === IntersectionObserver for Reveal Animations ===
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll("section").forEach(section => {
    observer.observe(section);
  });

  // === Contact Form Validation ===
  const contactForm = document.getElementById("contact-form");
  const formMessage = document.getElementById("form-message");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !message) {
        formMessage.textContent = "Please fill out all fields.";
        formMessage.style.color = "#ff5555";
        return;
      }

      // Basic email pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        formMessage.textContent = "Please enter a valid email.";
        formMessage.style.color = "#ff5555";
        return;
      }

      formMessage.textContent = "Message sent successfully!";
      formMessage.style.color = "#66fcf1";
      contactForm.reset();
    });
  }

  // === Theme Toggle (Day/Night Mode) ===
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const body = document.body;

  // Helper to set theme
  function setTheme(night) {
    if (night) {
      body.classList.add("night-mode");
      if (themeIcon) themeIcon.textContent = "☀️";
      localStorage.setItem("theme", "night");
    } else {
      body.classList.remove("night-mode");
      if (themeIcon) themeIcon.textContent = "🌙";
      localStorage.setItem("theme", "day");
    }
  }

  // Load theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "night") {
    setTheme(true);
  } else {
    setTheme(false);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isNight = !body.classList.contains("night-mode");
      setTheme(isNight);
    });
  }
});
