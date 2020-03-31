import firebase from 'firebase';

const firebaseConfig = {
  measurementId: "G-XW06VBLQS8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;