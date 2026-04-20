const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app); // Note: using default instance since admin / standard SDK behaves differently

async function run() {
  try {
    const id = "test1234abcd";
    const ref = doc(db, 'shared_photos', id);
    await setDoc(ref, {
      imageData: "data:image/jpeg;base64,aabbcc",
      createdAt: Date.now()
    });
    console.log("SUCCESS");
  } catch (e) {
    console.log("ERROR: ", e.message);
  }
}
run();
