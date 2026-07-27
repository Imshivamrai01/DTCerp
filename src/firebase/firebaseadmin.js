const admin = require("firebase-admin");
const serviceAccount = require("./firebaseserviceaccount.js");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hotel-buddha-avenue-default-rtdb.firebaseio.com",
});

const db = admin.database();

module.exports = { admin, db };
