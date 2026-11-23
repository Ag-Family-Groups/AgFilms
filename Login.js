import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
    createUserWithEmailAndPassword,
    getAdditionalUserInfo,
    getAuth,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
    doc,
    getFirestore,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("authForm");
const loginMode = document.getElementById("loginMode");
const signupMode = document.getElementById("signupMode");
const nameField = document.getElementById("nameField");
const displayNameInput = document.getElementById("displayName");
const passwordInput = document.getElementById("password");
const submitButton = document.getElementById("submitButton");
const submitLabel = document.getElementById("submitLabel");
const googleSignInButton = document.getElementById("googleSignInButton");
const googleButtonLabel = document.getElementById("googleButtonLabel");
const pageTitle = document.getElementById("pageTitle");
const formIntro = document.getElementById("formIntro");
const message = document.getElementById("authMessage");

let mode = "login";

function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("is-error", isError);
}

function getAuthErrorMessage(error) {
    const messages = {
        "auth/invalid-email": "Enter a valid email address.",
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/user-not-found": "No account was found for this email. Create an account first.",
        "auth/wrong-password": "The password is incorrect.",
        "auth/user-disabled": "This account is disabled. Contact the site administrator.",
        "auth/operation-not-allowed": "This sign-in provider is disabled in Firebase Authentication settings.",
        "auth/too-many-requests": "Too many attempts. Wait a while and try again.",
        "auth/network-request-failed": "Network request failed. Check your connection and try again.",
        "auth/email-already-in-use": "An account already uses this email. Sign in instead.",
        "auth/weak-password": "Choose a stronger password with at least 8 characters.",
        "auth/unauthorized-domain": "This website domain is not authorized in Firebase Authentication.",
        "auth/popup-closed-by-user": "The Google sign-in window was closed before finishing.",
        "auth/popup-blocked": "Allow popups for this site, then try Google sign-in again.",
        "auth/cancelled-popup-request": "A Google sign-in window is already open.",
        "auth/account-exists-with-different-credential": "This email already uses another sign-in method. Sign in with that method first."
    };

    return messages[error.code] || error.message || "Sign-in failed. Please try again.";
}

function setMode(nextMode) {
    mode = nextMode;
    const isSignup = mode === "signup";
    loginMode.classList.toggle("is-active", !isSignup);
    signupMode.classList.toggle("is-active", isSignup);
    loginMode.setAttribute("aria-pressed", String(!isSignup));
    signupMode.setAttribute("aria-pressed", String(isSignup));
    nameField.hidden = !isSignup;
    displayNameInput.required = isSignup;
    passwordInput.autocomplete = isSignup ? "new-password" : "current-password";
    passwordInput.minLength = isSignup ? 8 : 1;
    passwordInput.placeholder = isSignup ? "At least 8 characters" : "Enter your password";
    submitLabel.textContent = isSignup ? "Create account" : "Sign in";
    pageTitle.textContent = isSignup ? "Create your account" : "Welcome back";
    formIntro.textContent = isSignup
        ? "A few details and you’re ready to go."
        : "Sign in to continue to your account.";
    showMessage("");
}

function hasFirebaseConfig() {
    return Object.values(firebaseConfig).every((value) =>
        typeof value === "string" && value.length > 0 && !value.startsWith("YOUR_")
    );
}

loginMode.addEventListener("click", () => setMode("login"));
signupMode.addEventListener("click", () => setMode("signup"));

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage("");

    if (!hasFirebaseConfig()) {
        showMessage("Add your Firebase web app settings in firebase-config.js to enable sign-in.", true);
        return;
    }

    submitButton.disabled = true;
    googleSignInButton.disabled = true;
    submitLabel.textContent = mode === "signup" ? "Creating account…" : "Signing in…";

    let authenticated = false;
    try {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const email = document.getElementById("email").value.trim();
        const password = passwordInput.value;
        let user;
        let profileSyncFailed = false;

        if (mode === "signup") {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            user = credential.user;
            authenticated = true;
            const displayName = displayNameInput.value.trim();
            try {
                await updateProfile(user, { displayName });
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    displayName,
                    createdAt: serverTimestamp(),
                    lastLoginAt: serverTimestamp()
                });
            } catch (error) {
                profileSyncFailed = true;
                console.error("Account created, but the profile could not be saved:", error);
            }
        } else {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            user = credential.user;
            authenticated = true;
            try {
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    ...(user.displayName ? { displayName: user.displayName } : {}),
                    lastLoginAt: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                profileSyncFailed = true;
                console.error("Signed in, but the profile could not be updated:", error);
            }
        }

        showMessage(profileSyncFailed
            ? "Sign-in succeeded, but profile data could not sync. Opening your profile."
            : mode === "signup"
                ? "Account created and profile saved securely."
                : "You’re signed in. Your profile was updated.");
        form.reset();
        window.location.assign(profileSyncFailed ? "You.html?profile-sync=failed" : "You.html");
    } catch (error) {
        console.error("Firebase sign-in failed:", error);
        const detail = getAuthErrorMessage(error);
        showMessage(authenticated
            ? `You’re signed in, but your profile could not be saved: ${detail}`
            : detail, true);
    } finally {
        submitButton.disabled = false;
        googleSignInButton.disabled = false;
        submitLabel.textContent = mode === "signup" ? "Create account" : "Sign in";
    }
});

googleSignInButton.addEventListener("click", async () => {
    showMessage("");

    if (!hasFirebaseConfig()) {
        showMessage("Add your Firebase web app settings in firebase-config.js to enable sign-in.", true);
        return;
    }

    submitButton.disabled = true;
    googleSignInButton.disabled = true;
    googleButtonLabel.textContent = "Connecting to Google…";

    try {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const credential = await signInWithPopup(auth, new GoogleAuthProvider());
        const user = credential.user;
        let profileSyncFailed = false;

        try {
            const db = getFirestore(app);
            const profile = {
                email: user.email,
                ...(user.displayName ? { displayName: user.displayName } : {}),
                lastLoginAt: serverTimestamp()
            };

            if (getAdditionalUserInfo(credential)?.isNewUser) {
                profile.createdAt = serverTimestamp();
            }

            await setDoc(doc(db, "users", user.uid), profile, { merge: true });
        } catch (error) {
            profileSyncFailed = true;
            console.error("Google sign-in succeeded, but the profile could not be saved:", error);
        }

        window.location.assign(profileSyncFailed ? "You.html?profile-sync=failed" : "You.html");
    } catch (error) {
        console.error("Google sign-in failed:", error);
        showMessage(getAuthErrorMessage(error), true);
    } finally {
        submitButton.disabled = false;
        googleSignInButton.disabled = false;
        googleButtonLabel.textContent = "Continue with Google";
    }
});
