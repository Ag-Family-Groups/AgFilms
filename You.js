import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const profileStatus = document.getElementById("profileStatus");
const signedOutView = document.getElementById("signedOutView");
const signedInView = document.getElementById("signedInView");
const profileError = document.getElementById("profileError");
const signOutButton = document.getElementById("signOutButton");
const profileSyncFailed = new URLSearchParams(location.search).get("profile-sync") === "failed";
let profileLoadSequence = 0;

function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every((value) =>
    typeof value === "string" && value.length > 0 && !value.startsWith("YOUR_")
  );
}

function showSignedOut(message) {
  profileStatus.textContent = message;
  signedOutView.hidden = false;
  signedInView.hidden = true;
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

if (!isFirebaseConfigured()) {
  showSignedOut("Set up Firebase to load your profile.");
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  onAuthStateChanged(auth, async (user) => {
    const loadSequence = ++profileLoadSequence;
    profileError.hidden = true;

    if (!user) {
      showSignedOut("You’re signed out.");
      return;
    }

    profileStatus.textContent = "Loading your account profile…";
    signedOutView.hidden = true;
    signedInView.hidden = false;
    signOutButton.disabled = false;

    const fallbackName = user.displayName || user.email?.split("@")[0] || "AgFilms member";
    const fallbackEmail = user.email || "Email unavailable";
    document.getElementById("profileName").textContent = fallbackName;
    document.getElementById("profileEmail").textContent = fallbackEmail;
    document.getElementById("profileEmailDetail").textContent = fallbackEmail;
    document.getElementById("profileAvatar").textContent =
      fallbackName.trim().charAt(0).toUpperCase() || "A";
    document.getElementById("profileCreatedAt").textContent =
      formatDate(user.metadata.creationTime);
    profileStatus.textContent = "You’re signed in to your account.";

    if (profileSyncFailed) {
      profileError.textContent =
        "You’re signed in, but Firestore could not sync the profile. Check that the database exists and firestore.rules are deployed.";
      profileError.hidden = false;
    }

    try {
      const profileSnapshot = await getDoc(doc(db, "users", user.uid));
      if (loadSequence !== profileLoadSequence) return;

      const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
      const name = profile.displayName || fallbackName;
      const email = profile.email || fallbackEmail;
      const initial = name.trim().charAt(0) || email.charAt(0) || "A";

      document.getElementById("profileName").textContent = name;
      document.getElementById("profileEmail").textContent = email;
      document.getElementById("profileEmailDetail").textContent = email;
      document.getElementById("profileAvatar").textContent = initial.toUpperCase();
      document.getElementById("profileCreatedAt").textContent = formatDate(
        profile.createdAt || user.metadata.creationTime
      );

    } catch (error) {
      if (loadSequence !== profileLoadSequence) return;
      console.error("Could not load the account profile:", error);
      profileError.textContent = profileSyncFailed
        ? "You’re signed in, but Firestore could not sync the profile. Check that the database exists and firestore.rules are deployed."
        : `Your Firebase account is shown, but the Firestore profile could not load: ${error.message || "Please check Firestore settings."}`;
      profileError.hidden = false;
      profileStatus.textContent = "You’re signed in to your account.";
    }
  });

  signOutButton.addEventListener("click", async () => {
    signOutButton.disabled = true;
    profileStatus.textContent = "Signing out…";

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Could not sign out:", error);
      profileError.textContent = error.message || "Sign out failed. Please try again.";
      profileError.hidden = false;
      profileStatus.textContent = "You’re still signed in.";
      signOutButton.disabled = false;
    }
  });
}