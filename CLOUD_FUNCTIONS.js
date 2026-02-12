// Firebase Cloud Functions (Firebase Console / Cloud Functions)
// Deploy this as a Cloud Function in your Firebase project
// File: functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendFCMNotification = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function.'
    );
  }

  const { token, title, body, data } = data;

  // Validate input
  if (!token || !title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: token, title, body'
    );
  }

  try {
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title,
              body: body
            },
            sound: 'default',
            badge: 1
          }
        }
      },
      webpush: {
        notification: {
          title: title,
          body: body,
          icon: '/logo.png' // Update with your app logo path
        }
      }
    };

    const response = await admin.messaging().send(message);
    
    return {
      success: true,
      messageId: response,
      message: 'Notification sent successfully'
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send notification: ' + error.message
    );
  }
});

// Alternative function to send notifications using server key (for backend services)
exports.sendNotificationByUserId = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to call this function.'
    );
  }

  const { userId, userType, title, body, notificationData } = data;

  // Validate input
  if (!userId || !userType || !title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: userId, userType, title, body'
    );
  }

  try {
    const db = admin.firestore();
    const collectionName = userType === 'service_provider' ? 'ServiceProviders' : 'Customers';
    
    // Get user's FCM token
    const querySnapshot = await db.collection(collectionName)
      .where('uid', '==', userId)
      .get();

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const fcmToken = querySnapshot.docs[0].data().fcmToken;
    
    if (!fcmToken) {
      throw new Error('User does not have FCM token');
    }

    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: body,
      },
      data: notificationData || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title,
              body: body
            },
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    
    return {
      success: true,
      messageId: response,
      message: 'Notification sent successfully'
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send notification: ' + error.message
    );
  }
});
