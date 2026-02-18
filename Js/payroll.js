let records = [];
const peso = n => "₱" + Number(n).toLocaleString("en-PH");

async function load() {
    records = await fetch("/api/payroll").then(r => r.json());
    render(records);
    updateCards(records);
}

function updateCards(list) {
    const total   = list.reduce((s, r) => s + (r.basic_salary - r.deductions), 0);
    const paid    = list.filter(r => r.status === "Paid").length;
    const vals    = document.querySelectorAll(".card-value");
    vals[0].textContent = peso(total);
    vals[1].textContent = list.length;
    vals[2].textContent = list.length ? peso(Math.round(total / list.length)) : "₱0";
    vals[3].textContent = list.length ? Math.round((paid / list.length) * 100) + "%" : "0%";
}

function render(list) {
    document.querySelector(".payroll-table tbody").innerHTML = list.length
        ? list.map(r => `
            <tr>
                <td>${r.name}</td>
                <td>${r.employee_id}</td>
                <td>${r.department}</td>
                <td>${peso(r.basic_salary)}</td>
                <td>${peso(r.deductions)}</td>
                <td><strong>${peso(r.basic_salary - r.deductions)}</strong></td>
                <td><span class="badge ${r.status === 'Paid' ? 'paid' : 'pending'}">${r.status}</span></td>
            </tr>`).join("")
        : `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#888">No records found.</td></tr>`;

    document.querySelector(".pagination-info span").textContent = `of ${list.length} employees`;
}

function filter() {
    const q    = document.querySelector(".search-input").value.toLowerCase();
    const dept = document.querySelector(".filter-select").value;
    render(records.filter(r =>
        (r.name.toLowerCase().includes(q) || String(r.employee_id).includes(q)) &&
        (dept === "All Departments" || r.department === dept)
    ));
}

document.addEventListener("DOMContentLoaded", () => {
    load();
    document.querySelector(".search-input").oninput = filter;
    document.querySelector(".filter-select").onchange = filter;

    document.querySelector(".btn-process").onclick = async () => {
        if (!requireAdmin("processing payroll")) return;
        const pending = records.filter(r => r.status === "Pending");
        if (!pending.length) return alert("All records already processed!");
        if (!confirm(`Process ${pending.length} pending employee(s)?`)) return;
        await Promise.all(pending.map(r =>
            fetch(`/api/payroll/${r.id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({...r, status:"Paid"}) })
        ));
        load();
    };

    document.querySelector(".btn-generate").onclick = () => {
        if (!requireAdmin("generating payroll reports")) return;
        const csv = "Name,ID,Department,Basic,Deductions,Net,Status\n" +
            records.map(r => `"${r.name}",${r.employee_id},"${r.department}",${r.basic_salary},${r.deductions},${r.basic_salary - r.deductions},${r.status}`).join("\n");
        const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], {type:"text/csv"})), download: "payroll.csv" });
        a.click();
    };
});