/* =========================================================
   WALLORA — MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PAGE LOADER
    ===================================================== */

    const pageLoader = document.getElementById("pageLoader");

    window.addEventListener("load", () => {
        setTimeout(() => {
            pageLoader?.classList.add("hidden");
        }, 500);
    });


    /* =====================================================
       NAVBAR
    ===================================================== */

    const navbar = document.getElementById("navbar");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {
            navbar?.classList.add("scrolled");
        } else {
            navbar?.classList.remove("scrolled");
        }

    });


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileNav = document.getElementById("mobileNav");

    mobileMenuBtn?.addEventListener("click", () => {

        mobileNav?.classList.toggle("open");

        const icon = mobileMenuBtn.querySelector("i");

        if (mobileNav?.classList.contains("open")) {
            icon?.classList.remove("fa-bars");
            icon?.classList.add("fa-xmark");
        } else {
            icon?.classList.remove("fa-xmark");
            icon?.classList.add("fa-bars");
        }

    });


    /* Close mobile menu after clicking link */

    mobileNav?.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            mobileNav.classList.remove("open");

            const icon = mobileMenuBtn?.querySelector("i");

            icon?.classList.remove("fa-xmark");
            icon?.classList.add("fa-bars");

        });

    });


    /* =====================================================
       SEARCH OVERLAY
    ===================================================== */

    const searchOverlay = document.getElementById("searchOverlay");
    const openSearch = document.getElementById("openSearch");
    const closeSearch = document.getElementById("closeSearch");
    const globalSearch = document.getElementById("globalSearch");
    const clearSearch = document.getElementById("clearSearch");

    openSearch?.addEventListener("click", () => {

        searchOverlay?.classList.add("active");

        setTimeout(() => {
            globalSearch?.focus();
        }, 200);

    });


    closeSearch?.addEventListener("click", () => {
        searchOverlay?.classList.remove("active");
    });


    searchOverlay?.addEventListener("click", (e) => {

        if (e.target === searchOverlay) {
            searchOverlay.classList.remove("active");
        }

    });


    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {
            searchOverlay?.classList.remove("active");
        }

    });


    clearSearch?.addEventListener("click", () => {

        if (globalSearch) {
            globalSearch.value = "";
            performSearch("");
            globalSearch.focus();
        }

    });


    /* =====================================================
       WALLPAPER SEARCH ENGINE
    ===================================================== */

    const wallpaperGrid = document.getElementById("wallpaperGrid");
    const searchResultsPreview =
        document.getElementById("searchResultsPreview");

    function getWallpaperCards() {

        return Array.from(
            document.querySelectorAll(".wallpaper-card")
        );

    }


    function wallpaperMatches(card, query) {

        if (!query) return true;

        const searchText = (

            (card.querySelector("h3")?.textContent || "") +
            " " +
            (card.querySelector(".wallpaper-info span")?.textContent || "") +
            " " +
            (card.dataset.tags || "")

        ).toLowerCase();

        return searchText.includes(query.toLowerCase());

    }


    function performSearch(query) {

        const cards = getWallpaperCards();

        query = query.trim().toLowerCase();


        if (!query) {

            cards.forEach(card => {
                card.style.display = "";
            });

            if (searchResultsPreview) {

                searchResultsPreview.innerHTML = `
                    <div class="empty-search">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                        <p>Start typing to discover wallpapers.</p>
                    </div>
                `;

            }

            return;

        }


        const results = cards.filter(card =>
            wallpaperMatches(card, query)
        );


        /* Homepage results */

        cards.forEach(card => {

            card.style.display =
                wallpaperMatches(card, query)
                    ? ""
                    : "none";

        });


        /* Search preview */

        if (!searchResultsPreview) return;


        if (results.length === 0) {

            searchResultsPreview.innerHTML = `
                <div class="empty-search">
                    <i class="fa-solid fa-face-frown"></i>
                    <p>No wallpapers found for "${escapeHTML(query)}"</p>
                </div>
            `;

            return;
        }


        searchResultsPreview.innerHTML = `

            <div class="search-result-heading">

                <strong>
                    ${results.length}
                    wallpaper${results.length === 1 ? "" : "s"}
                    found
                </strong>

                <span>
                    for "${escapeHTML(query)}"
                </span>

            </div>

        `;

    }


    globalSearch?.addEventListener("input", () => {

        performSearch(globalSearch.value);

    });


    /* =====================================================
       HERO SEARCH
    ===================================================== */

    const heroSearch = document.getElementById("heroSearch");
    const heroSearchButton =
        document.getElementById("heroSearchButton");


    function executeHeroSearch() {

        const query = heroSearch?.value.trim();

        if (!query) return;

        performSearch(query);

        document
            .getElementById("wallpapers")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }


    heroSearchButton?.addEventListener(
        "click",
        executeHeroSearch
    );


    heroSearch?.addEventListener("keydown", e => {

        if (e.key === "Enter") {
            executeHeroSearch();
        }

    });


    /* =====================================================
       SEARCH SUGGESTIONS
    ===================================================== */

    document.querySelectorAll("[data-search]").forEach(button => {

        button.addEventListener("click", () => {

            const value = button.dataset.search;

            if (globalSearch) {
                globalSearch.value = value;
            }

            performSearch(value);

        });

    });


    document.querySelectorAll("[data-hero-search]").forEach(button => {

        button.addEventListener("click", () => {

            const value = button.dataset.heroSearch;

            if (heroSearch) {
                heroSearch.value = value;
            }

            performSearch(value);

            document
                .getElementById("wallpapers")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        });

    });


    /* =====================================================
       FILTER SYSTEM
    ===================================================== */

    const filterButtons =
        document.querySelectorAll(".filter-btn");


    function applyFilter(filter) {

        const cards = getWallpaperCards();

        cards.forEach(card => {

            const tags =
                (card.dataset.tags || "").toLowerCase();

            if (
                filter === "All" ||
                tags.includes(filter.toLowerCase())
            ) {

                card.style.display = "";

            } else {

                card.style.display = "none";

            }

        });

    }


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            const filter =
                button.dataset.filter || "All";

            applyFilter(filter);

        });

    });


    /* =====================================================
       CATEGORY CARDS
    ===================================================== */

    document
        .querySelectorAll(".category-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                const filter =
                    card.dataset.filter;

                const targetButton =
                    document.querySelector(
                        `.filter-btn[data-filter="${filter}"]`
                    );

                targetButton?.click();

                document
                    .getElementById("wallpapers")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            });

        });


    /* =====================================================
       SORTING
    ===================================================== */

    const sortWallpapers =
        document.getElementById("sortWallpapers");


    sortWallpapers?.addEventListener("change", () => {

        const value = sortWallpapers.value;

        const cards = getWallpaperCards();

        if (value === "latest") {

            cards.reverse();

        }

        else if (value === "popular") {

            cards.sort((a, b) => {

                const aValue =
                    Number(a.dataset.popular || 0);

                const bValue =
                    Number(b.dataset.popular || 0);

                return bValue - aValue;

            });

        }

        else if (value === "downloads") {

            cards.sort((a, b) => {

                const aValue =
                    Number(a.dataset.downloads || 0);

                const bValue =
                    Number(b.dataset.downloads || 0);

                return bValue - aValue;

            });

        }


        cards.forEach(card => {
            wallpaperGrid?.appendChild(card);
        });

    });


    /* =====================================================
       LOAD MORE
    ===================================================== */

    const loadMoreButton =
        document.querySelector(".load-more-btn");


    loadMoreButton?.addEventListener("click", () => {

        loadMoreButton.innerHTML = `
            Loading
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;


        setTimeout(() => {

            loadMoreButton.innerHTML = `
                No more demo wallpapers
                <i class="fa-solid fa-check"></i>
            `;

            loadMoreButton.disabled = true;

        }, 800);

    });


    /* =====================================================
       FAVORITES
    ===================================================== */

    document
        .querySelectorAll(".favorite-btn")
        .forEach(button => {

            button.addEventListener("click", e => {

                e.preventDefault();
                e.stopPropagation();

                const icon =
                    button.querySelector("i");

                button.classList.toggle("liked");

                if (
                    button.classList.contains("liked")
                ) {

                    icon?.classList.remove(
                        "fa-regular"
                    );

                    icon?.classList.add(
                        "fa-solid"
                    );

                } else {

                    icon?.classList.remove(
                        "fa-solid"
                    );

                    icon?.classList.add(
                        "fa-regular"
                    );

                }

            });

        });


    /* =====================================================
       DOWNLOAD BUTTONS
    ===================================================== */

    document
        .querySelectorAll(
            ".quick-download, .card-actions button"
        )
        .forEach(button => {

            button.addEventListener("click", e => {

                e.preventDefault();
                e.stopPropagation();

                const card =
                    button.closest(".wallpaper-card");

                const image =
                    card?.querySelector("img");

                if (!image) return;


                /* Open image for now.
                   Later we will connect the real
                   download system/database. */

                window.open(
                    image.src,
                    "_blank"
                );

            });

        });


    /* =====================================================
       VIEW BUTTONS
    ===================================================== */

    document
        .querySelectorAll(".card-actions button")
        .forEach(button => {

            const icon =
                button.querySelector("i");

            if (
                icon?.classList.contains("fa-eye")
            ) {

                button.addEventListener(
                    "click",
                    e => {

                        e.preventDefault();
                        e.stopPropagation();

                        const card =
                            button.closest(
                                ".wallpaper-card"
                            );

                        const image =
                            card?.querySelector("img");

                        if (image) {
                            window.open(
                                image.src,
                                "_blank"
                            );
                        }

                    }
                );

            }

        });


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backToTop =
        document.getElementById("backToTop");


    window.addEventListener("scroll", () => {

        if (window.scrollY > 600) {

            backToTop?.classList.add("show");

        } else {

            backToTop?.classList.remove("show");

        }

    });


    backToTop?.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections =
        document.querySelectorAll("main section[id]");

    const navLinks =
        document.querySelectorAll(
            ".desktop-nav .nav-link"
        );


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting)
                        return;

                    navLinks.forEach(link =>
                        link.classList.remove(
                            "active"
                        )
                    );

                    const activeLink =
                        document.querySelector(
                            `.desktop-nav a[href="#${entry.target.id}"]`
                        );

                    activeLink?.classList.add(
                        "active"
                    );

                });

            },
            {
                threshold: 0.35
            }
        );


    sections.forEach(section =>
        observer.observe(section)
    );


    console.log(
        "WALLORA initialized successfully."
    );

});