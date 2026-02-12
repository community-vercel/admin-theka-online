# FCM Notification Implementation Guide

## Overview
This guide explains how to implement Firebase Cloud Messaging (FCM) notifications for your Theeka mobile app and admin panel.

## Setup Instructions

### Step 1: Deploy Cloud Functions

1. **Navigate to your Firebase project's functions directory** (or create one if it doesn't exist):
   ```bash
   cd functions
   npm install firebase-admin firebase-functions
   ```

2. **Copy the Cloud Functions code** from `CLOUD_FUNCTIONS.js` to your `functions/index.js`:
   - Replace or append the contents of your `functions/index.js` with the Cloud Functions code provided.

3. **Deploy the functions**:
   ```bash
   firebase deploy --only functions
   ```

### Step 2: Configure Firebase in your Admin Panel

The notification service is already integrated into your admin panel. When you approve a user:
1. The system will automatically send an FCM notification to their registered device
2. If the user is rejected, a rejection notification with the reason will be sent

### Step 3: Mobile App Setup

For your mobile app (React Native, Flutter, or Native), follow these steps:

#### A. Get FCM Token from Device

**For React Native:**
```javascript
import messaging from '@react-native-firebase/messaging';

async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
}
```

**For Flutter:**
```dart
import 'package:firebase_messaging/firebase_messaging.dart';

Future<String?> getFCMToken() async {
  try {
    final token = await FirebaseMessaging.instance.getToken();
    return token;
  } catch (e) {
    print('Error getting FCM token: $e');
  }
}
```

**For Native Android:**
```java
import com.google.firebase.messaging.FirebaseMessaging;

FirebaseMessaging.getInstance().getToken()
  .addOnCompleteListener(task -> {
    if (!task.isSuccessful()) {
      Log.w("TAG", "Fetching FCM registration token failed", task.getException());
      return;
    }
    String token = task.getResult();
    Log.d("TAG", "FCM Token: " + token);
  });
```

#### B. Save FCM Token to Firestore

After getting the FCM token, save it to the user's document in Firestore:

**For React Native:**
```javascript
import firestore from '@react-native-firebase/firestore';

async function saveFCMToken(userId, userType, token) {
  const collectionName = userType === 'service_provider' ? 'ServiceProviders' : 'Customers';
  
  try {
    await firestore()
      .collection(collectionName)
      .where('uid', '==', userId)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          firestore()
            .collection(collectionName)
            .doc(docId)
            .update({
              fcmToken: token,
              fcmTokenUpdated: new Date()
            });
        }
      });
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}
```

**For Flutter:**
```dart
import 'package:cloud_firestore/cloud_firestore.dart';

Future<void> saveFCMToken(String userId, String userType, String token) async {
  final collectionName = userType == 'service_provider' ? 'ServiceProviders' : 'Customers';
  
  try {
    final snapshot = await FirebaseFirestore.instance
      .collection(collectionName)
      .where('uid', isEqualTo: userId)
      .get();

    if (snapshot.docs.isNotEmpty) {
      final docId = snapshot.docs[0].id;
      await FirebaseFirestore.instance
        .collection(collectionName)
        .doc(docId)
        .update({
          'fcmToken': token,
          'fcmTokenUpdated': FieldValue.serverTimestamp(),
        });
    }
  } catch (error) {
    print('Error saving FCM token: $error');
  }
}
```

#### C. Handle Incoming Notifications

**For React Native:**
```javascript
import messaging from '@react-native-firebase/messaging';

async function setupNotificationListeners() {
  // Handle notification when app is in foreground
  messaging().onMessage(async (remoteMessage) => {
    console.log('Notification received in foreground:', remoteMessage);
    // Show local notification or update UI
  });

  // Handle notification when app is in background/terminated
  messaging().onNotificationOpenedApp(remoteMessage => {
    if (remoteMessage) {
      console.log('Notification caused app to open:', remoteMessage);
      // Navigate to relevant screen
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
}
```

**For Flutter:**
```dart
import 'package:firebase_messaging/firebase_messaging.dart';

Future<void> setupNotificationListeners() async {
  // Handle notification in foreground
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    print('Got a message whilst in the foreground!');
    print('Message data: ${message.data}');

    if (message.notification != null) {
      print('Message also contained a notification: ${message.notification}');
    }
  });

  // Handle notification when app is opened from background
  FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
    print('A new onMessageOpenedApp event was published!');
    // Navigate based on message data
  });
}
```

