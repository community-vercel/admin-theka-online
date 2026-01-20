// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  getCountFromServer,
  limit
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

// Helper function to measure performance
const measurePerformance = () => {
  // Use browser's performance API if available, otherwise fallback to Date
  if (typeof performance !== 'undefined' && performance.now) {
    const startTime = performance.now();
    return () => Math.round(performance.now() - startTime);
  } else {
    const startTime = Date.now();
    return () => Math.round(Date.now() - startTime);
  }
};

// DB Status monitoring functions
export const getDBStatus = async () => {
  try {
    const getResponseTime = measurePerformance();
    
    // Test Firestore connection with multiple methods
    let firestoreStatus = 'offline';
    let authStatus = 'offline';
    let storageStatus = 'offline';
    let functionsStatus = 'offline';
    
    try {
      // Test Firestore - try to read from a known collection
      const testQuery = query(collection(db, 'serviceProviders'), limit(1));
      await getDocs(testQuery);
      firestoreStatus = 'online';
    } catch (error) {
      console.log('Firestore test failed:', error.message);
      // Try alternative test
      try {
        await getCountFromServer(collection(db, 'serviceProviders'));
        firestoreStatus = 'online';
      } catch {
        firestoreStatus = 'offline';
      }
    }
    
    // Test Auth (simplified check)
    try {
      // Just check if auth instance is available
      if (auth && typeof auth.currentUser !== 'undefined') {
        authStatus = 'online';
      } else {
        authStatus = 'checking';
      }
    } catch {
      authStatus = 'offline';
    }
    
    // Test Storage (simplified check)
    try {
      // Just check if storage instance is available
      if (storage) {
        storageStatus = 'online';
      }
    } catch {
      storageStatus = 'offline';
    }
    
    // Test Functions (simplified check)
    try {
      // Just check if functions instance is available
      if (functions) {
        functionsStatus = 'online';
      }
    } catch {
      functionsStatus = 'offline';
    }
    
    const responseTime = getResponseTime();
    const overallStatus = firestoreStatus === 'online' ? 'online' : 'offline';
    
    return {
      status: overallStatus,
      responseTime: responseTime,
      timestamp: new Date().toISOString(),
      services: {
        firestore: firestoreStatus,
        auth: authStatus,
        storage: storageStatus,
        functions: functionsStatus
      }
    };
  } catch (error) {
    console.error('DB Status check failed:', error);
    return {
      status: 'offline',
      responseTime: 0,
      timestamp: new Date().toISOString(),
      services: {
        firestore: 'offline',
        auth: 'offline',
        storage: 'offline',
        functions: 'offline'
      },
      error: error.message
    };
  }
};

export const getDBStatistics = async () => {
  try {
    const collections = ['serviceProviders', 'users', 'ads', 'categories', 'transactions'];
    const stats = {};
    
    for (const collectionName of collections) {
      try {
        const collRef = collection(db, collectionName);
        const snapshot = await getCountFromServer(collRef);
        stats[collectionName] = snapshot.data().count;
      } catch (error) {
        // Collection might not exist or have no documents
        stats[collectionName] = 0;
      }
    }
    
    return {
      totalRecords: Object.values(stats).reduce((a, b) => a + b, 0),
      collections: stats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get DB statistics:', error);
    return {
      totalRecords: 0,
      collections: {},
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Simple connection test that doesn't throw errors
export const testConnection = async () => {
  try {
    const startTime = Date.now();
    const querySnapshot = await getDocs(query(collection(db, 'serviceProviders'), limit(1)));
    const responseTime = Date.now() - startTime;
    
    return {
      connected: !querySnapshot.empty || true, // Even empty collection means connection works
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      connected: false,
      responseTime: 0,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Export all Firestore functions
export { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  getCountFromServer,
  limit
};