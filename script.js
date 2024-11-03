const searchInput = document.getElementById('search-input');
const clearButton = document.getElementById('clear-button');
const resultsList = document.getElementById('results-list');
const errorMessage = document.getElementById('error-message');
const resultsCount = document.getElementById('results-count');
const sortSelect = document.getElementById('sort-select');
const previousSearchesSelect = document.getElementById('previous-searches-select');

let allUsers = [];
let filteredUsers = [];
let searchHistory = [];

function debounce(func, delay) {
    let timeout;
    return function () {
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}


async function fetchUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        console.log('Status:', response.status);
        if (response.ok) {
            allUsers = await response.json();
        } else {
            displayError(`An error occurred while fetching data. Response status: ${response.status}`);
        }
    } catch (error) {
        displayError('An error occurred while fetching data.');
        console.error('Error fetching users:', error);
    }
}

function searchUsers(query) {
    if (!query) {
        filteredUsers = [];
        displayResults();
        return;
    }

    filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase())
    );

    saveSearchQuery(query);

    applySorting();
    displayResults();
}

function displayResults() {
    resultsList.innerHTML = '';
    resultsCount.textContent = '';
    errorMessage.textContent = '';

    if (filteredUsers.length === 0) {
        resultsCount.textContent = 'No results found';
        return;
    }

    resultsCount.textContent = `Number of results: ${filteredUsers.length}`;

    filteredUsers.forEach(user => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>Name:</strong> ${user.name}<br>
            <strong>Email:</strong> ${user.email}<br>
            <strong>Address:</strong> ${user.address.street}, ${user.address.city}
        `;
        resultsList.appendChild(listItem);
    });
}

function saveSearchQuery(query) {
    if (!searchHistory.includes(query)) {
        searchHistory.push(query);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        updatePreviousSearches();
    }
}

function loadSearchHistory() {
    const history = localStorage.getItem('searchHistory');
    if (history) {
        searchHistory = JSON.parse(history);
        updatePreviousSearches();
    }
}

function updatePreviousSearches() {
    // مسح الخيارات السابقة
    previousSearchesSelect.innerHTML = '<option value="">-- choose --</option>';

    searchHistory.forEach(query => {
        const option = document.createElement('option');
        option.value = query;
        option.textContent = query;
        previousSearchesSelect.appendChild(option);
    });
}


function displayError(message) {
    errorMessage.textContent = message;
}


function clearSearch() {
    searchInput.value = '';
    filteredUsers = [];
    displayResults();
}


function applySorting() {
    const sortOption = sortSelect.value;

    if (sortOption === 'name-asc') {
        filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'name-desc') {
        filteredUsers.sort((a, b) => b.name.localeCompare(a.name));
    }
}


const debouncedSearch = debounce(function () {
    const query = searchInput.value.trim();
    searchUsers(query);
}, 300);

searchInput.addEventListener('input', debouncedSearch);

clearButton.addEventListener('click', clearSearch);

sortSelect.addEventListener('change', () => {
    applySorting();
    displayResults();
});

previousSearchesSelect.addEventListener('change', () => {
    const query = previousSearchesSelect.value;
    if (query) {
        searchInput.value = query;
        searchUsers(query);
    }
});

// تحميل البيانات عند بدء التشغيل
window.addEventListener('DOMContentLoaded', async () => {
    await fetchUsers();
    loadSearchHistory();
});

/////////// Dark-light mode ////////////
const themeToggleButton = document.getElementById('theme-toggle');

function toggleTheme() {
    document.body.classList.toggle('light-theme');

    if (document.body.classList.contains('light-theme')) {
        themeToggleButton.textContent = 'Dark Mode';
    } else {
        themeToggleButton.textContent = 'Light Mode';
    }
}

themeToggleButton.addEventListener('click', toggleTheme);
