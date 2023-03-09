export const isLoggedin = () => {
    const token = localStorage.getItem('token');
    return !!token;
};