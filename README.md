# Portfolio — README

This repository is a small static portfolio website built with plain HTML, Bootstrap for layout and styling, and a small amount of JavaScript for dynamic behavior on the Projects page.

This README explains how to run the site, how the Projects filtering works (both from a user point-of-view and how it is implemented under the hood), and how to extend or customize the behavior.

Table of contents
- Overview
- Quick start (run locally)
- Project structure
- Project page: user-facing behavior
- Project page: implementation & working pattern
- Data format (data/project.json)
- How to add or update projects
- Accessibility details
- Debugging & troubleshooting
- Common customizations
- Files changed in this update
- Contributing & license

Overview

The site contains simple pages (Home, About, Projects, Contact). The Projects page loads project data from a JSON file, renders project cards, and provides category filter buttons that let visitors show only projects for a selected category.

Quick start (run locally)

1. Install a simple static server in the project root and run it. For example:
   - Python 3: `python -m http.server 8000`
   - Node: `npx http-server . -p 8000`
   - Or use VS Code Live Server.
2. Open `http://localhost:8000/project.html` in your browser.

Project structure (important files / folders)
- index.html — Home page
- about.html — About page
- project.html — Projects page (this is where the dynamic filtering happens)
- contact.html — Contact page (form integrated with EmailJS)
- assets/js/projects.js — JavaScript that fetches project data and implements filtering
- assets/images/ — sample images used by projects and pages
- data/project.json — JSON file containing the list of projects

Project page: user-facing behavior (what visitors see)
- The top of the page shows a row of filter buttons. The first button is "Show All" (active by default), followed by one button for each category found in the JSON.
- Clicking any category button hides non-matching projects and shows only items that belong to the chosen category.
- Each project card shows a title, description, image, and a button on the card:
  - If a project object has a `url` property, the card will show a "View Project" button that opens the link in a new tab.
  - If the project does not have a `url`, the card will show a disabled button labelled "Not available yet".
- If after filtering no project is visible, a friendly "No projects match this filter." message appears.
- A small note below the filter buttons will indicate how many of the currently visible projects are "not available yet" (i.e., have no `url`).

Project page: implementation & working pattern (technical)

This section explains how the Projects page works in code (useful if you want to customize behavior).

1. Data source
   - The list of projects is stored in `data/project.json` and must be a JSON array of project objects (see the Data format section below for details).

2. Initialization (assets/js/projects.js)
   - On DOMContentLoaded, the script fetches `data/project.json` using `fetch()`.
   - If the fetch fails, an error message is shown and a console error is printed.

3. Rendering projects (renderProjects)
   - For each project object the script creates a Bootstrap card inside a wrapping column (class `project-item`).
   - Each `.project-item` element gets these data attributes:
     - `data-category` — the project category string (original text is preserved; comparisons are done using a normalized lowercase trimmed value)
     - `data-has-url` — set to `true` or `false` depending on whether a `url` exists
   - Images are loaded from the `image` property if present. A fallback image is applied when the image fails to load.
   - The action button is:
     - An `<a>` link with `target="_blank"` and `rel="noopener noreferrer"` when `url` is present (text: "View Project").
     - A disabled `<button>` with `aria-disabled="true"` and title text when no `url` is present (text: "Not available yet").

4. Building filter buttons (buildFilterButtons)
   - The script collects unique category labels from the project list, preserving the display label but normalizing for comparisons.
   - A toolbar of buttons is created in `#filter-buttons`. The first button is "All" (active on load).
   - Each button gets a `data-filter` attribute containing the normalized category, and `aria-pressed` to reflect state.

5. Filtering behavior (button click handler)
   - When a filter button is clicked, the script:
     - Resets the style of all filter buttons and marks the clicked one as active (class `btn-primary`).
     - Iterates over all `.project-item` elements and compares their normalized `data-category` to the selected filter value.
     - Toggles visibility by adding/removing Bootstrap's `d-none` class on non-matching items.
     - Updates two helper UI items:
       - `filter-note` (a small note that says how many visible projects have no URL)
       - `no-results` message (if no project is visible after the filter)

6. Keyboard navigation and accessibility
   - Left/Right arrow keys are wired to simple previous/next page actions on the page.
   - The filter toolbar has `role="toolbar"` and each button uses `aria-pressed` to indicate its state.
   - The `filter-note` element uses `role="status"` with `aria-live="polite"` so screen readers are notified when it changes.

Data format (data/project.json)

Each project is an object with these recommended properties:

- name (string) — project title
- description (string) — short description
- image (string) — relative path to an image in `assets/images/` (optional)
- category (string) — category name used for filtering
- url (string) — optional; when present, used as the target for the "View Project" button

Example:

```json
{
  "name": "Project One",
  "description": "A web application built with HTML, CSS",
  "image": "assets/images/project1.png",
  "category": "Web Apps",
  "url": "https://phadecoh8.github.io/connecthubwebsite/"
}
```

How to add or update projects

1. Edit `data/project.json` and add a new project object to the array. Make sure the JSON file remains valid after your changes.
2. If you add an image path, place that image in `assets/images/`.
3. Refresh the page in the browser to see the new project and an automatically generated filter button (if the category is new).

Accessibility details

- Buttons and status messages include ARIA attributes (aria-pressed, aria-live, role=status) to help screen readers.
- The disabled "Not available yet" button is rendered with `aria-disabled="true"` and `title` text to communicate to users.
- Images should include descriptive `alt` text in the JSON data (the code sets a fallback alt when none is provided).
- Keep focus indicators visible and maintain keyboard navigation for all interactive elements.

Debugging & troubleshooting

- If buttons or projects don't appear, open DevTools (F12) and check the Console and Network tabs:
  - Network: check that `data/project.json` loaded (200 OK). A 404 indicates wrong path or static server misconfiguration.
  - Console: check for JS errors from `assets/js/projects.js`.
- If images fail to load, check the image paths and the Network tab for 404s.
- If EmailJS contact form fails, check that the EmailJS library loads and the service/template IDs in `contact.html` match your EmailJS account settings.

Common customizations

- Change link behavior: to open project links in the same tab, remove `link.target = '_blank'` (or set `link.target = '_self'`) in `renderProjects`.
- Change messages: edit the text for the disabled button or the filter note in `assets/js/projects.js` (`renderProjects`, `updateUnavailableNote`).
- Add animation: add CSS transitions and toggle a class instead of `d-none`, or use JavaScript to animate opacity/transform when showing/hiding.
- Add search: add a text input and filter items by name/description as the user types (small JS function that hides non-matching items).
- Deep linking: when a filter is chosen, update the URL query (e.g., `?category=data`) and read it on page load to apply the initial filter.

Files changed in this update
- index.html — improved hero layout, clearer CTAs and contact links
- about.html — improved layout for "What I do" (each item in its own column)
- project.html — replaced static content with dynamic containers (#filter-buttons and #items-container)
- contact.html — improved contact card, added EmailJS initialization guard and improved form behavior
- assets/js/projects.js — new beginner-friendly implementation for fetching data, rendering projects, creating filters and handling filtering and accessibility
- data/project.json — example projects with one project containing an external URL
- README.md — updated (this file)

Contributing

Contributions are welcome. Open an issue for discussion or send a pull request with a clear description of the change.

License

This repository is provided as-is for demonstration purposes; add a LICENSE file if you want a specific open-source license (MIT is common for personal portfolios).

If you'd like, I can add small code examples for the optional customizations (search box, fade animations, deep linking) or include screenshots and example unit tests. Which would you like me to add next?

