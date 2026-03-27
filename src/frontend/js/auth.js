export function requireAuth() {
    const token = localStorage.getItem("token");
    if (!token) { 
        window.location.href = "login.html";
        return;
    }

    const parts = token.split('.');
    if (parts.length !== 3){
        throw new Error("Invalid token format");
    }

    const payload = JSON.parse(atob(parts[1]));

    if(payload.exp < Date.now() / 1000) {
        window.location.href = "login.html";
        return;
    }
}

export function authAlreadyExists() {
    const token = localStorage.getItem("token");
    if (token) { 
        const parts = token.split('.');
        if (parts.length !== 3){
            throw new Error("Invalid token format");
        }

        const payload = JSON.parse(atob(parts[1]));

        if(payload.exp > Date.now() / 1000) {
           // window.location.href = "index.html";
            return;
        }
        
        return;
    }
}