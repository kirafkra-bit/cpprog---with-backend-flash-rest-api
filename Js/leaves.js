document.addEventListener('DOMContentLoaded', function () {

    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        height: 600,
        events: [
            {
                title: 'Franco - Pending',
                start: '2026-03-16',
                end: '2026-03-18',
                color: 'orange'
            },
            {
                title: 'Mar - Approved',
                start: '2026-04-20',
                end: '2026-04-21',
                color: 'green'
            },
            {
                title: 'Jen - Birthday Leave',
                start: '2026-05-23',
                color: 'blue'
            }
        ]
    });

    calendar.render();
});
