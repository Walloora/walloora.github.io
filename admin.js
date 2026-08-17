import { db, auth } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
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
const previewVideo = document.getElementById("previewVideo");

const previewPlaceholder =
    document.getElementById("previewPlaceholder");

const previewTitle =
    document.getElementById("previewTitle");

const previewMeta =
    document.getElementById("previewMeta");

const mediaImage =
    document.getElementById("mediaImage");

const mediaVideo =
    document.getElementById("mediaVideo");

const mediaUrlLabel =
    document.getElementById("mediaUrlLabel");

const mediaUrlHelp =
    document.getElementById("mediaUrlHelp");


/* =========================================================
   CURRENT MEDIA TYPE
========================================================= */

function getMediaType() {

    if (mediaVideo?.checked) {
        return "video";
    }

    return "image";
}


/* =========================================================
   AUTHENTICATION GUARD
========================================================= */

onAuthStateChanged(auth, user => {

    if (!user) {

        window.location.href =
            "admin-login.html";

        return;
    }


    console.log(
        "Admin authenticated:",
        user.email
    );


    loadWallpapers();

});


/* =========================================================
   MEDIA TYPE UI
========================================================= */

function updateMediaTypeUI() {

    const type =
        getMediaType();


    if (type === "video") {

        mediaUrlLabel.textContent =
            "Video URL";

        imageUrl.placeholder =
            "https://example.com/video.mp4";

        mediaUrlHelp.textContent =
            "Paste a direct, publicly accessible video URL. MP4 is recommended.";

        previewImage.style.display =
            "none";

        previewImage.removeAttribute(
            "src"
        );

        previewVideo.pause();

        previewVideo.removeAttribute(
            "src"
        );

        previewVideo.load();

        previewVideo.style.display =
            "none";

        previewPlaceholder.style.display =
            "grid";

        previewPlaceholder.innerHTML = `
            <div>
                <i class="fa-solid fa-video"></i>
                <br>
                Paste a video URL and click Preview.
            </div>
        `;

    } else {

        mediaUrlLabel.textContent =
            "Image URL";

        imageUrl.placeholder =
            "https://example.com/image.jpg";

        mediaUrlHelp.textContent =
            "Paste the direct URL of the image. The image must be publicly accessible.";

        previewVideo.pause();

        previewVideo.removeAttribute(
            "src"
        );

        previewVideo.load();

        previewVideo.style.display =
            "none";

        previewImage.removeAttribute(
            "src"
        );

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

    }


    updatePreviewMeta();

}


mediaImage?.addEventListener(
    "change",
    updateMediaTypeUI
);


mediaVideo?.addEventListener(
    "change",
    updateMediaTypeUI
);


/* =========================================================
   PREVIEW META
========================================================= */

function updatePreviewMeta() {

    const type =
        getMediaType();

    const typeText =
        type === "video"
            ? "Video"
            : "Image";


    previewTitle.textContent =
        title.value.trim() ||
        "Wallpaper Title";


    previewMeta.textContent =
        `${typeText} • ${category.value} • ${quality.value}`;

}


/* =========================================================
   IMAGE / VIDEO PREVIEW
========================================================= */

function updatePreview() {

    const url =
        imageUrl.value.trim();

    const type =
        getMediaType();


    updatePreviewMeta();


    if (!url) {

        previewImage.style.display =
            "none";

        previewVideo.style.display =
            "none";

        previewPlaceholder.style.display =
            "grid";

        if (type === "video") {

            previewPlaceholder.innerHTML = `
                <div>
                    <i class="fa-solid fa-video"></i>
                    <br>
                    Paste a video URL and click Preview.
                </div>
            `;

        } else {

            previewPlaceholder.innerHTML = `
                <div>
                    <i class="fa-regular fa-image"></i>
                    <br>
                    Paste an image URL and click Preview.
                </div>
            `;

        }

        return;
    }


    /* =====================================================
       VIDEO
    ===================================================== */

    if (type === "video") {

        previewImage.style.display =
            "none";

        previewImage.removeAttribute(
            "src"
        );


        previewVideo.style.display =
            "block";

        previewPlaceholder.style.display =
            "none";


        previewVideo.src =
            url;


        previewVideo.load();


        previewVideo.onerror = () => {

            previewVideo.style.display =
                "none";

            previewPlaceholder.style.display =
                "grid";

            previewPlaceholder.innerHTML = `
                <div>
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <br>
                    Video URL could not be loaded.
                    <br>
                    <small>
                        Make sure this is a direct video URL.
                    </small>
                </div>
            `;

        };


        previewVideo.onloadeddata = () => {

            previewVideo.style.display =
                "block";

            previewPlaceholder.style.display =
                "none";

        };


        return;
    }


    /* =====================================================
       IMAGE
    ===================================================== */

    previewVideo.pause();

    previewVideo.removeAttribute(
        "src"
    );

    previewVideo.load();

    previewVideo.style.display =
        "none";


    previewImage.style.display =
        "block";

    previewPlaceholder.style.display =
        "none";


    previewImage.src =
        url;


    previewImage.onerror = () => {

        previewImage.style.display =
            "none";

        previewPlaceholder.style.display =
            "grid";

        previewPlaceholder.innerHTML = `
            <div>
                <i class="fa-solid fa-triangle-exclamation"></i>
                <br>
                Image URL could not be loaded.
            </div>
        `;

    };


    previewImage.onload = () => {

        previewImage.style.display =
            "block";

        previewPlaceholder.style.display =
            "none";

    };

}


previewButton?.addEventListener(
    "click",
    updatePreview
);


imageUrl?.addEventListener(
    "input",
    updatePreview
);


title?.addEventListener(
    "input",
    updatePreviewMeta
);


