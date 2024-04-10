function initializeFirestore() {
    const admin = require('firebase-admin');
    const serviceAccount = require('../../its-discord-auth-firebase-adminsdk-wn2uo-ac781d8325.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();
    return db;
};

export default initializeFirestore;