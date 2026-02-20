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
  const leaves = JSON.parse(localStorage.getItem("leavesData")) || [];

console.log("Dashboard leaves:", leaves);

const onLeave = leaves.filter(l => l.status === "Approved");

const table = document.querySelector(".leave-table tbody");

if (!table) {
    console.error("Table not found!");
} else {
    table.innerHTML = onLeave.length
        ? onLeave.map(e => `
            <tr>
                <td>${e.employeeName}</td>
                <td>${e.date}</td>
            </tr>
        `).join("")
        : `<tr>
            <td colspan="2">No employees on leave</td>
        </tr>`;

}

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