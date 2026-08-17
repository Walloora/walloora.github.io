/* =========================================================
   WALLORA — MAIN JAVASCRIPT
   Firebase + Search + Filters + Sorting
   IMAGE + VIDEO WALLPAPER SUPPORT
   FIXED PAGE LOADER
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaD1QnKPohCoYQ8h3RvenvrrX8PilmmpN08",
    authDomain: "wallora-bb207.firebaseapp.com",
    projectId: "wallora-bb207",
    storageBucket: "wallora-bb207.firebasestorage.app",
    messagingSenderId: "11032501438",
    appId: "1:11032501438:web:27dad2fa92ed8a3d8dd2ef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================================================
   GLOBAL DATA
========================================================= */

let allWallpapers = [];

let currentFilter = "All";

let currentSearch = "";

let currentSort = "latest";


/* =========================================================
   PAGE LOADER
========================================================= */

function initPageLoader() {

    const pageLoader =
        document.getElementById("pageLoader");

    if (!pageLoader) {
        console.warn("Page loader element not found.");
        return;
    }

    /*
       Prevent the loader from getting stuck forever.

       Maximum loading time:
       8 seconds
    */

    let loaderHidden = false;

    const hideLoader = () => {

        if (loaderHidden) return;

        loaderHidden = true;

        pageLoader.classList.add("hidden");

        /*
           Completely remove it after transition.
        */

        setTimeout(() => {

            if (pageLoader && pageLoader.parentNode) {

                pageLoader.style.pointerEvents = "none";

            }

        }, 800);

    };


    /*
       Normal page load.
    */

    if (document.readyState === "complete") {

        setTimeout(hideLoader, 400);

    } else {

        window.addEventListener(
            "load",
            () => {

                setTimeout(
                    hideLoader,
                    400
                );

            },
            { once: true }
        );

    }


    /*
       IMPORTANT:
       Even if Firebase, image, video, font,
       or another resource gets stuck,
       the loader WILL disappear.
    */

    setTimeout(
        hideLoader,
        8000
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
           START LOADER
        */

        initPageLoader();


        /*
           INITIALIZE UI
        */

        initNavbar();

        initMobileMenu();

        initSearchOverlay();

        initHeroSearch();

        initSearchSuggestions();

        initFilters();

        initCategoryCards();

        initSorting();

        initLoadMore();

        initBackToTop();

        initActiveNavigation();


        /*
           LOAD FIREBASE DATA
        */

        await loadWallpapers();


        console.log(
            "WALLORA initialized successfully."
        );

    },
    { once: true }
);


/* =========================================================
   NAVBAR
========================================================= */

function initNavbar() {

    const navbar =
        document.getElementById("navbar");

    if (!navbar) return;


    const updateNavbar = () => {

        if (window.scrollY > 40) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    };


    updateNavbar();


    window.addEventListener(
        "scroll",
        updateNavbar,
        { passive: true }
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function initMobileMenu() {

    const mobileMenuBtn =
        document.getElementById(
            "mobileMenuBtn"
        );

    const mobileNav =
        document.getElementById(
            "mobileNav"
        );

    if (!mobileMenuBtn || !mobileNav)
        return;


    const icon =
        mobileMenuBtn.querySelector("i");


    mobileMenuBtn.addEventListener(
        "click",
        () => {

            const isOpen =
                mobileNav.classList.toggle(
                    "open"
                );


            if (isOpen) {

                icon?.classList.remove(
                    "fa-bars"
                );

                icon?.classList.add(
                    "fa-xmark"
                );

            } else {

                icon?.classList.remove(
                    "fa-xmark"
                );

                icon?.classList.add(
                    "fa-bars"
                );

            }

        }
    );


    mobileNav
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    mobileNav.classList.remove(
                        "open"
                    );

                    icon?.classList.remove(
                        "fa-xmark"
                    );

                    icon?.classList.add(
                        "fa-bars"
                    );

                }
            );

        });

}


/* =========================================================
   SEARCH OVERLAY
========================================================= */

