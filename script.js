/* =========================================================
   WALLORA — MAIN JAVASCRIPT
   Firebase + Search + Filters + Sorting
   IMAGE + VIDEO WALLPAPER SUPPORT
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
    apiKey: "AIzaSyD1QnKPohCoYQ8h3RvenvrrX8PilmmpN08",
    authDomain: "wallora-bb207.firebaseapp.com",
    projectId: "wallora-bb207",
    storageBucket: "wallora-bb207.firebasestorage.app",
    messagingSenderId: "11032501438",
    appId: "1:11032501438:web:27dad2fa92ed8a3d8dd2ef"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =========================================================
   GLOBAL WALLPAPER DATA
========================================================= */

let allWallpapers = [];

let currentFilter = "All";

let currentSearch = "";


/* =========================================================
   PAGE START
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       PAGE LOADER
    ===================================================== */

    const pageLoader =
        document.getElementById("pageLoader");


    window.addEventListener("load", () => {

        setTimeout(() => {

            pageLoader?.classList.add("hidden");

        }, 500);

    });


    /* =====================================================
       NAVBAR
    ===================================================== */

    const navbar =
        document.getElementById("navbar");


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

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const mobileNav =
        document.getElementById("mobileNav");


    mobileMenuBtn?.addEventListener(
        "click",
        () => {

            mobileNav?.classList.toggle("open");


            const icon =
                mobileMenuBtn.querySelector("i");


            if (
                mobileNav?.classList.contains("open")
            ) {

                icon?.classList.remove("fa-bars");

                icon?.classList.add("fa-xmark");

            } else {

                icon?.classList.remove("fa-xmark");

                icon?.classList.add("fa-bars");

            }

        }
    );


    mobileNav?.querySelectorAll("a")
        .forEach(link => {

            link.addEventListener("click", () => {

                mobileNav.classList.remove("open");


                const icon =
                    mobileMenuBtn?.querySelector("i");


                icon?.classList.remove("fa-xmark");

                icon?.classList.add("fa-bars");

            });

        });


    /* =====================================================
       SEARCH OVERLAY
    ===================================================== */

    const searchOverlay =
        document.getElementById("searchOverlay");

    const openSearch =
        document.getElementById("openSearch");

    const closeSearch =
        document.getElementById("closeSearch");

    const globalSearch =
        document.getElementById("globalSearch");

    const clearSearch =
        document.getElementById("clearSearch");


    openSearch?.addEventListener("click", () => {

        searchOverlay?.classList.add("active");


        setTimeout(() => {

            globalSearch?.focus();

        }, 200);

    });


    closeSearch?.addEventListener("click", () => {

        searchOverlay?.classList.remove("active");

    });


    searchOverlay?.addEventListener("click", e => {

        if (e.target === searchOverlay) {

            searchOverlay.classList.remove("active");

        }

    });


    document.addEventListener("keydown", e => {

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
       LOAD FIRESTORE WALLPAPERS
    ===================================================== */

    await loadWallpapers();


    /* =====================================================
       SEARCH
    ===================================================== */

    globalSearch?.addEventListener("input", () => {

        performSearch(
            globalSearch.value
        );

    });


    /* =====================================================
       HERO SEARCH
    ===================================================== */

    const heroSearch =
        document.getElementById("heroSearch");

    const heroSearchButton =
        document.getElementById(
            "heroSearchButton"
        );


    function executeHeroSearch() {

        const value =
            heroSearch?.value.trim();


        if (!value) return;


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
        e => {

            if (e.key === "Enter") {

                executeHeroSearch();

            }

        }
    );


    /* =====================================================
       SEARCH SUGGESTIONS
    ===================================================== */

    document
        .querySelectorAll("[data-search]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const value =
                        button.dataset.search;


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
                        button.dataset.heroSearch;


                    if (heroSearch) {

                        heroSearch.value =
                            value;

                    }


                    performSearch(value);


                    document
                        .getElementById("wallpapers")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );

        });


    /* =====================================================
       FILTERS
    ===================================================== */

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


    /* =====================================================
       CATEGORY CARDS
    ===================================================== */

    document
        .querySelectorAll(".category-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const filter =
                        card.dataset.filter;


                    const target =
                        document.querySelector(
                            `.filter-btn[data-filter="${filter}"]`
                        );


                    target?.click();


                    document
                        .getElementById("wallpapers")
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );

        });


    /* =====================================================
       SORTING
    ===================================================== */

    const sortWallpapers =
        document.getElementById(
            "sortWallpapers"
        );


    sortWallpapers?.addEventListener(
        "change",
        () => {

            renderWallpapers();

        }
    );


    /* =====================================================
       LOAD MORE
    ===================================================== */

    const loadMoreButton =
        document.querySelector(
            ".load-more-btn"
        );


    loadMoreButton?.addEventListener(
        "click",
        () => {

            loadMoreButton.innerHTML = `
                Loading
                <i class="fa-solid fa-spinner fa-spin"></i>
            `;


            setTimeout(() => {

                loadMoreButton.innerHTML = `
                    All wallpapers loaded
                    <i class="fa-solid fa-check"></i>
                `;


                loadMoreButton.disabled = true;

            }, 500);

        }
    );


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const backToTop =
        document.getElementById(
            "backToTop"
        );


    window.addEventListener(
        "scroll",
        () => {

            if (window.scrollY > 600) {

                backToTop?.classList.add(
                    "show"
                );

            } else {

                backToTop?.classList.remove(
                    "show"
                );

            }

        }
    );


    backToTop?.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    const sections =
        document.querySelectorAll(
            "main section[id]"
        );


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

