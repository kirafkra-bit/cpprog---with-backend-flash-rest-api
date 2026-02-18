const login = document.getElementById("login");

login.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("user").value;
    const password = document.getElementById("pass").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            alert("Login Successful");

            // Save user data pag in session
            sessionStorage.setItem("currentUser", JSON.stringify(result.data));

            // Redirect to dashboard
            window.location.href = "/pages/dashboard1.html";
        } else {
            alert(result.message || "Login failed");
        }
    } catch (err) {
        alert("Could not connect to server. Is Flask running?");
        console.error(err);
    }
});