function initSearchOverlay() {

    const searchOverlay =
        document.getElementById(
            "searchOverlay"
        );

    const openSearch =
        document.getElementById(
            "openSearch"
        );

    const closeSearch =
        document.getElementById(
            "closeSearch"
        );

    const globalSearch =
        document.getElementById(
            "globalSearch"
        );

    const clearSearch =
        document.getElementById(
            "clearSearch"
        );


    openSearch?.addEventListener(
        "click",
        () => {

            searchOverlay?.classList.add(
                "active"
            );

            setTimeout(() => {

                globalSearch?.focus();

            }, 200);

        }
    );


    closeSearch?.addEventListener(
        "click",
        () => {

            searchOverlay?.classList.remove(
                "active"
            );

        }
    );


    searchOverlay?.addEventListener(
        "click",
        event => {

            if (
                event.target === searchOverlay
            ) {

                searchOverlay.classList.remove(
                    "active"
                );

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                searchOverlay?.classList.remove(
                    "active"
                );

            }

        }
    );


    clearSearch?.addEventListener(
        "click",
        () => {

            if (!globalSearch) return;

            globalSearch.value = "";

            performSearch("");

            globalSearch.focus();

        }
    );


    globalSearch?.addEventListener(
        "input",
        () => {

            performSearch(
                globalSearch.value
            );

        }
    );

}


/* =========================================================
   HERO SEARCH
========================================================= */

function initHeroSearch() {

    const heroSearch =
        document.getElementById(
            "heroSearch"
        );

    const heroSearchButton =
        document.getElementById(
            "heroSearchButton"
        );


    function executeHeroSearch() {

        const value =
            heroSearch?.value.trim() || "";


        if (!value) {

            heroSearch?.focus();

            return;

        }


        performSearch(value);


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


    heroSearch?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                executeHeroSearch();

            }

        }
    );

}


/* =========================================================
   SEARCH SUGGESTIONS
========================================================= */

function initSearchSuggestions() {

    document
        .querySelectorAll("[data-search]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const value =
                        button.dataset.search || "";


                    const globalSearch =
                        document.getElementById(
                            "globalSearch"
                        );


                    if (globalSearch) {

                        globalSearch.value =
                            value;

                    }


                    performSearch(value);

                }
            );

        });


    document
        .querySelectorAll("[data-hero-search]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const value =
                        button.dataset.heroSearch || "";


                    const heroSearch =
                        document.getElementById(
                            "heroSearch"
                        );


                    if (heroSearch) {

                        heroSearch.value =
                            value;

                    }


                    performSearch(value);


                    document
                        .getElementById(
                            "wallpapers"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );

        });

}


/* =========================================================
   FILTERS
========================================================= */

function initFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter ||
                    "All";


                renderWallpapers();

            }
        );

    });

}


/* =========================================================
   CATEGORY CARDS
========================================================= */

function initCategoryCards() {

    document
        .querySelectorAll(".category-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const filter =
                        card.dataset.filter;


                    if (!filter) return;


                    const target =
                        document.querySelector(
                            `.filter-btn[data-filter="${CSS.escape(filter)}"]`
                        );


                    if (target) {

                        target.click();

                    }


                    document
                        .getElementById(
                            "wallpapers"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );

        });

}


/* =========================================================
   SORTING
========================================================= */

function initSorting() {

    const sortWallpapers =
        document.getElementById(
            "sortWallpapers"
        );


    if (!sortWallpapers) return;


    currentSort =
        sortWallpapers.value ||
        "latest";


    sortWallpapers.addEventListener(
        "change",
        () => {

            currentSort =
                sortWallpapers.value ||
                "latest";


            renderWallpapers();

        }
    );

}


/* =========================================================
   LOAD MORE
========================================================= */

function initLoadMore() {

    const loadMoreButton =
        document.querySelector(
            ".load-more-btn"
        );


    if (!loadMoreButton) return;


    loadMoreButton.addEventListener(
        "click",
        () => {

            loadMoreButton.innerHTML = `
                Loading
                <i class="fa-solid fa-spinner fa-spin"></i>
            `;


            loadMoreButton.disabled = true;


            setTimeout(() => {

                loadMoreButton.innerHTML = `
                    All wallpapers loaded
                    <i class="fa-solid fa-check"></i>
                `;

            }, 500);

        }
    );

}


/* =========================================================
   BACK TO TOP
========================================================= */