/* =========================================================
   FIRESTORE — LOAD WALLPAPERS
========================================================= */

async function loadWallpapers() {

    const grid =
        document.getElementById(
            "wallpaperGrid"
        );


    if (!grid) return;


    try {

        const wallpapersRef =
            collection(
                db,
                "wallpapers"
            );


        let snapshot;


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
                "Ordering failed. Loading without order.",
                error
            );


            snapshot =
                await getDocs(
                    wallpapersRef
                );

        }


        allWallpapers =
            snapshot.docs.map(doc => ({

                id: doc.id,

                ...doc.data()

            }));


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
                    Please check your Firebase configuration
                    and Firestore permissions.
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


    /* =====================================================
       SEARCH
    ===================================================== */

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


    /* =====================================================
       FILTER
    ===================================================== */

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


    /* =====================================================
       SORT
    ===================================================== */

    const sort =
        document.getElementById(
            "sortWallpapers"
        )?.value || "latest";


    if (sort === "latest") {

        wallpapers.sort(
            (a, b) =>
                getTime(b.createdAt) -
                getTime(a.createdAt)
        );

    }


    if (sort === "popular") {

        wallpapers.sort(
            (a, b) =>
                Number(b.views || 0) -
                Number(a.views || 0)
        );

    }


    if (sort === "downloads") {

        wallpapers.sort(
            (a, b) =>
                Number(b.downloads || 0) -
                Number(a.downloads || 0)
        );

    }


    /* =====================================================
       EMPTY RESULT
    ===================================================== */

    if (wallpapers.length === 0) {

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


    /* =====================================================
       CREATE CARDS
    ===================================================== */

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


    query =
        query
            .toLowerCase()
            .trim();


    const searchable = [

        wallpaper.title,

        wallpaper.category,

        wallpaper.quality,

        wallpaper.description,

        wallpaper.type,

        wallpaper.videoUrl,

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
        .join(" ")
        .toLowerCase();


    return searchable.includes(query);

}


/* =========================================================
   MEDIA TYPE DETECTION
========================================================= */

function isVideoWallpaper(wallpaper) {

    /*
       The admin panel will save:

       type: "image"

       OR

       type: "video"

       So we check that first.
    */

    if (
        String(wallpaper.type || "")
            .toLowerCase() === "video"
    ) {

        return true;

    }


    /*
       Backup detection:
       If a video URL exists, treat it as video.
    */

    if (
        wallpaper.videoUrl &&
        String(wallpaper.videoUrl).trim()
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
        tags.join(" • ");


    const quality =
        wallpaper.quality || "HD";


    const isVideo =
        isVideoWallpaper(
            wallpaper
        );


    /*
       IMAGE URL
    */

    const imageUrl =
        wallpaper.imageUrl || "";


    /*
       VIDEO URL
    */

    const videoUrl =
        wallpaper.videoUrl || "";


    /*
       MEDIA ELEMENT

       IMAGE:
       normal <img>

       VIDEO:
       <video> with controls
    */

    let mediaHTML = "";


    if (isVideo) {

        mediaHTML = `

            <video
                class="wallpaper-media wallpaper-video"
                src="${escapeHTML(videoUrl)}"
                poster="${escapeHTML(imageUrl)}"
                muted
                loop
                playsinline
                preload="metadata"
            ></video>

        `;

    } else {

        mediaHTML = `

            <img
                class="wallpaper-media wallpaper-image-source"
                src="${escapeHTML(imageUrl)}"
                alt="${escapeHTML(
                    wallpaper.title ||
                    "Wallpaper"
                )}"
                loading="lazy"
            >

        `;

    }


    return `

        <article
            class="wallpaper-card"
            data-type="${isVideo ? "video" : "image"}"
            data-tags="${escapeHTML(
                [
                    wallpaper.category,
                    wallpaper.quality,
                    wallpaper.type || "",
                    ...tags,
                    wallpaper.bright ? "Bright" : "",
                    wallpaper.dark ? "Dark" : "",
                    wallpaper.aura ? "Aura" : "",
                    wallpaper.trending ? "Trending" : "",
                    wallpaper.featured ? "Featured" : ""
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
                            style="
                                position:absolute;
                                left:12px;
                                top:12px;
                                z-index:5;
                                padding:5px 9px;
                                border-radius:20px;
                                background:rgba(0,0,0,.65);
                                color:#fff;
                                font-size:10px;
                                font-weight:700;
                                backdrop-filter:blur(8px);
                            "
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
                            style="
                                position:absolute;
                                left:50%;
                                top:50%;
                                transform:translate(-50%,-50%);
                                width:55px;
                                height:55px;
                                border:1px solid rgba(255,255,255,.35);
                                border-radius:50%;
                                background:rgba(0,0,0,.55);
                                color:white;
                                display:grid;
                                place-items:center;
                                z-index:6;
                                backdrop-filter:blur(10px);
                            "
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
                        ${escapeHTML(
                            wallpaper.title ||
                            "Untitled Wallpaper"
                        )}
                    </h3>


                    <span>

                        ${escapeHTML(
                            wallpaper.category ||
                            "Wallpaper"
                        )}

                        ${tagText
                            ? " • " +
                              escapeHTML(tagText)
                            : ""}

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

    /* =====================================================
       FAVORITES
    ===================================================== */

    document
        .querySelectorAll(".favorite-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                e => {

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

                }
            );

        });


    /* =====================================================
       VIEW WALLPAPER / VIDEO
    ===================================================== */

    document
        .querySelectorAll(".view-wallpaper")
        .forEach(button => {

            button.addEventListener(
                "click",
                e => {

                    e.preventDefault();
                    e.stopPropagation();

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


                    /*
                       VIDEO
                    */

                    if (video) {

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

                        return;

                    }


                    /*
                       IMAGE
                    */

                    if (image?.src) {

                        window.open(
                            image.src,
                            "_blank"
                        );

                    }

                }
            );

        });


    /* =====================================================
       VIDEO PLAY BUTTON
    ===================================================== */

    document
        .querySelectorAll(".video-play-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                e => {

                    e.preventDefault();
                    e.stopPropagation();


                    const card =
                        button.closest(
                            ".wallpaper-card"
                        );


                    const video =
                        card?.querySelector(
                            ".wallpaper-video"
                        );


                    if (!video) return;


                    if (video.paused) {

                        video.play().catch(
                            error => {

                                console.warn(
                                    "Video play failed:",
                                    error
                                );

                            }
                        );


                        button.innerHTML = `
                            <i class="fa-solid fa-pause"></i>
                        `;

                    } else {

                        video.pause();


                        button.innerHTML = `
                            <i class="fa-solid fa-play"></i>
                        `;

                    }

                }
            );

        });


    /* =====================================================
       VIDEO PLAY / PAUSE STATE
    ===================================================== */

    document
        .querySelectorAll(".wallpaper-video")
        .forEach(video => {

            video.addEventListener(
                "play",
                () => {

                    const card =
                        video.closest(
                            ".wallpaper-card"
                        );

                    const button =
                        card?.querySelector(
                            ".video-play-button"
                        );

                    if (button) {

                        button.innerHTML = `
                            <i class="fa-solid fa-pause"></i>
                        `;

                    }

                }
            );


            video.addEventListener(
                "pause",
                () => {

                    const card =
                        video.closest(
                            ".wallpaper-card"
                        );

                    const button =
                        card?.querySelector(
                            ".video-play-button"
                        );

                    if (button) {

                        button.innerHTML = `
                            <i class="fa-solid fa-play"></i>
                        `;

                    }

                }
            );

        });


    /* =====================================================
       DOWNLOAD
    ===================================================== */

    document
        .querySelectorAll(
            ".download-wallpaper, .quick-download"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                e => {

                    e.preventDefault();
                    e.stopPropagation();


                    const card =
                        button.closest(
                            ".wallpaper-card"
                        );


                    if (!card) return;


                    /*
                       VIDEO DOWNLOAD
                    */

                    const video =
                        card.querySelector(
                            ".wallpaper-video"
                        );


                    if (video?.src) {

                        const link =
                            document.createElement(
                                "a"
                            );

                        link.href =
                            video.src;

                        link.target =
                            "_blank";

                        link.rel =
                            "noopener";

                        link.download =
                            "";


                        document.body.appendChild(
                            link
                        );

                        link.click();


                        link.remove();

                        return;

                    }


                    /*
                       IMAGE DOWNLOAD
                    */

                    const image =
                        card.querySelector(
                            ".wallpaper-image-source"
                        );


                    if (!image?.src) return;


                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        image.src;

                    link.target =
                        "_blank";

                    link.rel =
                        "noopener";

                    link.download =
                        "";


                    document.body.appendChild(
                        link
                    );

                    link.click();


                    link.remove();

                }
            );

        });

}


/* =========================================================
   SEARCH
========================================================= */

function performSearch(query) {

    currentSearch =
        query
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


    if (results.length === 0) {

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
   TIME
========================================================= */

function getTime(value) {

    if (!value) return 0;


    if (
        typeof value === "object" &&
        value.seconds
    ) {

        return value.seconds * 1000;

    }


    const time =
        new Date(value).getTime();


    return isNaN(time)
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
