let allLeaves = [];

document.addEventListener('DOMContentLoaded', function () {

    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 500,
        events: [],

        eventContent: function(arg) {
            var parts = arg.event.title.split(" - ");
            var el = document.createElement("div");
            el.style.fontSize = "0.75rem";
            el.style.lineHeight = "1rem";
            el.style.whiteSpace = "normal";
            el.innerHTML = `<strong>${parts[0]}</strong><br><em>${parts[1]}</em>`;
            return { domNodes: [el] };
        }
    });

    calendar.render();

    // ===== YOUR EMPLOYEE LEAVES =====
    const staticLeaves = [
        { employeeName: "FRANCO, JAMES CHRISTIAN", status: "Pending", date: "2026-01-15" },
        { employeeName: "GARCIA, REIMAR", status: "Approved", date: "2026-02-10" },
        { employeeName: "LIRIO, JENEFER", status: "Approved", date: "2026-03-05" },
        { employeeName: "HIPOLITO, HANNAH PAULINE", status: "Approved", date: "2026-04-20" },
        { employeeName: "BOMBALES, JAKE", status: "Pending", date: "2026-05-01" },
        { employeeName: "AREOLA, LEOMAR JAY", status: "Approved", date: "2026-06-15" },
        { employeeName: "LARUMBE, ELDRON JESTINE", status: "Rejected", date: "2026-07-18" },
        { employeeName: "JIMENEZ, MELCHOR", status: "Pending", date: "2026-08-10" },
        { employeeName: "GERLINGO, LOUISSE", status: "Approved", date: "2026-09-05" },
        { employeeName: "TAMPARONG, EVERLY", status: "Pending", date: "2026-10-12" },
        { employeeName: "OGANIA, KENZO", status: "Rejected", date: "2026-11-22" }
    ];

    staticLeaves.forEach(leave => addLeave(leave));

    // ===== ADD LEAVE FUNCTION =====
    function addLeave(leave) {

        let color =
            leave.status === "Approved" ? "green" :
            leave.status === "Pending" ? "orange" :
            "red";

        calendar.addEvent({
            title: leave.employeeName + " - " + leave.status,
            start: leave.date,
            color: color
        });

        allLeaves.push(leave);

        updateSummary(allLeaves);
        updateTable(allLeaves);
    }

});

function updateSummary(leaves) {
    document.getElementById("totalLeaves").innerText = leaves.length;
    document.getElementById("approvedLeaves").innerText =
        leaves.filter(l => l.status === "Approved").length;
    document.getElementById("pendingLeaves").innerText =
        leaves.filter(l => l.status === "Pending").length;
    document.getElementById("rejectedLeaves").innerText =
        leaves.filter(l => l.status === "Rejected").length;
}

function updateTable(leaves) {
    const tableBody = document.getElementById("leaveTableBody");

    if (!tableBody) {
        console.error("leaveTableBody not found!");
        return;
    }

    tableBody.innerHTML = "";

    leaves.forEach(leave => {
        const row = `
            <tr>
                <td>${leave.employeeName}</td>
                <td>${leave.date}</td>
                <td>${leave.status}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}


