const API_BASE_URL = window.location.protocol === "file:"
    || (window.location.port && window.location.port !== "8000")
    ? "http://localhost:8000/api"
    : "/api";

function apiUrl(path) {
    return `${API_BASE_URL}${path}`;
}