function initBackToTop() {

    const backToTop =
        document.getElementById(
            "backToTop"
        );


    if (!backToTop) return;


    const updateBackToTop = () => {

        if (window.scrollY > 600) {

            backToTop.classList.add(
                "show"
            );

        } else {

            backToTop.classList.remove(
                "show"
            );

        }

    };


    updateBackToTop();


    window.addEventListener(
        "scroll",
        updateBackToTop,
        { passive: true }
    );


    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

function initActiveNavigation() {

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


    const navLinks =
        document.querySelectorAll(
            ".desktop-nav .nav-link"
        );


    if (
        !sections.length ||
        !navLinks.length
    ) {

        return;

    }


    if (
        !("IntersectionObserver" in window)
    ) {

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting)
                        return;


                    navLinks.forEach(link => {

                        link.classList.remove(
                            "active"
                        );

                    });


                    const activeLink =
                        document.querySelector(
                            `.desktop-nav a[href="#${CSS.escape(entry.target.id)}"]`
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


    sections.forEach(section => {

        observer.observe(section);

    });

}


/* =========================================================
   FIRESTORE — LOAD WALLPAPERS
========================================================= */

async function loadWallpapers() {

    const grid =
        document.getElementById(
            "wallpaperGrid"
        );


    if (!grid) {

        console.warn(
            "Wallpaper grid not found."
        );

        return;

    }


    try {

        const wallpapersRef =
            collection(
                db,
                "wallpapers"
            );


        let snapshot;


        /*
           Try newest wallpapers first.
        */

        try {

            snapshot =
                await getDocs(
                    query(
                        wallpapersRef,
                        orderBy(
                            "createdAt",
                            "desc"
                        )
                    )
                );

        } catch (error) {

            console.warn(
                "createdAt ordering failed. Loading without ordering.",
                error
            );


            snapshot =
                await getDocs(
                    wallpapersRef
                );

        }


        allWallpapers =
            snapshot.docs.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );


        /*
           Local sorting.
        */

        allWallpapers.sort(
            (a, b) =>
                getTime(b.createdAt) -
                getTime(a.createdAt)
        );


        console.log(
            "Wallpapers loaded:",
            allWallpapers.length
        );


        renderWallpapers();

        updateWallpaperCount();


    } catch (error) {

        console.error(
            "Could not load wallpapers:",
            error
        );


        grid.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:60px 20px;
                color:#777;
            ">

                <i
                    class="fa-solid fa-triangle-exclamation"
                    style="
                        font-size:30px;
                        margin-bottom:15px;
                    "
                ></i>

                <p>
                    Could not load wallpapers.
                </p>

                <small>
                    Please check your Firebase
                    configuration and Firestore
                    permissions.
                </small>

            </div>

        `;

    }

}


/* =========================================================
   RENDER WALLPAPERS
========================================================= */

function renderWallpapers() {

    const grid =
        document.getElementById(
            "wallpaperGrid"
        );


    if (!grid) return;


    let wallpapers =
        [...allWallpapers];


    /*
       SEARCH
    */

    if (currentSearch) {

        wallpapers =
            wallpapers.filter(
                wallpaper =>
                    wallpaperMatches(
                        wallpaper,
                        currentSearch
                    )
            );

    }


    /*
       FILTER
    */

    if (currentFilter !== "All") {

        wallpapers =
            wallpapers.filter(
                wallpaper =>
                    wallpaperMatches(
                        wallpaper,
                        currentFilter
                    )
            );

    }


    /*
       SORT
    */

    switch (currentSort) {

        case "popular":

            wallpapers.sort(
                (a, b) =>
                    Number(b.views || 0) -
                    Number(a.views || 0)
            );

            break;


        case "downloads":

            wallpapers.sort(
                (a, b) =>
                    Number(b.downloads || 0) -
                    Number(a.downloads || 0)
            );

            break;


        case "latest":
        default:

            wallpapers.sort(
                (a, b) =>
                    getTime(b.createdAt) -
                    getTime(a.createdAt)
            );

            break;

    }


    /*
       EMPTY
    */

    if (!wallpapers.length) {

        grid.innerHTML = `

            <div style="
                grid-column:1/-1;
                padding:70px 20px;
                text-align:center;
                color:#777;
            ">

                <i
                    class="fa-solid fa-face-frown"
                    style="
                        font-size:35px;
                        margin-bottom:15px;
                    "
                ></i>

                <h3 style="
                    color:white;
                    margin-bottom:8px;
                ">
                    No wallpapers found
                </h3>

                <p>
                    Try another search or filter.
                </p>

            </div>

        `;

        return;

    }


    /*
       CREATE CARDS
    */

    grid.innerHTML =
        wallpapers
            .map(createWallpaperCard)
            .join("");


    attachCardEvents();

}


/* =========================================================
   WALLPAPER MATCHING
========================================================= */

function wallpaperMatches(
    wallpaper,
    query
) {

    if (!query) return true;


    const normalizedQuery =
        String(query)
            .toLowerCase()
            .trim();


    if (!normalizedQuery) return true;


    const searchable = [

        wallpaper.title,

        wallpaper.name,

        wallpaper.category,

        wallpaper.quality,

        wallpaper.description,

        wallpaper.type,

        wallpaper.videoUrl,

        wallpaper.imageUrl,

        ...(Array.isArray(wallpaper.tags)
            ? wallpaper.tags
            : []),

        wallpaper.bright
            ? "bright"
            : "",

        wallpaper.dark
            ? "dark"
            : "",

        wallpaper.aura
            ? "aura"
            : "",

        wallpaper.trending
            ? "trending"
            : "",

        wallpaper.featured
            ? "featured"
            : ""

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


    return searchable.includes(
        normalizedQuery
    );

}


/* =========================================================
   MEDIA TYPE DETECTION
========================================================= */

function isVideoWallpaper(wallpaper) {

    const type =
        String(
            wallpaper.type || ""
        )
            .toLowerCase()
            .trim();


    if (type === "video") {

        return true;

    }


    if (
        wallpaper.videoUrl &&
        String(
            wallpaper.videoUrl
        ).trim()
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   CREATE WALLPAPER CARD
========================================================= */

function createWallpaperCard(
    wallpaper
) {

    const tags =
        Array.isArray(wallpaper.tags)
            ? wallpaper.tags
            : [];


    const tagText =
        tags
            .filter(Boolean)
            .join(" • ");


    const quality =
        wallpaper.quality ||
        "HD";


    const isVideo =
        isVideoWallpaper(
            wallpaper
        );


    const imageUrl =
        String(
            wallpaper.imageUrl || ""
        ).trim();


    const videoUrl =
        String(
            wallpaper.videoUrl || ""
        ).trim();


    const title =
        wallpaper.title ||
        wallpaper.name ||
        "Untitled Wallpaper";


    const category =
        wallpaper.category ||
        "Wallpaper";


    let mediaHTML = "";


    /*
       VIDEO
    */

    if (isVideo && videoUrl) {

        mediaHTML = `

            <video
                class="wallpaper-media wallpaper-video"
                src="${escapeHTML(videoUrl)}"
                ${
                    imageUrl
                    ? `poster="${escapeHTML(imageUrl)}"`
                    : ""
                }
                muted
                loop
                playsinline
                preload="metadata"
            ></video>

        `;

    }


    /*
       IMAGE
    */

    else {

        mediaHTML = `

            <img
                class="wallpaper-media wallpaper-image-source"
                src="${escapeHTML(imageUrl)}"
                alt="${escapeHTML(title)}"
                loading="lazy"
                decoding="async"
                onerror="this.style.display='none';"
            >

        `;

    }


    return `

        <article
            class="wallpaper-card"
            data-id="${escapeHTML(
                wallpaper.id || ""
            )}"
            data-type="${
                isVideo
                    ? "video"
                    : "image"
            }"
            data-tags="${escapeHTML(
                [
                    category,
                    quality,
                    wallpaper.type || "",
                    ...tags,
                    wallpaper.bright
                        ? "Bright"
                        : "",
                    wallpaper.dark
                        ? "Dark"
                        : "",
                    wallpaper.aura
                        ? "Aura"
                        : "",
                    wallpaper.trending
                        ? "Trending"
                        : "",
                    wallpaper.featured
                        ? "Featured"
                        : ""
                ]
                    .filter(Boolean)
                    .join(" ")
            )}"
            data-popular="${Number(
                wallpaper.views || 0
            )}"
            data-downloads="${Number(
                wallpaper.downloads || 0
            )}"
        >

            <div class="wallpaper-image">

                ${mediaHTML}


                <div class="card-overlay"></div>


                <span class="quality-badge">
                    ${escapeHTML(quality)}
                </span>


                ${
                    isVideo
                    ? `
                        <span
                            class="media-type-badge"
                            aria-label="Video wallpaper"
                        >
                            <i class="fa-solid fa-video"></i>
                            VIDEO
                        </span>
                    `
                    : ""
                }


                <button
                    class="favorite-btn"
                    aria-label="Add to favorites"
                    type="button"
                >
                    <i class="fa-regular fa-heart"></i>
                </button>


                <div class="card-actions">

                    <button
                        type="button"
                        class="view-wallpaper"
                        aria-label="View wallpaper"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>


                    <button
                        type="button"
                        class="download-wallpaper"
                        aria-label="Download wallpaper"
                    >
                        <i class="fa-solid fa-download"></i>
                    </button>

                </div>


                ${
                    isVideo
                    ? `
                        <button
                            type="button"
                            class="video-play-button"
                            aria-label="Play video"
                        >
                            <i class="fa-solid fa-play"></i>
                        </button>
                    `
                    : ""
                }

            </div>


            <div class="wallpaper-info">

                <div>

                    <h3>
                        ${escapeHTML(title)}
                    </h3>


                    <span>

                        ${escapeHTML(category)}

                        ${
                            tagText
                            ? " • " +
                              escapeHTML(tagText)
                            : ""
                        }

                    </span>

                </div>


                <button
                    class="quick-download"
                    type="button"
                    aria-label="Download wallpaper"
                >
                    <i class="fa-solid fa-arrow-down"></i>
                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   CARD EVENTS
