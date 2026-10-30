 
// SnapScape - Fetch and Render Images

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results");
const resultCount = document.getElementById("result-count");

if (!searchInput || !searchButton || !resultsContainer) {
    console.error("Check your HTML IDs: search-input, search-button, results");
} else {
    // Add the grid class automatically
    resultsContainer.classList.add("results-grid");

    // Search button
    searchButton.addEventListener("click", function (event) {
        event.preventDefault();
        searchImages();
    });

    // Press Enter to search
    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            searchImages();
        }
    });

    // Suggestion chips
    document.querySelectorAll(".chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
            searchInput.value = chip.dataset.query || chip.textContent.trim();
            searchImages();
        });
    });

    async function searchImages() {
        const query = searchInput.value.trim();

        if (!query) {
            searchInput.focus();
            return;
        }

        resultsContainer.innerHTML = "";
        if (resultCount) resultCount.textContent = "Searching...";

        searchButton.disabled = true;
        searchButton.textContent = "Searching...";

        const apiURL =
            "https://commons.wikimedia.org/w/api.php" +
            "?action=query" +
            "&generator=search" +
            "&gsrsearch=" + encodeURIComponent(query) +
            "&gsrnamespace=6" +
            "&gsrlimit=20" +
            "&prop=imageinfo" +
            "&iiprop=url" +
            "&iiurlwidth=500" +
            "&format=json" +
            "&origin=*";

        try {
            const response = await fetch(apiURL);

            if (!response.ok) {
                throw new Error("API request failed: " + response.status);
            }

            const data = await response.json();

            const pages = data.query && data.query.pages
                ? Object.values(data.query.pages)
                : [];

            displayImages(pages, query);

        } catch (error) {
            console.error("Image search error:", error);
            resultsContainer.textContent =
                "Unable to load images. Please try again.";

            if (resultCount) resultCount.textContent = "Search failed";

        } finally {
            searchButton.disabled = false;
            searchButton.textContent = "Search →";
        }
    }

    function displayImages(pages, query) {
        resultsContainer.innerHTML = "";
        // Force a proper responsive grid layout
        resultsContainer.style.display = "grid";
        resultsContainer.style.gridTemplateColumns ="repeat(auto-fill, minmax(230px, 1fr))";
        resultsContainer.style.gap = "24px";
        resultsContainer.style.width = "100%";
        resultsContainer.style.maxWidth = "100%";
        resultsContainer.style.boxSizing = "border-box";
        resultsContainer.style.alignItems = "start";

        const validImages = pages.filter(function (page) {
            return page.imageinfo &&
                page.imageinfo[0] &&
                (page.imageinfo[0].thumburl || page.imageinfo[0].url);
        });

        if (validImages.length === 0) {
            resultsContainer.textContent =
                "No images found. Try another search.";

            if (resultCount) resultCount.textContent = "0 images found";
            return;
        }

        validImages.forEach(function (page, index) {
            const info = page.imageinfo[0];

            // Create card
            const card = document.createElement("article");
            card.className = "image-card";
            card.style.width = "100%";
            card.style.minWidth = "0";
            card.style.overflow = "hidden";
            card.style.background = "#ffffff";
            card.style.borderRadius = "14px";
            card.style.border = "1px solid #e1e5dc";
            card.style.boxSizing = "border-box";

            // Create clickable image link
            const link = document.createElement("a");
            link.href = info.descriptionurl || info.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.className = "image-link";

            // Create image
            const image = document.createElement("img");
            image.src = info.thumburl || info.url;
            image.alt = query + " image " + (index + 1);
            image.loading = "lazy";
            image.style.display = "block";
            image.style.width = "100%";
            image.style.height = "220px";
            image.style.objectFit = "cover";

            // English caption
            const caption = document.createElement("p");
            caption.className = "image-caption";
            caption.textContent =
                query.charAt(0).toUpperCase() +
                query.slice(1) +
                " – Image " +
                (index + 1);

            link.appendChild(image);
            card.appendChild(link);
            card.appendChild(caption);
            resultsContainer.appendChild(card);
        });

        if (resultCount) {
            resultCount.textContent =
                validImages.length + " images found for " + query;
        }
    }
}
