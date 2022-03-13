import {
  updateDoc,
  doc,
  increment,
  getFirestore,
} from 'firebase/firestore/lite';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyCJbuIjqw8btjhuTQqDdXepOLLqw_Hr7cs',
  authDomain: 'wordle-art.firebaseapp.com',
  projectId: 'wordle-art',
  storageBucket: 'wordle-art.appspot.com',
  messagingSenderId: '701457051751',
  appId: '1:701457051751:web:ec98c33c8add85dce2a4c2',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();

const useHitCount = (): { addHit: () => void; addRegen: () => void } => {
  const addHit = () => {
    const docRef = doc(db, 'analytics/mandelbulb');
    updateDoc(docRef, {
      hits: increment(1),
    });
  };

  const addRegen = () => {
    const docRef = doc(db, 'analytics/mandelbulb');
    updateDoc(docRef, {
      regens: increment(1),
    });
  };

  return { addHit, addRegen };
};

export default useHitCount;
