export const getList = () => {
    const list = localStorage.getItem('todo-list');
    if (list) {
        return JSON.parse(list);
    }
    return [];
}

export const setList = (list) => {
    localStorage.setItem('todo-list', JSON.stringify(list));
}