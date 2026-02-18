//middleware simulation toh 

const Middleware = {

    // ── Internal fetch helper ──────────────────────────────────────────────
    _fetch: async function(url, method = "GET", body = null) {
        const options = {
            method,
            headers: { "Content-Type": "application/json" }
        };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch(url, options);
        return res.json();
    },

    // ── Auth ──────────────────────────────────────────────────────────────
    login: async function(username, password) {
        return this._fetch("/api/login", "POST", { username, password });
    },

    register: async function(username, password, role = "User") {
        return this._fetch("/api/register", "POST", { username, password, role });
    },

    // module controller toh 
    request: async function(module, action, data = null) {
        const endpoints = {
            HR:          "/api/hr",
            Payroll:     "/api/payroll",
            Attendance:  "/api/attendance",
            Performance: "/api/performance"
        };

        const url = endpoints[module];
        if (!url) return { error: "Unknown module: " + module };

        switch (action) {
            case "getAll":
                return this._fetch(url, "GET");

            case "add":
                return this._fetch(url, "POST", data);

            case "update":
                if (!data?.id) return { error: "id required for update" };
                return this._fetch(`${url}/${data.id}`, "PUT", data);

            case "delete":
                if (!data?.id) return { error: "id required for delete" };
                return this._fetch(`${url}/${data.id}`, "DELETE");

            default:
                return { error: "Unknown action: " + action };
        }
    }
};