category?.addEventListener(
    "change",
    updatePreviewMeta
);


quality?.addEventListener(
    "change",
    updatePreviewMeta
);


/* =========================================================
   FORM RESET
========================================================= */

form?.addEventListener(
    "reset",
    () => {

        setTimeout(() => {

            if (mediaImage) {
                mediaImage.checked = true;
            }

            updateMediaTypeUI();

            previewImage.removeAttribute(
                "src"
            );

            previewImage.style.display =
                "none";


            previewVideo.pause();

            previewVideo.removeAttribute(
                "src"
            );

            previewVideo.load();

            previewVideo.style.display =
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
                "Image • Category • Quality";

        }, 0);

    }
);


/* =========================================================
   ADD WALLPAPER / VIDEO
========================================================= */

form?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const user =
            auth.currentUser;


        if (!user) {

            alert(
                "Your admin session has expired."
            );


            window.location.href =
                "admin-login.html";


            return;

        }


        const type =
            getMediaType();


        const url =
            imageUrl.value.trim();


        if (!url) {

            alert(
                `Please enter a ${type === "video" ? "video" : "image"} URL.`
            );


            return;

        }


        const wallpaper = {

            /*
             * IMPORTANT
             * "mediaType" tells the homepage
             * whether this is an image or video.
             */

            mediaType:
                type,


            /*
             * Keep imageUrl so the existing
             * WALLORA structure remains compatible.
             */

            imageUrl:
                url,


            /*
             * Also save mediaUrl for clarity
             * and future development.
             */

            mediaUrl:
                url,


            title:
                title.value.trim(),


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


            downloads:
                0,


            views:
                0,


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


            submitButton.disabled =
                true;


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
                type === "video"
                    ? "Video added successfully!"
                    : "Wallpaper added successfully!"
            );


            form.reset();


            /*
             * Reset to image mode.
             */

            if (mediaImage) {
                mediaImage.checked = true;
            }


            updateMediaTypeUI();


            /*
             * Clear preview.
             */

            previewImage.removeAttribute(
                "src"
            );

            previewImage.style.display =
                "none";


            previewVideo.pause();

            previewVideo.removeAttribute(
                "src"
            );

            previewVideo.load();

            previewVideo.style.display =
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
                "Image • Category • Quality";


            await loadWallpapers();


        } catch (error) {

            console.error(
                "Add media error:",
                error
            );


            alert(
                "Could not add media.\n\n" +
                error.message
            );


        } finally {

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    false;


                submitButton.innerHTML = `
                    <i class="fa-solid fa-plus"></i>
                    Add Media
                `;

            }

        }

    }
);


/* =========================================================
   LOAD WALLPAPERS / VIDEOS
========================================================= */

async function loadWallpapers() {

    try {

        const wallpaperQuery =
            query(
                collection(
                    db,
                    "wallpapers"
                ),

                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        let snapshot;


        try {

            snapshot =
                await getDocs(
                    wallpaperQuery
                );

        } catch (error) {

            console.warn(
                "Ordered query failed. Loading without order.",
                error
            );


            snapshot =
                await getDocs(
                    collection(
                        db,
                        "wallpapers"
                    )
                );

        }


        const wallpapers =
            snapshot.docs.map(
                document => ({

                    id:
                        document.id,

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
        wallpapers.filter(
            wallpaper =>
                (wallpaper.mediaType || "image") ===
                "image"
        ).length;


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
   WALLPAPER / VIDEO MANAGEMENT
========================================================= */

function renderWallpaperList(
    wallpapers
) {

    let container =
        document.getElementById(
            "wallpaperList"
        );


    if (!container) {

        return;

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
                        No media added yet.
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
                        Your Media
                    </h2>

                    <span>
                        ${wallpapers.length}
                        item(s)
                    </span>

                </div>

            </div>


            <div class="management-grid">

                ${wallpapers.map(
                    wallpaper =>
                        createManagementCard(
                            wallpaper
                        )
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
   MANAGEMENT CARD
========================================================= */

function createManagementCard(
    wallpaper
) {

    const type =
        wallpaper.mediaType ||
        "image";


    const url =
        wallpaper.mediaUrl ||
        wallpaper.imageUrl ||
        "";


    let mediaHTML;


    if (type === "video") {

        mediaHTML = `

            <video
                src="${escapeHtml(url)}"
                controls
                muted
                preload="metadata"
            ></video>

        `;

    } else {

        mediaHTML = `

            <img
                src="${escapeHtml(url)}"
                alt="${escapeHtml(
                    wallpaper.title ||
                    "Wallpaper"
                )}"
                loading="lazy"
            >

        `;

    }


    return `

        <article class="media-card">

            ${mediaHTML}


            <div class="media-card-info">

                <strong>
                    ${escapeHtml(
                        wallpaper.title ||
                        "Untitled"
                    )}
                </strong>


                <span>

                    ${type === "video"
                        ? "Video"
                        : "Wallpaper"}

                    •
                    ${escapeHtml(
                        wallpaper.category ||
                        ""
                    )}

                    •
                    ${escapeHtml(
                        wallpaper.quality ||
                        ""
                    )}

                </span>


                <button
                    class="delete-wallpaper"
                    data-id="${escapeHtml(
                        wallpaper.id
                    )}"
                    type="button"
                >

                    <i class="fa-solid fa-trash"></i>

                    Delete

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   DELETE WALLPAPER / VIDEO
========================================================= */

async function deleteWallpaper(
    wallpaperId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this item?"
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
            "Media deleted successfully."
        );


        await loadWallpapers();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Could not delete media.\n\n" +
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

    return String(value ?? "")

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


/* =========================================================
   INITIAL UI
========================================================= */

updateMediaTypeUI();
