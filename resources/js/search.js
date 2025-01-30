document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('global-search-input');
    const resultsContainer = document.getElementById('global-search-results');
    const resultsList = document.getElementById('global-search-results-list');
    
    // Configuration
    const config = {
        debounceTime: 300,
        collections: [/*'experience', 'place',*/ 'pages'],
        apiBase: '/api/collections',
        locale: document.documentElement.lang || 'en',
        messages: {
            noResults: { 
                en: 'No matching results.', 
                ar: 'لا توجد نتائج مطابقة.' 
            },
            error: { 
                en: 'An error occurred during the search.', 
                ar: 'حدث خطأ أثناء البحث.' 
            }
        }
    };

    // State management
    let abortController = null;
    let currentRequest = null;

    // Initialize the search
    initializeSearch();

    function initializeSearch() {
        if (!searchInput || !resultsContainer || !resultsList) {
            console.error('One or more required elements are missing');
            return;
        }

        setupEventListeners();
        injectStyles();
    }

    function setupEventListeners() {
        // Debounced input handler
        searchInput.addEventListener('input', debounce(handleInput, config.debounceTime));

        // Click outside handler
        document.addEventListener('click', handleClickOutside);
    }

    function debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    async function handleInput(e) {
        try {
            const query = e.target.value.trim();
            clearResults();

            if (query.length < 1) {
                hideResults();
                return;
            }

            showLoadingState();
            const results = await performSearch(query);
            displayResults(results);

            results.length > 0 ? showResults() : showNoResults();
        } catch (error) {
            handleSearchError(error);
        }
    }

    async function performSearch(query) {
        if (abortController) abortController.abort();
        abortController = new AbortController();

        try {
            const requests = config.collections.map(collection => 
                fetchCollection(collection, query)
            );
            
            const results = await Promise.all(requests);
            return results.flat();
        } catch (error) {
            if (error.name !== 'AbortError') throw error;
            return [];
        }
    }

    async function fetchCollection(collection, query) {
        const url = new URL(`${config.apiBase}/${collection}/entries`,window.location.origin);
        console.log(url);
        
        const params = {
            'filter[title:contains]': query,
            
        };

        Object.entries(params).forEach(([key, value]) => 
            url.searchParams.append(key, value)
        );

        const response = await fetch(url, {
            signal: abortController.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return (await response.json()).data || [];
    }

    function displayResults(results) {
        resultsList.innerHTML = '';
        const fragment = document.createDocumentFragment();

        results.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${item.url}" target="_self">
                    <h3>${item.title}</h3>
                    <p>${item.collection.title} - ${item.blueprint.title}</p>
                </a>
            `;
            fragment.appendChild(li);
        });

        resultsList.appendChild(fragment);
    }

    function handleClickOutside(e) {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            hideResults();
        }
    }

    function showLoadingState() {
        resultsList.innerHTML = `
            <div class="loading-state">
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                <span>${config.locale === 'ar' ? 'جاري البحث...' : 'Searching...'}</span>
            </div>
        `;
    }

    function showNoResults() {
        resultsList.innerHTML = `
            <p class="no-results">
                ${config.messages.noResults[config.locale]}
            </p>
        `;
    }

    function handleSearchError(error) {
        console.error('Search error:', error);
        resultsList.innerHTML = `
            <p class="error-message">
                ${config.messages.error[config.locale]}
            </p>
        `;
    }

    function clearResults() {
        resultsList.innerHTML = '';
    }

    function showResults() {
        resultsContainer.classList.add('show');
        resultsContainer.style.opacity = '1';
    }

    function hideResults() {
        resultsContainer.classList.remove('show');
        resultsContainer.style.opacity = '0';
    }

    function injectStyles() {
        if (!document.getElementById('search-styles')) {
            const style = document.createElement('style');
            style.id = 'search-styles';
            style.textContent = `
                .loading-state {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    color: #666;
                }
                .spinner {
                    animation: rotate 1s linear infinite;
                    height: 20px;
                    width: 20px;
                    margin-${config.locale === 'ar' ? 'left' : 'right'}: 8px;
                }
                .spinner circle {
                    stroke: currentColor;
                    stroke-linecap: round;
                    stroke-dasharray: 90, 150;
                    stroke-dashoffset: 0;
                    animation: dash 1.5s ease-in-out infinite;
                }
                @keyframes rotate {
                    100% { transform: rotate(360deg); }
                }
                @keyframes dash {
                    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
                    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
                    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
                }
            `;
            document.head.appendChild(style);
        }
    }
});