let records = [];

const ratingnila = s => s >= 4.5 ? {label:"Excellent",cls:"excellent"} : s >= 3.5 ? {label:"Good",cls:"good"} : s >= 2.5 ? {label:"Average",cls:"average"} : {label:"Needs Improvement",cls:"poor"};
const fmtDate    = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"2-digit",year:"numeric"}) : "—";

async function load() {
    records = await fetch("/api/performance").then(r => r.json());
    render(records);
    updateCards(records);
}

function updateCards(list) {
    const total = list.length;
    document.querySelectorAll(".summary-card").forEach((card, i) => {
        const fns = [r=>r.score>=4.5, r=>r.score>=3.5&&r.score<4.5, r=>r.score>=2.5&&r.score<3.5, r=>r.score<2.5];
        const n   = list.filter(fns[i]).length;
        card.querySelector(".card-value").textContent      = n;
        card.querySelector(".card-percentage").textContent = total ? Math.round((n/total)*100)+"% of total" : "0%";
    });
}

function render(list) {
    document.querySelector(".performance-table tbody").innerHTML = list.length
        ? list.map(r => {
            const {label, cls} = ratingnila(r.score);
            return `<tr>
                <td>${r.name}</td><td>${r.employee_id}</td><td>${r.department}</td><td>${r.position}</td>
                <td><strong>${r.score.toFixed(1)}</strong></td>
                <td><span class="badge ${cls}">${label}</span></td>
                <td>${fmtDate(r.last_review)}</td>
            </tr>`;
          }).join("")
        : `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#888">No records found.</td></tr>`;
    document.querySelector(".pagination-info span").textContent = `of ${list.length} employees`;
}

function openReviewForm(r = null) {
    if (!requireAdmin("managing performance reviews")) return;
    document.querySelector(".modal-overlay")?.remove();
    const isEdit = r !== null;
    document.body.insertAdjacentHTML("beforeend", `
        <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
            <div class="modal">
                <div class="modal-header">
                    <h2>${isEdit ? "Edit Review" : "New Review"}</h2>
                    <button class="modal-close" onclick="document.querySelector('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group"><label>Name</label><input id="m-name" value="${r?.name||''}"></div>
                    <div class="form-group"><label>Employee ID</label><input id="m-empid" value="${r?.employee_id||''}"></div>
                    <div class="form-group"><label>Department</label>
                        <select id="m-dept">${["IT Department","HR Department","Finance Department","Marketing Department","Sales Department","Operations Department"]
                            .map(d=>`<option ${r?.department===d?"selected":""}>${d}</option>`).join("")}</select>
                    </div>
                   
                    <div class="form-group"><label>Score (0–5)</label><input type="number" id="m-score" min="0" max="5" step="0.1" value="${r?.score||''}"></div>
                    <div class="form-group"><label>Review Date</label><input type="date" id="m-date" value="${r?.last_review||''}"></div>
                    
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
                    <button class="btn-save" onclick="save(${r?.id||'null'})">${isEdit ? "Save" : "Add"}</button>
                </div>
            </div>
        </div>`);
}

async function save(id) {
    const data = {
        name:        document.getElementById("m-name").value.trim(),
        employee_id: document.getElementById("m-empid").value.trim(),
        department:  document.getElementById("m-dept").value,
        position:    document.getElementById("m-position").value.trim(),
        score:       parseFloat(document.getElementById("m-score").value),
        last_review: document.getElementById("m-date").value,
        remarks:     document.getElementById("m-remarks").value.trim()
    };
    await fetch(id ? `/api/performance/${id}` : "/api/performance", {
        method: id ? "PUT" : "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
    });
    document.querySelector(".modal-overlay").remove();
    load();
}

document.addEventListener("DOMContentLoaded", () => {
    load();

    document.querySelector(".search-input").oninput = () => {
        const q = document.querySelector(".search-input").value.toLowerCase();
        render(records.filter(r => r.name.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)));
    };

    document.querySelector(".filter-dept").onchange = () => {
        const dept = document.querySelector(".filter-dept").value;
        render(dept === "All Departments" ? records : records.filter(r => r.department === dept));
    };

    document.querySelector(".btn-new-review").onclick = () => openReviewForm();

    document.querySelector(".btn-export").onclick = () => {
        if (!requireAdmin("exporting reports")) return;
        const csv = "Name,ID,Department,Position,Score,Rating\n" +
            records.map(r => `"${r.name}",${r.employee_id},"${r.department}","${r.position}",${r.score},"${ratingnila(r.score).label}"`).join("\n");
        Object.assign(document.createElement("a"), {
            href: URL.createObjectURL(new Blob([csv], {type:"text/csv"})),
            download: "performance.csv"
        }).click();
    };
});