import { isLoggedin } from './auth';
import { getList, setList } from './storage';
import './styles/index.css';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const searchList = document.getElementById('search-list');
const resultCount = document.getElementById('result-count');
const searchForm = document.getElementById('search-form');
const search = document.getElementById('search-input');
const notification = document.getElementById('notification');
const dateInput = document.getElementById('date-input');
const editTodo = document.getElementById('edit-todo');

search.addEventListener('focus', function () {
    search.select();
});

search.addEventListener('click', function () {
    search.select();
});

let todos = [];
let selected_date = new Date().toISOString().substring(0, 10);
let selected_todo = null;

window.addEventListener('load', function () {
    todos = getList();
    printList();
    setTimeout(() => {
        console.log(selected_date, 'selected_date');
        dateInput.value = selected_date;    
    }, 0);
    
    if(!isLoggedin()) {
        // setTimeout(() => {
        //     showLoginNotification();
        // }, 1000);
    }
});

function showLoginNotification() {
    notification.classList.add('show');
    notification.innerHTML = `You are not logged in!`;
    setTimeout(() => {
        notification.classList.remove('show');
        notification.innerHTML = '';
    }, 5000);
}

todoForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const todoText = todoInput.value.trim();

    const todo_item = {
        id: Date.now(),
        text: todoText,
        is_complete: false,
        is_deleted: false,
        due_date: null,
        description: '',
    }

    if (todoText) {
        todos.push(todo_item);
        setList(todos);
        printList();
        todoInput.value = '';
    }
});

function printList() {
    todoList.innerHTML = '';

    if(!todos.length) {
        todoList.innerHTML = `
            <li class="no-data">
                <i>There are no Todos found!</i>
            </li>
        `;
        return;
    }
    todos.forEach((todo) => {
        const todoItem = createTodoItem(todo);
        todoList.appendChild(todoItem);
    });
}

function createTodoItem(todo) {
    const todoItem = document.createElement('li');
    todoItem.innerHTML = `
    <div class="todo-item">
        <input type="checkbox" class="input-checkbox" id="todo-check" ${todo.is_complete?'checked':''}>
        <div class="todo-text">
            <p>${todo.text}</p>
            <div id="todo-due-date"></div>
            ${todo.description && `<div class="todo-description">${todo.description}</div>`}
        </div>
        ${todo.description && '<button class="expand-todo"><i class="fa-solid fa-chevron-down"></i></button>'}
        <button class="delete-todo"><i class="fa-solid fa-trash-can"></i></button>
    </div>
  `;

    if(todo.description) {
        const expansion = todoItem.querySelector('.expand-todo');
        const description = todoItem.querySelector('.todo-description');
        expansion.addEventListener('click', function (event) {
            console.log('clicked')
            if (description.classList.contains('show')) {
                description.classList.remove('show');
                expansion.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
            } else {
                description.classList.add('show');
                expansion.innerHTML = `<i class="fa-solid fa-chevron-up"></i>`;
            }

        });
    }
    
    const checkbox = todoItem.querySelector('.input-checkbox');
    todoItem.addEventListener('click', function () {
        selected_todo = todo;
        onSelect(todo);
    });

    checkbox.addEventListener('change', function (event) {
        event.stopPropagation();
        todo.is_complete = !todo.is_complete;
        setList(todos);
    });
    const deleteButton = todoItem.querySelector('.delete-todo');
    deleteButton.addEventListener('click', function (event) {
        event.stopPropagation();
        todoList.removeChild(todoItem);
        todos = todos.filter((item) => item.id !== todo.id);
        setList(todos);
    });
    const dueDate = todoItem.querySelector('#todo-due-date');
    if (todo.due_date) {
        const date = new Date(todo.due_date);
        const date_str = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        dueDate.innerHTML = `
            <span class="due-date">
                <i class="fa-solid fa-calendar-days mr-2"></i>
                <span>${date_str}</span>
            </span>
        `;
    }

    return todoItem;
}

searchForm.addEventListener('submit', function onSearch(event) {
    event.preventDefault();
    const result = todos.filter((todo) => todo.text.includes(search.value));
    search.select();
    if (!result.length) {
        searchList.innerHTML = `
            <li class="no-data">
                <i>No results found!</i>
            </li>
        `;
        return
    }
    searchList.innerHTML = '';
    resultCount.innerHTML = `Showing: ${result.length} result${result.length > 1 ? 's' : ''}`;
    result.forEach((todo) => {
        const item = document.createElement('li');
        const date = new Date(todo.id);
        const date_str = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
        item.innerHTML = `
            <div class="d-flex justify-content-between">
                ${todo.text}
                <span class="search-date-time">${date_str}</span>
            </div>
        `;
        searchList.appendChild(item);
    })
});

const onSelect = (todo) => {
    editTodo.innerHTML = '';
    const el = document.createElement('div');
    let due_date = null;
    if (todo.due_date) {
        due_date = new Date(todo.due_date).toISOString().substring(0, 10);
    }
    el.innerHTML = `
        <label>Title</label>
        <input type="text" id="input-update-todo" class="input-field w-100" value="${todo.text}">
        <label class="mt-4">Description</label>
        <textarea rows="10" id="update-description" class="input-textarea w-100" value="${todo.description}">${todo.description}</textarea>
        <p class="date-description">Date created: ${new Date(todo.id).toLocaleString()}</p>
        <label class="mt-4">Due Date</label>
        <input type="date" id="update-due-date" class="input-field w-100" value="${due_date}">
        <div class="py-4 d-flex justify-end">
            <button id="btn-delete-todo" class="btn btn-secondary mr-2">Delete</button>
            <button id="btn-update-todo" class="btn btn-primary">Update</button>
        </div>
    `;
    
    // adding event listeners to delete button
    const deleteTodo = el.querySelector('#btn-delete-todo');
    deleteTodo.addEventListener('click', function () {
        todos = todos.filter((item) => item.id !== todo.id);
        setList(todos);
        printList();
        editTodo.innerHTML = '';
    });

    // adding event listeners to update button
    const updateTodo = el.querySelector('#btn-update-todo');
    const text = el.querySelector('#input-update-todo');
    const description = el.querySelector('#update-description');
    const dueDate = el.querySelector('#update-due-date');
    
    updateTodo.addEventListener('click', function () {
        todo.text = text.value;
        todo.description = description.value;
        todo.due_date = dueDate.value;
        todos.findIndex((item) => {
            if (item.id === todo.id) {
                setList(todos);
                printList();
            }
        });
        editTodo.innerHTML = '';
    })
    editTodo.appendChild(el);
}