========================================================= */

function attachCardEvents() {

    /*
       FAVORITES
    */

    document
        .querySelectorAll(".favorite-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    const card =
                        button.closest(
                            ".wallpaper-card"
                        );


                    const id =
                        card?.dataset.id;


                    const icon =
                        button.querySelector("i");


                    button.classList.toggle(
                        "liked"
                    );


                    const liked =
                        button.classList.contains(
                            "liked"
                        );


                    if (liked) {

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


                    if (id) {

                        saveFavorite(
                            id,
                            liked
                        );

                    }

                }
            );

        });


    restoreFavorites();


    /*
       VIEW
    */

    document
        .querySelectorAll(".view-wallpaper")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    const card =
                        button.closest(
                            ".wallpaper-card"
                        );


                    if (!card) return;


                    const video =
                        card.querySelector(
                            ".wallpaper-video"
                        );


                    const image =
                        card.querySelector(
                            ".wallpaper-image-source"
                        );


                    if (video) {

                        toggleVideo(video);

                        return;

                    }


                    if (image?.src) {

                        window.open(
                            image.src,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    }

                }
            );

        });


    /*
       VIDEO PLAY
    */

    document
        .querySelectorAll(
            ".video-play-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    const card =
                        button.closest(
                            ".wallpaper-card"
                        );


                    const video =
                        card?.querySelector(
                            ".wallpaper-video"
                        );


                    if (!video) return;


                    toggleVideo(video);

                }
            );

        });


    /*
       VIDEO EVENTS
    */

    document
        .querySelectorAll(
            ".wallpaper-video"
        )
        .forEach(video => {

            video.addEventListener(
                "play",
                () => {

                    updateVideoButton(
                        video,
                        true
                    );

                }
            );


            video.addEventListener(
                "pause",
                () => {

                    updateVideoButton(
                        video,
                        false
                    );

                }
            );


            video.addEventListener(
                "ended",
                () => {

                    updateVideoButton(
                        video,
                        false
                    );

                }
            );

        });


    /*
       DOWNLOAD
    */

    document
        .querySelectorAll(
            ".download-wallpaper, .quick-download"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    const card =
                        button.closest(
                            ".wallpaper-card"
                        );


                    if (!card) return;


                    const video =
                        card.querySelector(
                            ".wallpaper-video"
                        );


                    if (
                        video?.currentSrc ||
                        video?.src
                    ) {

                        downloadMedia(
                            video.currentSrc ||
                            video.src,
                            card.dataset.id,
                            "video"
                        );

                        return;

                    }


                    const image =
                        card.querySelector(
                            ".wallpaper-image-source"
                        );


                    if (image?.src) {

                        downloadMedia(
                            image.currentSrc ||
                            image.src,
                            card.dataset.id,
                            "image"
                        );

                    }

                }
            );

        });

}


