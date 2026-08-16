import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


/* =========================================================
   ELEMENTS
========================================================= */

const form = document.getElementById("wallpaperForm");

const imageUrl = document.getElementById("imageUrl");
const title = document.getElementById("title");
const category = document.getElementById("category");
const quality = document.getElementById("quality");
const tags = document.getElementById("tags");
const description = document.getElementById("description");

const bright = document.getElementById("bright");
const dark = document.getElementById("dark");
const aura = document.getElementById("aura");
const trending = document.getElementById("trending");
const featured = document.getElementById("featured");

const previewButton = document.getElementById("previewButton");

const previewImage = document.getElementById("previewImage");
const previewPlaceholder =
    document.getElementById("previewPlaceholder");

const previewTitle =
    document.getElementById("previewTitle");

const previewMeta =
    document.getElementById("previewMeta");


/* =========================================================
   AUTHENTICATION GUARD
========================================================= */

onAuthStateChanged(auth, user => {

    if (!user) {

        window.location.href = "admin-login.html";

        return;
    }

    console.log(
        "Admin authenticated:",
        user.email
    );

    loadWallpapers();

});


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function updatePreview() {

    const url = imageUrl.value.trim();

    previewTitle.textContent =
        title.value.trim() ||
        "Wallpaper Title";

    previewMeta.textContent =
        `${category.value} • ${quality.value}`;


    if (!url) {

        previewImage.style.display = "none";

        previewPlaceholder.style.display = "grid";

        return;
    }


    previewImage.src = url;

    previewImage.style.display = "block";

    previewPlaceholder.style.display = "none";


    previewImage.onerror = () => {

        previewImage.style.display = "none";

        previewPlaceholder.style.display = "grid";

        previewPlaceholder.innerHTML = `
            <div>
                <i class="fa-solid fa-triangle-exclamation"></i>
                <br>
                Image URL could not be loaded.
            </div>
        `;

    };


    previewImage.onload = () => {

        previewImage.style.display = "block";

        previewPlaceholder.style.display = "none";

    };

}


previewButton.addEventListener(
    "click",
    updatePreview
);


imageUrl.addEventListener(
    "input",
    updatePreview
);


title.addEventListener(
    "input",
    () => {

        previewTitle.textContent =
            title.value.trim() ||
            "Wallpaper Title";

    }
);


category.addEventListener(
    "change",
    updatePreview
);


quality.addEventListener(
    "change",
    updatePreview
);


