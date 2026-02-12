// mobile-app-integration-example/react-native-setup.js
// React Native Firebase Messaging Setup
// Import this in your app's entry point (App.js or App.tsx)

import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { auth } from './firebase-config'; // Your Firebase config

/**
 * Initialize FCM for React Native
 * Call this in your main App component
 */
export const initializeFCM = async () => {
  try {
    // Request user permission for notifications (iOS)
    await messaging().requestPermission();

    // Get the FCM token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    // Save token to Firestore when user is logged in
    if (auth.currentUser) {
      await saveFCMTokenToFirestore(auth.currentUser.uid, token);
    }

    // Listen for token refresh
    const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
      console.log('FCM Token refreshed:', newToken);
      if (auth.currentUser) {
        await saveFCMTokenToFirestore(auth.currentUser.uid, newToken);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error initializing FCM:', error);
  }
};

/**
 * Save FCM token to Firestore
 */
const saveFCMTokenToFirestore = async (userId, fcmToken) => {
  try {
    // Determine user type from your app's state or user claims
    const userDoc = await firestore().collection('Customers').where('uid', '==', userId).get();
    
    if (!userDoc.empty) {
      await firestore()
        .collection('Customers')
        .doc(userDoc.docs[0].id)
        .update({
          fcmToken: fcmToken,
          fcmTokenUpdated: firestore.FieldValue.serverTimestamp()
        });
      return;
    }

    // Check ServiceProviders
    const providerDoc = await firestore().collection('ServiceProviders').where('uid', '==', userId).get();
    if (!providerDoc.empty) {
      await firestore()
        .collection('ServiceProviders')
        .doc(providerDoc.docs[0].id)
        .update({
          fcmToken: fcmToken,
          fcmTokenUpdated: firestore.FieldValue.serverTimestamp()
        });
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

/**
 * Setup notification listeners
 * Call this after initializing FCM
 */
export const setupNotificationListeners = () => {
  // Handle notification when app is in foreground
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('Notification received in foreground:', remoteMessage);
    
    // Display a local notification
    if (remoteMessage.notification) {
      // You can use react-native-notifee or similar for displaying local notifications
      console.log('Title:', remoteMessage.notification.title);
      console.log('Body:', remoteMessage.notification.body);
      console.log('Data:', remoteMessage.data);

      // Example: Handle notification based on type
      if (remoteMessage.data?.type === 'approval') {
        // Handle approval notification
        console.log('Account approved!');
        // Trigger UI update, navigate to relevant screen, etc.
      } else if (remoteMessage.data?.type === 'rejection') {
        // Handle rejection notification
        console.log('Account rejected:', remoteMessage.data?.reason);
      }
    }
  });

  // Handle notification when app is opened from background
  const unsubscribeBackground = messaging().onNotificationOpenedApp((remoteMessage) => {
    if (remoteMessage) {
      console.log('Notification caused app to open:', remoteMessage);
      
      // Navigate to relevant screen based on notification data
      if (remoteMessage.data?.type === 'approval') {
        // Navigate to home or dashboard
      } else if (remoteMessage.data?.type === 'rejection') {
        // Navigate to account or settings
      }
    }
  });

  // Check if app was launched from notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to launch:', remoteMessage);
      }
    });

  return () => {
    unsubscribeForeground();
    unsubscribeBackground();
  };
};

/**
 * Example App component using FCM
 */
export function App() {
  useEffect(() => {
    const unsubscribeFCM = initializeFCM();
    const unsubscribeListeners = setupNotificationListeners();

    return () => {
      unsubscribeFCM?.then(fn => fn?.());
      unsubscribeListeners?.();
    };
  }, []);

  return (
    // Your app content
    <></>
  );
}
