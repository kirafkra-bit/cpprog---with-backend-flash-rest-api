document.addEventListener("DOMContentLoaded", async () => {

    // Greeting
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    const hour = new Date().getHours();
    document.querySelector(".greeting").textContent = `Hello, ${user?.username || "User"}!`;
    document.querySelector(".welcome-text h1").textContent =
        hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    // Check-in
    document.querySelector(".btn-check-in").onclick = () => {
        const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        alert(`Checked in at ${now}`);
    };

    // Attendance chart + leave balance
    const attendance = await fetch("/api/attendance").then(r => r.json());
    const latest6    = attendance.slice(0, 6).reverse();

    new Chart(document.getElementById("attendanceChart"), {
        type: "bar",
        data: {
            labels: latest6.map(r => r.month.slice(0, 3)),
            datasets: [
                { label: "Present", data: latest6.map(r => r.present), backgroundColor: "#4299e1", borderRadius: 6, barThickness: 30 },
                { label: "Absent",  data: latest6.map(r => r.absent),  backgroundColor: "#fc8181", borderRadius: 6, barThickness: 30 },
                { label: "Late",    data: latest6.map(r => r.late),    backgroundColor: "#f6ad55", borderRadius: 6, barThickness: 30 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true } }
        }
    });

    if (attendance.length) {
        const m    = attendance[0];
        const stats = document.querySelectorAll(".stat-value");
        const leaveAllowance = 15;
        stats[0].textContent = m.absent;
        stats[1].textContent = Math.max(leaveAllowance - m.absent, 0);
    }

    // Employees on leave
    const employees = await fetch("/api/hr").then(r => r.json());
    const onLeave   = employees.filter(e => e.status === "On Leave");
    document.querySelector(".leave-table tbody").innerHTML = onLeave.length
        ? onLeave.map(e => `<tr><td>${e.name}</td><td>${e.date_hired || "—"}</td></tr>`).join("")
        : `<tr><td colspan="2" style="text-align:center;color:#888;padding:1rem;">No employees on leave.</td></tr>`;

    // Announcements
    const perf = await fetch("/api/performance").then(r => r.json());
    const top  = perf.filter(r => r.score >= 4.5).sort((a, b) => b.score - a.score).slice(0, 3);
    const box  = document.querySelector(".announcements-widget");
    box.querySelector(".announcement-item")?.remove();
    box.insertAdjacentHTML("beforeend", top.length
        ? top.map(r => `
            <div class="announcement-item">
                <p class="announcement-title">⭐ Top Performer: ${r.name}</p>
                <p class="announcement-time">Score: ${r.score.toFixed(1)} — ${r.department}</p>
            </div>`).join("")
        : `<p style="color:#888;font-size:0.85rem;">No announcements.</p>`
    );

});