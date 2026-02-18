let records = [];

//initialization ng attendance

async function load() {
    records = await fetch("/api/attendance").then(r => r.json());
    filterByYear();
}

//filter

function filterByYear() {
    const year = parseInt(document.querySelector(".year-select").value);
    const list = records.filter(r => r.year === year);
    updateCards(list);
    render(list);
}

function updateCards(list) {
    const vals = document.querySelectorAll(".card-value");
    const days    = list.reduce((s, r) => s + r.total_days, 0);
    const present = list.reduce((s, r) => s + r.present, 0);
    vals[0].textContent = days;
    vals[1].textContent = present;
    vals[2].textContent = list.reduce((s, r) => s + r.absent, 0);
    vals[3].textContent = list.reduce((s, r) => s + r.late, 0);
    vals[4].textContent = days ? Math.round((present / days) * 100) + "%" : "0%";
}

function render(list) {
    document.querySelector(".attendance-table tbody").innerHTML = list.length
        ? list.map(r => {
            const rate = Math.round((r.present / r.total_days) * 100);
            return `<tr>
                <td>${r.month} ${r.year}</td>
                <td>${r.present}</td><td>${r.absent}</td><td>${r.late}</td><td>${r.total_days}</td>
                <td>${rate}%</td>
                <td><button class="btn-view-details" onclick="viewDetails(${r.id})">View Details</button></td>
            </tr>`;
          }).join("")
        : `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#888">No records found.</td></tr>`;
    document.querySelector(".pagination-info span").textContent = `out of ${list.length}`;
}

function viewDetails(id) {
    const r    = records.find(x => x.id === id);
    const rate = Math.round((r.present / r.total_days) * 100);
    document.body.insertAdjacentHTML("beforeend", `
        <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
            <div class="modal">
                <div class="modal-header">
                    <h2>${r.month} ${r.year}</h2>
                    <button class="modal-close" onclick="document.querySelector('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        <div class="detail-item"><span class="detail-label">Total Days</span><span class="detail-value">${r.total_days}</span></div>
                        <div class="detail-item"><span class="detail-label">Present</span><span class="detail-value success">${r.present}</span></div>
                        <div class="detail-item"><span class="detail-label">Absent</span><span class="detail-value danger">${r.absent}</span></div>
                        <div class="detail-item"><span class="detail-label">Late</span><span class="detail-value warning">${r.late}</span></div>
                        <div class="detail-item"><span class="detail-label">Rate</span><span class="detail-value primary">${rate}%</span></div>
                    </div>
                    <div class="rate-bar-wrap"><div class="rate-bar" style="width:${rate}%"></div></div>
                    <p class="rate-note">${rate>=90?" Excellent!":rate>=75?" Average.":" Poor Attendance."}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="document.querySelector('.modal-overlay').remove()">Close</button>
                </div>
            </div>
        </div>`);
}

document.addEventListener("DOMContentLoaded", () => {
    load();
    document.querySelector(".year-select").onchange = filterByYear;

    document.querySelector(".btn-generate").onclick = () => {
        if (!requireAdmin("generating attendance reports")) return;
        const year = document.querySelector(".year-select").value;
        const list = records.filter(r => r.year === parseInt(year));
        const csv  = "Month,Present,Absent,Late,Total Days,Rate\n" +
            list.map(r => `${r.month} ${r.year},${r.present},${r.absent},${r.late},${r.total_days},${Math.round((r.present/r.total_days)*100)}%`).join("\n");
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv],{type:"text/csv"})), download:`attendance_${year}.csv` });
        a.click();
    };
});