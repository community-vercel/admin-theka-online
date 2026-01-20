// src/services/dbHealthService.js
import { 
  db, 
  collection, 
  getDocs, 
  getCountFromServer,
  query,
  limit,
  orderBy,
  where,
  serverTimestamp
} from './firebase';

// Collection names in your database
const COLLECTIONS = [
  'serviceProviders',
  'users', 
  'ads',
  'categories',
  'transactions',
  'orders',
  'reviews',
  'notifications'
];

// Get detailed health metrics
export const getDBHealthMetrics = async () => {
  const startTime = Date.now();
  
  try {
    // Test basic connectivity
    const connectivityTest = await testConnectivity();
    
    if (!connectivityTest.connected) {
      return {
        overallStatus: 'offline',
        timestamp: new Date().toISOString(),
        connectivity: connectivityTest,
        collections: [],
        statistics: null,
        performance: null,
        errors: [connectivityTest.error]
      };
    }

    // Get collection statistics
    const collections = await getCollectionStats();
    
    // Get performance metrics
    const performance = await getPerformanceMetrics();
    
    // Get system status
    const systemStatus = await getSystemStatus();
    
    // Calculate overall status
    const overallStatus = calculateOverallStatus(collections, performance, systemStatus);
    
    return {
      overallStatus,
      timestamp: new Date().toISOString(),
      connectivity: connectivityTest,
      collections,
      statistics: calculateStatistics(collections),
      performance,
      systemStatus,
      responseTime: Date.now() - startTime
    };
    
  } catch (error) {
    console.error('DB Health check failed:', error);
    return {
      overallStatus: 'error',
      timestamp: new Date().toISOString(),
      connectivity: { connected: false, error: error.message },
      collections: [],
      statistics: null,
      performance: null,
      systemStatus: null,
      responseTime: Date.now() - startTime,
      errors: [error.message]
    };
  }
};

// Test basic connectivity
const testConnectivity = async () => {
  try {
    const startTime = Date.now();
    
    // Try multiple approaches
    let connected = false;
    let error = null;
    
    // Method 1: Try to get a document from serviceProviders
    try {
      const testQuery = query(collection(db, 'serviceProviders'), limit(1));
      const snapshot = await getDocs(testQuery);
      connected = true;
    } catch (err1) {
      // Method 2: Try to get count
      try {
        await getCountFromServer(collection(db, 'serviceProviders'));
        connected = true;
      } catch (err2) {
        error = err2.message;
      }
    }
    
    return {
      connected,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error
    };
  } catch (error) {
    return {
      connected: false,
      responseTime: 0,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

// Get detailed stats for each collection
const getCollectionStats = async () => {
  const statsPromises = COLLECTIONS.map(async (collectionName) => {
    try {
      const startTime = Date.now();
      const collRef = collection(db, collectionName);
      
      // Get document count
      const countSnapshot = await getCountFromServer(collRef);
      const documentCount = countSnapshot.data().count;
      
      // Get sample documents to analyze structure
      let sampleDocs = [];
      let lastUpdated = null;
      
      if (documentCount > 0) {
        const sampleQuery = query(collRef, limit(5), orderBy('createdAt', 'desc'));
        const sampleSnapshot = await getDocs(sampleQuery);
        sampleDocs = sampleSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Get most recent document timestamp
        if (sampleDocs.length > 0 && sampleDocs[0].createdAt) {
          lastUpdated = sampleDocs[0].createdAt;
        }
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        name: collectionName,
        documentCount,
        responseTime,
        lastUpdated,
        status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'slow' : 'degraded',
        sampleSize: Math.min(5, documentCount)
      };
    } catch (error) {
      return {
        name: collectionName,
        documentCount: 0,
        responseTime: 0,
        lastUpdated: null,
        status: 'error',
        error: error.message
      };
    }
  });

  return Promise.all(statsPromises);
};

// Get performance metrics
const getPerformanceMetrics = async () => {
  const metrics = {
    readPerformance: [],
    writePerformance: null,
    cachePerformance: null
  };

  // Test read performance with different queries
  const readTests = [
    { name: 'Simple Query', query: query(collection(db, 'serviceProviders'), limit(10)) },
    { name: 'Ordered Query', query: query(collection(db, 'serviceProviders'), orderBy('createdAt', 'desc'), limit(5)) }
  ];

  for (const test of readTests) {
    try {
      const startTime = Date.now();
      const snapshot = await getDocs(test.query);
      const responseTime = Date.now() - startTime;
      
      metrics.readPerformance.push({
        testName: test.name,
        responseTime,
        documentCount: snapshot.size,
        status: responseTime < 500 ? 'fast' : responseTime < 1500 ? 'normal' : 'slow'
      });
    } catch (error) {
      metrics.readPerformance.push({
        testName: test.name,
        responseTime: 0,
        documentCount: 0,
        status: 'error',
        error: error.message
      });
    }
  }

  // Calculate average read performance
  const successfulReads = metrics.readPerformance.filter(r => r.responseTime > 0);
  if (successfulReads.length > 0) {
    metrics.averageReadTime = Math.round(
      successfulReads.reduce((sum, r) => sum + r.responseTime, 0) / successfulReads.length
    );
  }

  return metrics;
};

// Get system status (simulated for Firebase)
const getSystemStatus = async () => {
  return {
    region: 'us-central1', // Default Firebase region
    databaseSize: 'unknown', // Firestore doesn't expose this directly
    readUnits: 'auto-scaling',
    writeUnits: 'auto-scaling',
    storage: 'auto-scaling',
    lastMaintenance: null,
    nextMaintenance: null
  };
};

// Calculate statistics from collections
const calculateStatistics = (collections) => {
  const totalDocuments = collections.reduce((sum, coll) => sum + coll.documentCount, 0);
  const healthyCollections = collections.filter(coll => coll.status === 'healthy').length;
  const errorCollections = collections.filter(coll => coll.status === 'error').length;
  const slowCollections = collections.filter(coll => coll.status === 'slow' || coll.status === 'degraded').length;
  
  return {
    totalDocuments,
    collectionCount: collections.length,
    healthyCollections,
    errorCollections,
    slowCollections,
    healthPercentage: Math.round((healthyCollections / collections.length) * 100) || 0
  };
};

// Calculate overall status
const calculateOverallStatus = (collections, performance, systemStatus) => {
  // Check for any critical errors
  const hasCriticalErrors = collections.some(coll => coll.status === 'error') || 
                           performance.readPerformance.some(p => p.status === 'error');
  
  if (hasCriticalErrors) return 'critical';
  
  // Check for degraded performance
  const hasDegradedCollections = collections.some(coll => coll.status === 'degraded');
  const hasSlowPerformance = performance.readPerformance.some(p => p.status === 'slow');
  
  if (hasDegradedCollections || hasSlowPerformance) return 'degraded';
  
  // Check for slow performance
  const hasNormalSlow = collections.some(coll => coll.status === 'slow');
  if (hasNormalSlow) return 'warning';
  
  return 'healthy';
};

// Get health history (simplified - in production, you'd store this)
export const getHealthHistory = async (hours = 24) => {
  // This would typically query a history collection
  // For now, return simulated data
  const now = new Date();
  const history = [];
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
    history.push({
      timestamp: time.toISOString(),
      status: Math.random() > 0.1 ? 'healthy' : Math.random() > 0.5 ? 'warning' : 'degraded',
      responseTime: Math.floor(Math.random() * 500) + 50,
      uptime: Math.random() > 0.05 ? 100 : Math.random() * 100
    });
  }
  
  return history;
};

// Export collection names for UI
export const getCollectionNames = () => COLLECTIONS;