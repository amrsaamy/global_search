class GlobalSearch {
    constructor(config) {
        // DOM Elements
        this.searchInput = document.getElementById(config.inputId);
        this.resultsContainer = document.getElementById(config.resultsId);
        this.resultsList = document.getElementById(config.listId);

        // Configuration
        this.config = {
            debounceTime: config.debounceTime || 300,
            collections: config.collections || ['experience', 'place', 'pages'],
            apiBase: config.apiBase || '/api/collections',
            locale: document.documentElement.lang || 'en',
            messages: config.messages || {
                noResults: { en: 'No matching results.', ar: 'لا توجد نتائج مطابقة.' },
                error: { en: 'An error occurred during the search.', ar: 'حدث خطأ أثناء البحث.' }
            }
        };

        // State management
        this.abortController = null;
        this.currentRequest = null;

        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.injectStylesIfNeeded();
    }

    setupEventListeners() {
        // Debounced input handler
        this.searchInput.addEventListener('input', this.debounce((e) => {
            this.handleSearch(e.target.value.trim());
        }, this.config.debounceTime));

        // Click outside handler
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.resultsContainer.contains(e.target)) {
                this.hideResults();
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    async handleSearch(query) {
        try {
            this.clearResults();

            if (query.length < 1) {
                this.hideResults();
                return;
            }

            this.showLoadingState();
            const results = await this.performSearch(query);
            this.displayResults(results);

            if (results.length > 0) {
                this.showResults();
            } else {
                this.showNoResults();
            }
        } catch (error) {
            this.handleSearchError(error);
        }
    }

    async performSearch(query) {
        // Abort previous request if exists
        if (this.abortController) {
            this.abortController.abort();
        }

        // Create new abort controller
        this.abortController = new AbortController();

        try {
            const requests = this.config.collections.map(collection =>
                this.fetchCollection(collection, query)
            );

            const results = await Promise.all(requests);
            return results.flat();
        } catch (error) {
            if (error.name !== 'AbortError') throw error;
            return [];
        }
    }

    async fetchCollection(collection, query) {
        const url = new URL(`${this.config.apiBase}/${collection}/entries`);
        const params = {
            'filter[title:contains]': query,
            'filter[published:is]': true,
            'filter[locale:is]': this.config.locale
        };

        Object.entries(params).forEach(([key, value]) =>
            url.searchParams.append(key, value)
        );

        const response = await fetch(url, {
            signal: this.abortController.signal
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.data || [];
    }

    displayResults(results) {
        this.resultsList.innerHTML = '';

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

        this.resultsList.appendChild(fragment);
    }

    showLoadingState() {
        this.resultsList.innerHTML = `
            <div class="loading-state">
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
                <span>${this.config.locale === 'ar' ? 'جاري البحث...' : 'Searching...'}</span>
            </div>
        `;
    }

    showNoResults() {
        this.resultsList.innerHTML = `
            <p class="no-results">
                ${this.config.messages.noResults[this.config.locale]}
            </p>
        `;
    }

    handleSearchError(error) {
        console.error('Search error:', error);
        this.resultsList.innerHTML = `
            <p class="error-message">
                ${this.config.messages.error[this.config.locale]}
            </p>
        `;
    }

    clearResults() {
        this.resultsList.innerHTML = '';
    }

    showResults() {
        this.resultsContainer.classList.add('show');
        this.resultsContainer.style.opacity = '1';
    }

    hideResults() {
        this.resultsContainer.classList.remove('show');
        this.resultsContainer.style.opacity = '0';
    }

    injectStylesIfNeeded() {
        if (!document.getElementById('globalsearch-styles')) {
            const style = document.createElement('style');
            style.id = 'globalsearch-styles';
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
                    margin-${this.config.locale === 'ar' ? 'left' : 'right'}: 8px;
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
}

// Initialize with configuration
document.addEventListener('DOMContentLoaded', () => {
    const search = new GlobalSearch({
        inputId: 'search-input',
        resultsId: 'search-results',
        listId: 'search-result-child',
        debounceTime: 300,
        collections: ['experience', 'place', 'pages'],
        apiBase: '/api/collections',
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
    });
});
