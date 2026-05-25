const API_BASE_URL = window.location.protocol === "file:"
    ? "http://localhost:8000/api"
    : (window.location.port && window.location.port !== "8000")
        ? `${window.location.protocol}//${window.location.hostname}:8000/api`
        : "/api";

function apiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

window.apiUrl = apiUrl;
