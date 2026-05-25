export const isAdminPath = () => window.location.pathname.startsWith("/admin")

export const getStoredToken = () => {
    if (isAdminPath()) return sessionStorage.getItem("admin_token")
    return localStorage.getItem("token")
}

export const setStoredToken = (token, isAdmin) => {
    if (isAdmin) sessionStorage.setItem("admin_token", token)
    else localStorage.setItem("token", token)
}

export const clearStoredToken = (isAdmin) => {
    if (isAdmin) sessionStorage.removeItem("admin_token")
    else localStorage.removeItem("token")
}