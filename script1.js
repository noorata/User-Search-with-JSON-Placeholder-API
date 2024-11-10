import {
    searchInput,
    clearButton,
    resultsBody,
    errorMessage,
    resultsCount,
    themeToggleButton,
    searchSuggestions,
    nameHeader,
    emailHeader,
    addressHeader,
} from './const.js';
import { fetchUsers } from './helperFunc/fetchData.js';
import { debounce } from './helperFunc/useDebounce.js';

const allUsers = [];
let filteredUsers = [];
let searchHistotyList = [];
let currentSortColumn = null;
let currentSortOrder = 'asc';
function searchUsers(query) {
    if (!query) {
        filteredUsers = [];
        displayResults();
        return;
    }

    filteredUsers = allUsers.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase())
    );
    sortResults(currentSortColumn);
    saveSearchQuery(query);
    displayResults();
}

function saveSearchQuery(query) {
    const trimmedQuery = query.trim();
    if (trimmedQuery === '') return;

    const existingQuery = searchHistotyList.indexOf(trimmedQuery);
    if (existingQuery !== -1) {
        searchHistotyList.splice(existingQuery, 1);
    }
    //add query to beginning of list using unshift
    searchHistotyList.unshift(trimmedQuery);
    if (searchHistotyList.length > 10) {
        //delete oldest by using pop
        searchHistotyList.pop();
    }
    localStorage.setItem('searchHistotyList', JSON.stringify(searchHistotyList));
}

function loadSearchHistory() {
    const history = localStorage.getItem('searchHistotyList');
    if (history) {
        searchHistotyList = JSON.parse(history);
    }
}

function updateSuggestions() {
    const query = searchInput.value.trim().toLowerCase();
    searchSuggestions.innerHTML = '';

    if (query === '') {
        //show search history
        searchHistotyList.forEach((historyItem) => {
            const suggestionItem = createSuggestionItem(historyItem, 'history');
            searchSuggestions.appendChild(suggestionItem);
        });
    } else {
        //show matching user names and history
        const matchingUsersName = allUsers
            //extracts only name for each user(map)
            .map((user) => user.name)
            .filter((name) => name.toLowerCase().includes(query));

        const uniqueSuggestions = [...new Set([...searchHistotyList, ...matchingUsersName])];

        uniqueSuggestions.forEach((suggestion) => {
            if (suggestion.toLowerCase().includes(query)) {
                const suggestionItem = createSuggestionItem(suggestion, 'search');
                searchSuggestions.appendChild(suggestionItem);
            }
        });
    }

    if (searchSuggestions.childElementCount > 0) {
        showSuggestions();
    } else {
        hideSuggestions();
    }
}

function createSuggestionItem(text, type) {
    const suggestionItem = document.createElement('li');
    //fa-clock-rotate-left icon: if the suggestion is taken from the search history
    // fa-magnifying-glass icon: if the suggestion is based on direct search results
    const iconClass = type === 'history' ? 'fa-clock-rotate-left' : 'fa-magnifying-glass';

    // Highlight matching text
    const query = searchInput.value.trim();
    const regularExpression = new RegExp(`(${query})`, 'gi'); //g means to search the entire text and i means to ignore case
    const highlightedText = text.replace(regularExpression, '<strong>$1</strong>');

    suggestionItem.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span class="suggestion-text">${highlightedText}</span>
    `;
    suggestionItem.addEventListener('click', () => {
        searchInput.value = text;
        searchUsers(text);
        hideSuggestions();
    });
    return suggestionItem;
}

//debounced of the search function
const debouncedSearchUsers = debounce(() => {
    const query = searchInput.value.trim();
    searchUsers(query);
}, 300);

//debounced of the updateSuggestions function
const debouncedUpdateSuggestions = debounce(() => {
    updateSuggestions();
}, 300);

searchInput.addEventListener('focus', () => {
    updateSuggestions();
});

searchInput.addEventListener('input', () => {
    debouncedUpdateSuggestions();
    debouncedSearchUsers();
});

searchInput.addEventListener('blur', () => {
    setTimeout(() => hideSuggestions(), 200); //delay to allow click event
});

clearButton.addEventListener('click', () => {
    clearSearch();
    updateSuggestions();
});

themeToggleButton.addEventListener('click', toggleTheme);

function showSuggestions() {
    searchSuggestions.style.display = 'block';
}

function hideSuggestions() {
    searchSuggestions.style.display = 'none';
}

function clearSearch() {
    searchInput.value = '';
    filteredUsers = [];
    displayResults();
}

function toggleTheme() {
    document.body.classList.toggle('lightTheme');
    //why contains instead of includes?
    //includes is not designed for classList but rather for arrays and strings
    //contains should be used when working with classList to check for the presence of a specific class
    if (document.body.classList.contains('lightTheme')) {
        themeToggleButton.textContent = 'Dark Mode';
    } else {
        themeToggleButton.textContent = 'Light Mode';
    }
}

function displayResults() {
    resetInputs();

    if (filteredUsers.length === 0) {
        resultsCount.textContent = 'No results found';
        return;
    }

    resultsCount.textContent = `Number of results: ${filteredUsers.length}`;

    filteredUsers.forEach((user) => {
        const row = createTableRow(user);
        resultsBody.appendChild(row);
    });
}

//create a table row for a user
function createTableRow(user) {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = user.name;
    row.appendChild(nameCell);

    const emailCell = document.createElement('td');
    emailCell.textContent = user.email;
    row.appendChild(emailCell);

    const addressCell = document.createElement('td');
    addressCell.textContent = `${user.address.street}, ${user.address.city}`;
    row.appendChild(addressCell);

    return row;
}

function resetInputs() {
    resultsBody.innerHTML = '';
    resultsCount.textContent = '';
    errorMessage.textContent = '';
}

function sortResults(column) {
    if (!column) return;

    if (currentSortColumn === column) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortOrder = 'asc';
    }

    filteredUsers.sort((a, b) => {
        let aValue, bValue;

        if (column === 'name') {
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        } else if (column === 'email') {
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
        } else if (column === 'address') {
            aValue = `${a.address.street}, ${a.address.city}`.toLowerCase();
            bValue = `${b.address.street}, ${b.address.city}`.toLowerCase();
        }

        if (aValue < bValue) {
            return currentSortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return currentSortOrder === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

function updateSortIcons(column) {
    //reset all icons and headers
    [nameHeader, emailHeader, addressHeader].forEach((header) => {
        header.querySelector('i').className = 'fa-solid fa-sort';
        header.classList.remove('active');
    });

    //update the icon and header class on the current column
    const currentHeader = column === 'name' ? nameHeader : column === 'email' ? emailHeader : addressHeader;
    currentHeader.classList.add('active');
    const icon = currentHeader.querySelector('i');
    icon.className = currentSortOrder === 'asc' ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down';
}

nameHeader.addEventListener('click', () => {
    sortResults('name');
    updateSortIcons('name');
    displayResults();
});

emailHeader.addEventListener('click', () => {
    sortResults('email');
    updateSortIcons('email');
    displayResults();
});

addressHeader.addEventListener('click', () => {
    sortResults('address');
    updateSortIcons('address');
    displayResults();
});

window.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchUsers();
    allUsers.push(...data);
    loadSearchHistory();
    //display all users by default
    filteredUsers = [...allUsers];
    displayResults();
});