### Step 4: Update User Service (Optional)

If you want to automatically save FCM tokens when users log in:

**In your Auth/Login service:**
```javascript
// After successful login
async function handleLoginSuccess(user) {
  // Get FCM token and save it
  const fcmToken = await getFCMToken();
  await notificationService.saveFCMToken(
    user.uid,
    user.userType,
    fcmToken
  );
}
```

## Notification Types

### 1. Approval Notification
**When:** User account is approved by admin
**Content:**
- Title: "Account Approved!"
- Body: "Your account has been approved. You can now use our services."
- Data: `{ type: 'approval', userType, timestamp }`

### 2. Rejection Notification
**When:** User account is rejected by admin
**Content:**
- Title: "Account Rejected"
- Body: "Your account has been rejected. Reason: [reason provided]"
- Data: `{ type: 'rejection', reason, timestamp }`

## Testing

### Test from Admin Panel
1. Go to User Management
2. Edit a pending user
3. Change status to "Accepted" → FCM notification sent
4. Or change status to "Rejected" and provide a reason → FCM notification sent

### Test Notifications
You can test FCM notifications from Firebase Console:
1. Go to Firebase Console → Cloud Messaging
2. Send a test message
3. Enter the FCM token of your test device
4. Send the message and verify it's received on the device

## Troubleshooting

### No FCM Token Found
**Issue:** "No FCM token found for user"
**Solution:** 
- Ensure the mobile app has called `saveFCMToken()` after receiving the token
- Check that the user document in Firestore has the `fcmToken` field populated

### Notifications Not Received
**Check:**
1. FCM token is valid and current (tokens can expire)
2. Cloud Function is deployed successfully (`firebase deploy --only functions`)
3. User's device has FCM service enabled
4. App has notification permissions granted on the device
5. Check Cloud Function logs in Firebase Console for errors

### Cloud Function Deployment Issues
```bash
# View logs
firebase functions:log

# Redeploy with verbose output
firebase deploy --only functions --debug
```

## Admin Panel Usage

### Approving a User
1. Navigate to User Management
2. Click the Edit (pencil) icon on a pending user
3. Change "Account Status" to "Accepted"
4. Click "Update User"
5. Notification will automatically be sent to the user's device

### Rejecting a User
1. Navigate to User Management
2. Click the Edit (pencil) icon on a pending user
3. Change "Account Status" to "Rejected"
4. (Optional) Enter a rejection reason in the "Rejection Reason" field
5. Click "Update User"
6. Rejection notification will automatically be sent to the user

## API Reference

### notificationService Methods

#### sendNotification(userId, notificationData)
Sends a custom notification to a specific user.
```javascript
await notificationService.sendNotification(userId, {
  title: 'Your Title',
  body: 'Your message',
  data: { custom: 'data' }
});
```

#### sendApprovalNotification(userId, userName, userType)
Sends approval notification.
```javascript
await notificationService.sendApprovalNotification(
  'user123',
  'John Doe',
  'service_provider'
);
```

#### sendRejectionNotification(userId, userName, reason)
Sends rejection notification with reason.
```javascript
await notificationService.sendRejectionNotification(
  'user123',
  'John Doe',
  'Documents not verified'
);
```

#### saveFCMToken(userId, userType, fcmToken)
Saves or updates a user's FCM token.
```javascript
await notificationService.saveFCMToken('user123', 'customer', 'token_value');
```

#### sendBulkNotification(userIds, notificationData)
Sends the same notification to multiple users.
```javascript
await notificationService.sendBulkNotification(
  ['user1', 'user2', 'user3'],
  { title: 'Announcement', body: 'Important message' }
);
```

#### broadcastNotification(userType, notificationData)
Sends notification to all users of a specific type.
```javascript
await notificationService.broadcastNotification('service_provider', {
  title: 'Maintenance',
  body: 'System maintenance scheduled'
});
```

## Security Notes

1. **Authentication**: Cloud Functions verify user authentication before sending notifications
2. **FCM Tokens**: Stored securely in Firestore, tokens expire and are automatically refreshed by Firebase SDK
3. **Data Privacy**: Notification data should not contain sensitive personal information
4. **Rate Limiting**: Consider implementing rate limiting for bulk notifications

## Next Steps

1. Deploy the Cloud Functions
2. Configure your mobile app to get and save FCM tokens
3. Implement notification listeners in your mobile app
4. Test the approval flow in the admin panel
5. Monitor Cloud Function logs for any issues
