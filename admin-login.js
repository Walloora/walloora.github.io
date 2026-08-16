import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    auth
} from "./firebase.js";


const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");


loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        loginError.style.display = "none";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            window.location.href =
                "admin.html";


        } catch (error) {

            console.error(error);

            loginError.textContent =
                "Incorrect email or password.";

            loginError.style.display =
                "block";

        }

    }
);