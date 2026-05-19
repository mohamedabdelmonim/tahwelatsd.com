import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const transactionsService = {
  async add(data: any) {
    const path = 'transactions';
    try {
      return await addDoc(collection(db, path), {
        ...data,
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  subscribeToUserTransactions(callback: (transactions: any[]) => void) {
    const path = 'transactions';
    const q = query(
      collection(db, path),
      where('userId', '==', auth.currentUser?.uid),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(transactions);
    }, (e) => {
      handleFirestoreError(e, OperationType.LIST, path);
    });
  },

  async update(id: string, data: any) {
    const path = `transactions/${id}`;
    try {
      const ref = doc(db, 'transactions', id);
      return await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async delete(id: string) {
    const path = `transactions/${id}`;
    try {
      return await deleteDoc(doc(db, 'transactions', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }
};

export const accountsService = {
  async getAll() {
    const path = 'accounts';
    try {
      const q = query(collection(db, path), where('userId', '==', auth.currentUser?.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  }
};
