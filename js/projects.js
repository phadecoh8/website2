// js/projects.js
// Beginner-friendly version of the project filter and rendering logic

// Wait until the page is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Get references to the DOM elements we will use
    var filterContainer = document.getElementById('filter-buttons');
    var itemsContainer = document.getElementById('items-container');

    // If the required containers are not present, stop running the script
    if (!filterContainer || !itemsContainer) {
        return;
    }

    // Show a simple loading message while we fetch the data
    itemsContainer.innerHTML = '<div class="col-12"><p>Loading projects…</p></div>';

    // Helper: normalize a string for safe comparisons (lowercase + trim)
    function normalize(text) {
        if (!text) return '';
        return String(text).toLowerCase().trim();
    }

    // Fetch the projects JSON file
    fetch('data/project.json')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network error: ' + response.status);
            }
            return response.json();
        })
        .then(function (projects) {
            // Ensure the data is an array
            if (!Array.isArray(projects)) {
                throw new Error('Invalid data format: expected an array');
            }

            // Render the projects and build the filter buttons
            renderProjects(projects);
            buildFilterButtons(projects);
        })
        .catch(function (error) {
            console.error(error);
            itemsContainer.innerHTML = '<div class="col-12"><p class="text-danger">Could not load projects. Check console for details.</p></div>';
        });

    // Render project cards into the itemsContainer
    function renderProjects(projects) {
        // Clear the container first
        itemsContainer.innerHTML = '';

        // Find the first project that is available (has a URL)
        var firstAvailableIndex = -1;
        for (var idx = 0; idx < projects.length; idx++) {
            if (projects[idx] && projects[idx].url) {
                firstAvailableIndex = idx;
                break;
            }
        }

        for (var i = 0; i < projects.length; i++) {
            var project = projects[i] || {};

            // Create the column that wraps the card
            var col = document.createElement('div');
            col.className = 'col-md-4 col-sm-6 mb-4 project-item';
            // Start items hidden so we can animate them in on first render
            col.classList.add('is-hidden');
            // Store the category on the element for easy filtering later
            col.setAttribute('data-category', project.category || '');
            // Mark whether this project has a URL so we can show a note when filtering
            col.setAttribute('data-has-url', project.url ? 'true' : 'false');

            // Create the card
            var card = document.createElement('div');
            card.className = 'card h-100';

            // Add an image: use project's image if provided; otherwise use
            // a fallback. For the first available project (has a URL) use
            // `images/project.png` as the fallback; otherwise use
            // `images/default.png`.
            var img = document.createElement('img');
            img.className = 'card-img-top';
            img.src = project.image || (i === firstAvailableIndex ? 'images/project.png' : 'images/default.png');
            img.alt = project.name || 'Project image';
            img.style.objectFit = 'cover';
            // Simple fallback if image cannot load
            (function (isFirstAvailable) {
                img.onerror = function () {
                    this.src = isFirstAvailable ? 'images/project.png' : 'images/default.png';
                };
            })(i === firstAvailableIndex);
            card.appendChild(img);

            // Card body with title, description and button
            var cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            var title = document.createElement('h5');
            title.className = 'card-title';
            title.textContent = project.name || '';

            var desc = document.createElement('p');
            desc.className = 'card-text';
            desc.textContent = project.description || '';

            // If the project has a URL, create a link that opens in a new tab.
            // Otherwise create a disabled button that reads "Not available yet".
            var link;
            if (project.url) {
                link = document.createElement('a');
                link.className = 'btn btn-sm btn-primary';
                link.href = project.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = 'View Project';
            } else {
                link = document.createElement('button');
                link.type = 'button';
                link.className = 'btn btn-sm btn-secondary';
                link.disabled = true;
                link.setAttribute('aria-disabled', 'true');
                link.title = 'This project is not available yet';
                link.textContent = 'Not available yet';
            }

            cardBody.appendChild(title);
            cardBody.appendChild(desc);
            cardBody.appendChild(link);

            card.appendChild(cardBody);
            col.appendChild(card);
            itemsContainer.appendChild(col);
        }

        // If there were no projects, show a friendly message
        if (projects.length === 0) {
            itemsContainer.innerHTML = '<div class="col-12"><p>No projects to show.</p></div>';
        }

        // Trigger initial fade-in for all items (small timeout to allow layout)
        setTimeout(function () {
            var items = itemsContainer.getElementsByClassName('project-item');
            for (var i = 0; i < items.length; i++) {
                items[i].classList.remove('is-hidden');
            }
            // Update helper UI after initial animation
            updateUnavailableNote();
            updateNoResultsMessage();
        }, 30);
    }

    // Build the filter buttons based on the categories found in the projects
    function buildFilterButtons(projects) {
        // Start with the "All" category
        var categories = ['All'];

        // Add each category found in the JSON (avoid duplicates)
        for (var i = 0; i < projects.length; i++) {
            var category = projects[i].category || 'Uncategorized';

            // Check if this category is already in our list (case-insensitive)
            var found = false;
            for (var j = 0; j < categories.length; j++) {
                if (normalize(categories[j]) === normalize(category)) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                categories.push(category);
            }
        }

        // Clear any existing buttons
        filterContainer.innerHTML = '';
        // Make it look nicer with Bootstrap utility classes
        filterContainer.className = filterContainer.className + ' d-flex flex-wrap gap-2';
        // Accessibility: mark the container as a toolbar for assistive tech
        filterContainer.setAttribute('role', 'toolbar');
        filterContainer.setAttribute('aria-label', 'Project filters');

        // Create a small note element we can use to inform the user when some
        // shown projects are not yet available (no URL). We insert it right
        // after the filter buttons container.
        var note = document.getElementById('filter-note');
        if (!note) {
            note = document.createElement('div');
            note.id = 'filter-note';
            note.className = 'small text-muted mt-2';
            // Accessibility: announce changes to screen readers
            note.setAttribute('role', 'status');
            note.setAttribute('aria-live', 'polite');
            note.setAttribute('aria-atomic', 'true');
            filterContainer.parentNode.insertBefore(note, filterContainer.nextSibling);
        }

        // Create a button for each category
        for (var k = 0; k < categories.length; k++) {
            var label = categories[k];
            var button = document.createElement('button');
            button.type = 'button';
            // Make the first button (All) the active one by default
            button.className = 'btn ' + (k === 0 ? 'btn-primary' : 'btn-outline-primary');
            button.textContent = label;
            // Store a normalized value for filtering comparisons
            button.setAttribute('data-filter', normalize(label));
            // Accessibility: indicate pressed state
            button.setAttribute('aria-pressed', k === 0 ? 'true' : 'false');

            // When clicked, apply the filter
            button.addEventListener('click', function () {
                var selectedFilter = this.getAttribute('data-filter');

                // Update button styles and aria-pressed for all buttons
                var allButtons = filterContainer.getElementsByTagName('button');
                for (var b = 0; b < allButtons.length; b++) {
                    allButtons[b].className = 'btn btn-outline-primary';
                    allButtons[b].setAttribute('aria-pressed', 'false');
                }

                // Make the clicked button look active
                this.className = 'btn btn-primary';
                this.setAttribute('aria-pressed', 'true');

                // Determine which items should be visible and animate the change
                var items = itemsContainer.getElementsByClassName('project-item');
                var visibleCount = 0;
                var unavailableVisibleCount = 0;

                for (var x = 0; x < items.length; x++) {
                    var item = items[x];
                    var itemCategory = normalize(item.getAttribute('data-category') || '');
                    var shouldShow = (selectedFilter === 'all' || itemCategory === selectedFilter);

                    if (shouldShow) {
                        visibleCount++;
                        if (item.getAttribute('data-has-url') === 'false') unavailableVisibleCount++;
                        showItemWithAnimation(item);
                    } else {
                        hideItemWithAnimation(item);
                    }
                }

                // Update helper UI immediately based on calculated counts
                updateUnavailableNote(unavailableVisibleCount);
                updateNoResultsMessage(visibleCount);
            });

            filterContainer.appendChild(button);
        }

        // Set the initial state of the note based on the default (All)
        updateUnavailableNote();
        // Ensure the initial no-results state is correct
        updateNoResultsMessage();
    }

    // Show an item with a small fade-in transition
    function showItemWithAnimation(item) {
        // If already visible and not animating, nothing to do
        if (!item.classList.contains('d-none') && !item.classList.contains('is-hidden')) return;

        // If the item is hidden (d-none), remove it and start from the hidden state
        if (item.classList.contains('d-none')) {
            item.classList.remove('d-none');
            item.classList.add('is-hidden');
            // Force a reflow so the removal above is processed before we remove the hiding class
            void item.offsetWidth;
        }

        // Remove the 'is-hidden' class to trigger the CSS transition to visible
        item.classList.remove('is-hidden');
    }

    // Hide an item with a small fade-out transition, then set d-none after the transition ends
    function hideItemWithAnimation(item) {
        // If already hidden, do nothing
        if (item.classList.contains('d-none')) return;
        if (item.classList.contains('is-hidden')) return; // already animating out

        item.classList.add('is-hidden');

        var onEnd = function (e) {
            // Only handle the opacity transition end to avoid running twice
            if (e && e.propertyName && e.propertyName !== 'opacity') return;
            item.removeEventListener('transitionend', onEnd);
            // If still hidden after the transition, remove from layout
            if (item.classList.contains('is-hidden')) {
                item.classList.add('d-none');
                item.classList.remove('is-hidden');
            }
        };

        item.addEventListener('transitionend', onEnd);
    }

    // Update the small note under filters; if a count is provided use it (used when animating)
    function updateUnavailableNote(countOverride) {
        var note = document.getElementById('filter-note');
        if (!note) return;

        var count = 0;
        if (typeof countOverride === 'number') {
            count = countOverride;
        } else {
            var items = itemsContainer.getElementsByClassName('project-item');
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.classList.contains('d-none')) continue;
                if (item.getAttribute('data-has-url') === 'false') count++;
            }
        }

        if (count > 0) {
            note.textContent = 'Note: ' + count + ' project(s) shown are not available yet.';
        } else {
            note.textContent = '';
        }
    }

    // Update the "no results" message; if visibleCount is provided, use it
    function updateNoResultsMessage(visibleCountOverride) {
        var visibleCount;
        if (typeof visibleCountOverride === 'number') {
            visibleCount = visibleCountOverride;
        } else {
            var items = itemsContainer.getElementsByClassName('project-item');
            visibleCount = 0;
            for (var i = 0; i < items.length; i++) {
                if (!items[i].classList.contains('d-none')) visibleCount++;
            }
        }

        var placeholder = document.getElementById('no-results');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.id = 'no-results';
            placeholder.className = 'col-12';
            placeholder.innerHTML = '<p class="text-muted">No projects match this filter.</p>';
            itemsContainer.appendChild(placeholder);
        }

        placeholder.style.display = visibleCount === 0 ? '' : 'none';
    }

    // Simple previous/next navigation
    var prevBtn = document.getElementById('pre-page');
    var nextBtn = document.getElementById('next-page');

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            window.location.href = 'about.html';
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            window.location.href = 'contact.html';
        });
    }

    // Keyboard navigation for left and right arrows
    document.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft' && prevBtn) {
            prevBtn.click();
        } else if (event.key === 'ArrowRight' && nextBtn) {
            nextBtn.click();
        }
    });
});