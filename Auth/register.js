const reg = document.getElementById("registerForm");

reg.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username    = document.getElementById("user").value.trim();
    const email       = document.getElementById("email").value.trim();
    const password    = document.getElementById("pass").value;
    const confirmPass = document.getElementById("confirmPass").value;

    // Client-side validation
    if (password !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role: "User" })
        });

        const result = await response.json();

        if (result.success) {
            alert("Registration Successful!");
            reg.reset();
           window.location.href = "/pages/index.html";
        } else {
            alert(result.message || "Registration failed.");
        }
    } catch (err) {
        alert("Could not connect to server. Is Flask running?");
        console.error(err);
    }
});