/* =========================================================
   ADD WALLPAPER
========================================================= */

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const user = auth.currentUser;

        if (!user) {

            alert(
                "Your admin session has expired."
            );

            window.location.href =
                "admin-login.html";

            return;
        }


        const wallpaper = {

            title:
                title.value.trim(),

            imageUrl:
                imageUrl.value.trim(),

            category:
                category.value,

            quality:
                quality.value,

            tags:
                tags.value
                    .split(",")
                    .map(tag =>
                        tag.trim().toLowerCase()
                    )
                    .filter(Boolean),

            description:
                description.value.trim(),

            bright:
                bright.checked,

            dark:
                dark.checked,

            aura:
                aura.checked,

            trending:
                trending.checked,

            featured:
                featured.checked,

            downloads: 0,

            views: 0,

            createdAt:
                serverTimestamp(),

            createdBy:
                user.uid

        };


        try {

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled = true;

            submitButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Adding...
            `;


            await addDoc(
                collection(
                    db,
                    "wallpapers"
                ),
                wallpaper
            );


            alert(
                "Wallpaper added successfully!"
            );


            form.reset();


            previewImage.style.display =
                "none";

            previewPlaceholder.style.display =
                "grid";

            previewPlaceholder.innerHTML = `
                <div>
                    <i class="fa-regular fa-image"></i>
                    <br>
                    Paste an image URL and click Preview.
                </div>
            `;


            previewTitle.textContent =
                "Wallpaper Title";


            previewMeta.textContent =
                "Category • Quality";


            await loadWallpapers();


        } catch (error) {

            console.error(
                "Add wallpaper error:",
                error
            );


            alert(
                "Could not add wallpaper.\n\n" +
                error.message
            );


        } finally {

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled = false;

            submitButton.innerHTML = `
                <i class="fa-solid fa-plus"></i>
                Add Wallpaper
            `;

        }

    }
);


/* =========================================================
   LOAD WALLPAPERS
========================================================= */

async function loadWallpapers() {

    try {

        const wallpaperQuery = query(
            collection(
                db,
                "wallpapers"
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );


        const snapshot =
            await getDocs(
                wallpaperQuery
            );


        const wallpapers =
            snapshot.docs.map(
                document => ({

                    id: document.id,

                    ...document.data()

                })
            );


        updateStats(
            wallpapers
        );


        renderWallpaperList(
            wallpapers
        );


    } catch (error) {

        console.error(
            "Loading wallpapers failed:",
            error
        );


        /*
         * This can happen if Firestore does not
         * yet have the required index.
         */

        try {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "wallpapers"
                    )
                );


            const wallpapers =
                snapshot.docs.map(
                    document => ({

                        id: document.id,

                        ...document.data()

                    })
                );


            updateStats(
                wallpapers
            );


            renderWallpaperList(
                wallpapers
            );


        } catch (secondError) {

            console.error(
                secondError
            );

        }

    }

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStats(
    wallpapers
) {

    document.getElementById(
        "totalWallpapers"
    ).textContent =
        wallpapers.length;


    document.getElementById(
        "fourKCount"
    ).textContent =
        wallpapers.filter(
            wallpaper =>
                wallpaper.quality === "4K"
        ).length;


    document.getElementById(
        "animeCount"
    ).textContent =
        wallpapers.filter(
            wallpaper =>
                wallpaper.category === "Anime"
        ).length;


    document.getElementById(
        "carsCount"
    ).textContent =
        wallpapers.filter(
            wallpaper =>
                wallpaper.category === "Cars"
        ).length;

}


/* =========================================================
   WALLPAPER MANAGEMENT AREA
========================================================= */

function renderWallpaperList(
    wallpapers
) {

    let container =
        document.getElementById(
            "wallpaperList"
        );


    /*
     * Your current admin.html doesn't contain
     * this element yet.
     *
     * We create it automatically so the existing
     * panel doesn't break.
     */

    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.id =
            "wallpaperList";

        container.style.marginTop =
            "30px";


        const main =
            document.querySelector(
                ".main"
            );


        main.appendChild(
            container
        );

    }


    if (!wallpapers.length) {

        container.innerHTML = `
            <div class="panel">
                <div style="
                    text-align:center;
                    color:#858b9a;
                    padding:30px;
                ">
                    <i
                        class="fa-regular fa-images"
                        style="
                            font-size:30px;
                            margin-bottom:12px;
                        "
                    ></i>

                    <p>
                        No wallpapers added yet.
                    </p>
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML = `

        <div class="panel">

            <div class="panel-header">

                <div>

                    <h2>
                        Your Wallpapers
                    </h2>

                    <span>
                        ${wallpapers.length}
                        wallpaper(s)
                    </span>

                </div>

            </div>


            <div style="
                display:grid;
                grid-template-columns:
                    repeat(auto-fill,minmax(180px,1fr));
                gap:15px;
            ">

                ${wallpapers.map(
                    wallpaper => `

                    <article
                        style="
                            overflow:hidden;
                            background:#12151d;
                            border:1px solid rgba(255,255,255,.08);
                            border-radius:12px;
                        "
                    >

                        <img
                            src="${escapeHtml(
                                wallpaper.imageUrl || ""
                            )}"
                            alt="${escapeHtml(
                                wallpaper.title || ""
                            )}"
                            style="
                                width:100%;
                                height:180px;
                                object-fit:cover;
                                display:block;
                            "
                            loading="lazy"
                        >

                        <div style="
                            padding:13px;
                        ">

                            <strong style="
                                display:block;
                                margin-bottom:5px;
                            ">
                                ${escapeHtml(
                                    wallpaper.title || "Untitled"
                                )}
                            </strong>

                            <span style="
                                color:#858b9a;
                                font-size:11px;
                            ">
                                ${escapeHtml(
                                    wallpaper.category || ""
                                )}
                                •
                                ${escapeHtml(
                                    wallpaper.quality || ""
                                )}
                            </span>

                            <button
                                class="delete-wallpaper"
                                data-id="${wallpaper.id}"
                                style="
                                    width:100%;
                                    margin-top:12px;
                                    padding:9px;
                                    border:1px solid rgba(255,77,103,.2);
                                    border-radius:8px;
                                    background:rgba(255,77,103,.08);
                                    color:#ff7285;
                                    cursor:pointer;
                                "
                            >
                                <i class="fa-solid fa-trash"></i>
                                Delete
                            </button>

                        </div>

                    </article>

                `
                ).join("")}

            </div>

        </div>

    `;


    container
        .querySelectorAll(
            ".delete-wallpaper"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteWallpaper(
                        button.dataset.id
                    );

                }
            );

        });

}


/* =========================================================
   DELETE WALLPAPER
========================================================= */

async function deleteWallpaper(
    wallpaperId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this wallpaper?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "wallpapers",
                wallpaperId
            )
        );


        alert(
            "Wallpaper deleted."
        );


        await loadWallpapers();


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Could not delete wallpaper.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );

                window.location.href =
                    "admin-login.html";

            } catch (error) {

                console.error(
                    error
                );

                alert(
                    "Logout failed."
                );

            }

        }
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}