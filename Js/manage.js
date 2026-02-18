let allemp = [];
let filtered = [];
let current = 1;
let rowsofpage = 10;

async function load() {
    allemp = await fetch("/api/hr").then(r => r.json());
    filtered = [...allemp];
    current = 1;
    renderPage();
}

function renderPage() {
    const start = (current - 1) * rowsofpage;
    const paginated = filtered.slice(start, start + rowsofpage);
    render(paginated);
    renderPagination();
}

function render(list) {
    document.querySelector(".employee-table tbody").innerHTML = list.length
        ? list.map(e => `
            <tr>
                <td><img src="${e.image}" class="avatar"></td>
                <td>${e.name}</td>
                <td>${e.employee_id || e.id}</td>
                <td>${e.department}</td>
                <td>${e.position}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editEmp(${e.id})">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteEmp(${e.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>`).join("")
        : `<tr><td colspan="6" style="text-align:center;padding:2rem;color:#888">No employees found.</td></tr>`;

    document.querySelector(".pagination-info span").textContent = `of ${filtered.length} employees`;
}

function renderPagination() {
    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsofpage));
    const controls = document.querySelector(".pagination-controls");
    controls.innerHTML = `
        <button class="page-btn" onclick="changePage(${current - 1})" ${current === 1 ? "disabled" : ""}>
            <i class="fa-solid fa-chevron-left"></i>
        </button>
        ${Array.from({length: totalPages}, (_, i) => i + 1).map(p => `
            <button class="page-btn ${p === current ? "active" : ""}" onclick="changePage(${p})">${p}</button>
        `).join("")}
        <button class="page-btn" onclick="changePage(${current + 1})" ${current === totalPages ? "disabled" : ""}>
            <i class="fa-solid fa-chevron-right"></i>
        </button>`;
}

function changePage(p) {
    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsofpage));
    if (p < 1 || p > totalPages) return;
    current = p;
    renderPage();
}



function showModal(e = null) {
    document.querySelector(".modal-overlay")?.remove();
    const isEdit = e !== null;
    document.body.insertAdjacentHTML("beforeend", `
        <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
            <div class="modal">
                <div class="modal-header">
                    <h2>${isEdit ? "Edit" : "Add"} Employee</h2>
                    <button class="modal-close" onclick="document.querySelector('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group"><label>Name</label><input id="m-name" value="${e?.name||''}"></div>
                    <div class="form-group"><label>Employee ID</label><input id="m-empid" value="${e?.employee_id||''}"></div>
                    <div class="form-group"><label>Department</label>
                        <select id="m-dept">
                            ${["IT Department","HR Department","Finance Department","Marketing Department","Sales Department","Operations Department"]
                                .map(d=>`<option ${e?.department===d?"selected":""}>${d}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group"><label>Position</label><input id="m-position" value="${e?.position||''}"></div>
                    <div class="form-group"><label>Date Hired</label><input type="date" id="m-date" value="${e?.date_hired||''}"></div>
                    <div class="form-group"><label>Status</label>
                        <select id="m-status">
                            ${["Active","Inactive","On Leave"].map(s=>`<option ${e?.status===s?"selected":""}>${s}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
                    <button class="btn-save" onclick="${isEdit ? `saveEdit(${e.id})` : "saveNew()"}">${isEdit?"Save":"Add"}</button>
                </div>
            </div>
        </div>`);
}

function getForm() {
    return {
        name: document.getElementById("m-name").value.trim(),
        employee_id: document.getElementById("m-empid").value.trim(),
        department: document.getElementById("m-dept").value,
        position: document.getElementById("m-position").value.trim(),
        date_hired: document.getElementById("m-date").value,
        status: document.getElementById("m-status").value
    };
}

async function saveNew() {
    if (!requireAdmin("adding employees")) return;
    await fetch("/api/hr", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(getForm()) });
    document.querySelector(".modal-overlay").remove();
    load();
}

async function saveEdit(id) {
    if (!requireAdmin("editing employees")) return;
    await fetch(`/api/hr/${id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({id, ...getForm()}) });
    document.querySelector(".modal-overlay").remove();
    load();
}

function editEmp(id) {
    if (!requireAdmin("editing employees")) return;
    showModal(allemp.find(e => e.id === id));
}

async function deleteEmp(id) {
    if (!requireAdmin("deleting employees")) return;
    if (!confirm("Delete this employee?")) return;
    await fetch(`/api/hr/${id}`, { method: "DELETE" });
    load();
}

document.addEventListener("DOMContentLoaded", () => {
    load();

    document.querySelector(".btn-add-employee").onclick = () => {
        if (requireAdmin("adding employees")) showModal();
    };

    document.querySelector(".rows-select").onchange = () => {
        rowsofpage = parseInt(document.querySelector(".rows-select").value);
        current = 1;
        renderPage();
    };

    document.querySelector(".search-input").oninput = () => {
        const q = document.querySelector(".search-input").value.toLowerCase();
        const dept = document.querySelector(".filter-select").value;
        filtered = allemp.filter(e => {
            const matchSearch = e.name.toLowerCase().includes(q) || e.position.toLowerCase().includes(q);
            const matchDept = dept === "All Departments" || e.department === dept;
            return matchSearch && matchDept;
        });
        current = 1;
        renderPage();
    };

    document.querySelector(".filter-select").onchange = () => {
        const dept = document.querySelector(".filter-select").value;
        const q = document.querySelector(".search-input").value.toLowerCase();
        filtered = allemp.filter(e => {
            const matchSearch = e.name.toLowerCase().includes(q) || e.position.toLowerCase().includes(q);
            const matchDept = dept === "All Departments" || e.department === dept;
            return matchSearch && matchDept;
        });
        current = 1;
        renderPage();
    };
});