/* =========================================================
   VIDEO TOGGLE
========================================================= */

function toggleVideo(video) {

    if (!video) return;


    if (video.paused) {

        video.play().catch(
            error => {

                console.warn(
                    "Video could not play:",
                    error
                );

            }
        );

    } else {

        video.pause();

    }

}


/* =========================================================
   UPDATE VIDEO BUTTON
========================================================= */

function updateVideoButton(
    video,
    playing
) {

    const card =
        video.closest(
            ".wallpaper-card"
        );


    const button =
        card?.querySelector(
            ".video-play-button"
        );


    if (!button) return;


    button.innerHTML =
        playing
        ? `
            <i class="fa-solid fa-pause"></i>
        `
        : `
            <i class="fa-solid fa-play"></i>
        `;

}


/* =========================================================
   DOWNLOAD MEDIA
========================================================= */

function downloadMedia(
    url,
    id,
    type
) {

    if (!url) return;


    const link =
        document.createElement("a");


    link.href = url;

    link.target = "_blank";

    link.rel = "noopener";


    const extension =
        type === "video"
            ? "mp4"
            : "jpg";


    link.download =
        `wallora-${id || "wallpaper"}.${extension}`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();

}


/* =========================================================
   FAVORITES — LOCAL STORAGE
========================================================= */

