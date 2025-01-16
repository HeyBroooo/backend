const admin = require("firebase-admin");

let isFirebaseInitialized = false;

function connectToDb() {
    if (!isFirebaseInitialized) {
        try {
            const serviceAccount = require("../config/backend-d78ea-firebase-adminsdk-197sg-a6d07a358f.json");
            console.log("Connecting to Firebase Realtime Database.........", serviceAccount);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: "https://backend-d78ea-default-rtdb.firebaseio.com",
            });

            isFirebaseInitialized = true;
            console.log("Connected to Firebase Realtime Database.........");
        } catch (error) {
            console.error("Error connecting to Firebase Realtime Database:..............", error);
        }
    } else {
        console.log("Firebase is already initialized.");
    }
}

connectToDb();

const db = admin.database();

module.exports = { connectToDb, db };
