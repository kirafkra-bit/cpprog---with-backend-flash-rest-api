fetch("/pages/sidebar.html")
  .then(response => response.text())
  .then(data => {
      const sidebar = document.getElementById("sidebar");
      sidebar.innerHTML = data;

      highlightActiveLink();

      const logoutBtn = document.getElementById("logoutbutton");
      if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
              sessionStorage.removeItem("currentUser");
              window.location.href = "/pages/index.html";
          });
      }
  })
  .catch(err => console.error("Sidebar failed to load:", err));


function highlightActiveLink() {
    const links = document.querySelectorAll(".menu a");
    const currentPage = window.location.pathname.split("/").pop();

    links.forEach(link => {
        if (link.getAttribute("href").split("/").pop() === currentPage) {
            link.classList.add("active");
        }
    });
}