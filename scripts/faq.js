document.addEventListener("DOMContentLoaded", function () {
    const homepageButton = document.getElementById("homepage");
    if (homepageButton) {
      homepageButton.addEventListener("click", function () {
        window.location.href = "dashboard.html"; // Redirects to Dashboard.html
      });
    } else {
      console.error("Homepage button not found.");
    }
  });
  