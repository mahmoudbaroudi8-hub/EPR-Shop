import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { Product, Supplier, Transaction, PurchaseOrder } from '../types';

// Helper to load all items of a subcollection for a given user
export async function loadUserCollection<T>(userId: string, collectionName: string): Promise<T[]> {
  const colRef = collection(db, 'users', userId, collectionName);
  const snapshot = await getDocs(colRef);
  const items: T[] = [];
  snapshot.forEach((docSnap) => {
    items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
  });
  return items;
}

// Helper to save or update a single item in a user's subcollection
export async function saveUserDoc(userId: string, collectionName: string, docId: string, data: any): Promise<void> {
  const docRef = doc(db, 'users', userId, collectionName, docId);
  await setDoc(docRef, data, { merge: true });
}

// Helper to batch initialize a subcollection from local data (useful for first-time login)
export async function batchSaveCollection<T extends { id: string }>(
  userId: string,
  collectionName: string,
  items: T[]
): Promise<void> {
  const batch = writeBatch(db);
  items.forEach((item) => {
    const docRef = doc(db, 'users', userId, collectionName, item.id);
    batch.set(docRef, item);
  });
  await batch.commit();
}

// Helper to delete an item from a user's subcollection
export async function deleteUserDoc(userId: string, collectionName: string, docId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, collectionName, docId);
  await deleteDoc(docRef);
}

