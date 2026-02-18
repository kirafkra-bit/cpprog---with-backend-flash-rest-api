fetch("/pages/sidebar.html")
    .then(r => r.text())
    .then(data => {
        document.getElementById("sidebar").innerHTML = data;

        // highlight ung link
        const current = window.location.pathname.split("/").pop();
        document.querySelectorAll(".menu a").forEach(a => {
            if (a.getAttribute("href").split("/").pop() === current)
                a.classList.add("active");
        });

        // Logout
        document.getElementById("logoutbutton")?.addEventListener("click", () => {
            sessionStorage.removeItem("currentUser");
            window.location.href = "/pages/index.html";
        });
    })
    .catch(err => console.error("Sidebar failed to load:", err));