function getFavorites() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "walloraFavorites"
            )
        ) || [];

    } catch {

        return [];

    }

}


/* =========================================================
   SAVE FAVORITE
========================================================= */

function saveFavorite(
    id,
    liked
) {

    if (!id) return;


    let favorites =
        getFavorites();


    if (liked) {

        if (!favorites.includes(id)) {

            favorites.push(id);

        }

    } else {

        favorites =
            favorites.filter(
                favoriteId =>
                    favoriteId !== id
            );

    }


    try {

        localStorage.setItem(
            "walloraFavorites",
            JSON.stringify(favorites)
        );

    } catch (error) {

        console.warn(
            "Could not save favorite:",
            error
        );

    }

}


/* =========================================================
   RESTORE FAVORITES
========================================================= */

function restoreFavorites() {

    const favorites =
        getFavorites();


    if (!favorites.length) return;


    document
        .querySelectorAll(
            ".wallpaper-card"
        )
        .forEach(card => {

            const id =
                card.dataset.id;


            if (
                !id ||
                !favorites.includes(id)
            ) {

                return;

            }


            const button =
                card.querySelector(
                    ".favorite-btn"
                );


            const icon =
                button?.querySelector("i");


            button?.classList.add(
                "liked"
            );


            icon?.classList.remove(
                "fa-regular"
            );


            icon?.classList.add(
                "fa-solid"
            );

        });

}


/* =========================================================
   SEARCH
========================================================= */

function performSearch(
    query
) {

    currentSearch =
        String(query || "")
            .trim()
            .toLowerCase();


    renderWallpapers();


    const preview =
        document.getElementById(
            "searchResultsPreview"
        );


    if (!preview) return;


    if (!currentSearch) {

        preview.innerHTML = `

            <div class="empty-search">

                <i class="fa-solid fa-wand-magic-sparkles"></i>

                <p>
                    Start typing to discover wallpapers.
                </p>

            </div>

        `;

        return;

    }


    const results =
        allWallpapers.filter(
            wallpaper =>
                wallpaperMatches(
                    wallpaper,
                    currentSearch
                )
        );


    if (!results.length) {

        preview.innerHTML = `

            <div class="empty-search">

                <i class="fa-solid fa-face-frown"></i>

                <p>
                    No wallpapers found for
                    "${escapeHTML(currentSearch)}"
                </p>

            </div>

        `;

        return;

    }


    preview.innerHTML = `

        <div class="search-result-heading">

            <strong>
                ${results.length}
                wallpaper${results.length === 1 ? "" : "s"}
                found
            </strong>

            <span>
                for "${escapeHTML(currentSearch)}"
            </span>

        </div>

    `;

}


/* =========================================================
   WALLPAPER COUNT
========================================================= */

function updateWallpaperCount() {

    const count =
        document.getElementById(
            "wallpaperCount"
        );


    if (!count) return;


    const total =
        allWallpapers.length;


    if (total >= 1000) {

        count.textContent =
            `${Math.floor(total / 1000)}K+`;

    } else {

        count.textContent =
            total.toString();

    }

}


/* =========================================================
   FIREBASE TIMESTAMP / DATE
========================================================= */

function getTime(value) {

    if (!value) return 0;


    /*
       Firestore Timestamp
    */

    if (
        typeof value === "object" &&
        typeof value.toMillis === "function"
    ) {

        return value.toMillis();

    }


    /*
       Firestore timestamp object
    */

    if (
        typeof value === "object" &&
        typeof value.seconds === "number"
    ) {

        return (
            value.seconds * 1000
        );

    }


    /*
       JavaScript Date
    */

    if (value instanceof Date) {

        return value.getTime();

    }


    /*
       String / number
    */

    const time =
        new Date(value).getTime();


    return Number.isNaN(time)
        ? 0
        : time;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text ?? "";


    return div.innerHTML;

}
