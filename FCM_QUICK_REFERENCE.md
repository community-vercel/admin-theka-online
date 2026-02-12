# FCM Notifications - Quick Reference & Testing

## Quick Summary

When you **approve a user** in the admin panel:
1. User's account status changes to "accepted"
2. FCM notification is automatically sent to their device
3. They see: "Account Approved!" message
4. App can navigate them to dashboard or show success screen

When you **reject a user**:
1. User's account status changes to "rejected"
2. Rejection notification with reason is sent to their device
3. They see: "Account Rejected - Reason: [your reason]"
4. App can show them the rejection screen

## How It Works

```
Admin Panel (Your Site)
    ↓
    Edit User → Change Status to "Accepted"
    ↓
    handleSave() function triggers
    ↓
    notificationService.sendApprovalNotification() called
    ↓
    Cloud Function sendFCMNotification invoked
    ↓
    Firebase Cloud Messaging sends to device
    ↓
    Mobile App receives notification
    ↓
    Shows notification to user
```

## Admin Panel Changes

### Files Modified:
1. **src/pages/Users/index.jsx** - Added notification import and logic to handleSave
2. **src/pages/Users/UserModal.jsx** - Added rejection reason field
3. **src/services/notificationService.js** - Created new notification service

### Files Created:
1. **CLOUD_FUNCTIONS.js** - Cloud Function code to deploy to Firebase
2. **FCM_SETUP_GUIDE.md** - Detailed setup instructions
3. **MOBILE_APP_REACT_NATIVE_SETUP.js** - React Native integration
4. **MOBILE_APP_FLUTTER_SETUP.dart** - Flutter integration
5. **MOBILE_APP_ANDROID_SETUP.java** - Native Android integration

## Step-by-Step Deployment

### 1. Deploy Cloud Functions (One-time setup)

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Navigate to your Firebase functions directory
cd functions

# Install dependencies
npm install

# Copy code from CLOUD_FUNCTIONS.js to functions/index.js

# Deploy
firebase deploy --only functions

# Verify deployment
firebase functions:log
```

### 2. Update Admin Panel Code

✅ **Already done!** The following have been updated:
- `src/pages/Users/index.jsx` - notification import + approval logic
- `src/pages/Users/UserModal.jsx` - rejection reason field
- Created `src/services/notificationService.js` - notification service

Just redeploy your admin panel:
```bash
npm run build
npm run deploy  # or your deployment command
```

### 3. Update Mobile App

For each platform, follow the relevant setup:
- **React Native**: Use code from `MOBILE_APP_REACT_NATIVE_SETUP.js`
- **Flutter**: Use code from `MOBILE_APP_FLUTTER_SETUP.dart`
- **Native Android**: Use code from `MOBILE_APP_ANDROID_SETUP.java`
- **Native iOS**: Implement similar to Android (see FCM_SETUP_GUIDE.md)

Key steps for mobile app:
1. Initialize Firebase Messaging
2. Request notification permissions
3. Get FCM token
4. Send FCM token to admin backend to save
5. Listen for incoming notifications
6. Handle approval/rejection notifications

## Testing Flow

### Test 1: Approval Notification

1. **Create a test user account** on your mobile app
   - Account status should be "pending"

2. **Go to Admin Panel**
   - Navigate to User Management
   - Find the pending user

3. **Approve the user**
   - Click Edit (pencil icon)
   - Change "Account Status" to "Accepted"
   - Click "Update User"

4. **Check mobile device**
   - Look for notification: "Account Approved!"
   - Verify it displays correctly

### Test 2: Rejection Notification

1. **Create another test user account**

2. **Go to Admin Panel**
   - Navigate to User Management
   - Find the pending user

3. **Reject the user**
   - Click Edit (pencil icon)
   - Change "Account Status" to "Rejected"
   - Enter rejection reason (e.g., "Documents not verified")
   - Click "Update User"

4. **Check mobile device**
   - Look for notification: "Account Rejected"
   - Verify reason is displayed

### Test 3: Using Firebase Console

1. Go to **Firebase Console** → **Cloud Messaging**
2. Click "Send your first message"
3. Enter notification details
4. Under "Target" select "Device tokens"
5. Paste a test FCM token
6. Send test notification

To get a test FCM token:
- Add this to your mobile app debug code:
```javascript
// React Native
messaging().getToken().then(token => console.log(token));

// Flutter
FirebaseMessaging.instance.getToken().then((token) => print(token));
```

## Troubleshooting Checklist

### ❌ Notification Not Received

Check these in order:

1. **Is FCM token saved?**
   - Go to Firebase Console → Firestore
   - Check user document in Customers or ServiceProviders collection
   - Verify `fcmToken` field exists and has a value
   
2. **Is Cloud Function deployed?**
   - Run: `firebase functions:log`
   - Should see activity when you approve a user
   - Look for any error messages

3. **Does mobile app have notification permissions?**
   - Check device settings
   - Verify app notifications are enabled
   - For iOS: Check if user granted permission when prompted

4. **Is FCM token expired?**
   - FCM tokens can expire
   - Mobile app should refresh and update token automatically
   - Check if `fcmTokenUpdated` timestamp is recent

### ❌ Cloud Function Deployment Failed

```bash
# Increase deployment timeout
firebase deploy --only functions --timeout=300s

# Check logs
firebase functions:log --tail

# Redeploy with verbose output
firebase deploy --only functions --debug
```

### ❌ "No FCM token found" in logs

The mobile app hasn't saved the token yet. Make sure:
1. Mobile app initialization code is called
2. `saveFCMToken()` is being executed after login
3. Firestore write permissions are correct
4. Check Network tab in browser DevTools or mobile app logs

### ❌ Notifications show but content is empty

Check the notification data object - make sure:
- `title` is provided
- `body` is provided
- `data` object doesn't have malformed JSON

## Admin Panel UI

### User Edit Modal Changes

**New Rejection Reason Field:**
- Only appears when "Account Status" is "Rejected"
- Allows you to enter a custom rejection reason
- Reason is sent to user in notification

**Example Flow:**
```
1. Edit pending user
2. Change "Account Status" dropdown → "Rejected"
3. Rejection Reason textarea appears
4. Type: "CNIC verification failed"
5. Click "Update User"
6. Notification sent: "Account Rejected. Reason: CNIC verification failed"
```

## Notification Payload Structure

### Approval Notification
```javascript
{
  title: "Account Approved!",
  body: "Your account has been approved. You can now use our services.",
  data: {
    type: "approval",
    userType: "service_provider",  // or "customer"
    timestamp: "2026-02-02T10:30:00Z"
  }
}
```

### Rejection Notification
```javascript
{
  title: "Account Rejected",
  body: "Your account has been rejected. Reason: Documents not verified",
  data: {
    type: "rejection",
    reason: "Documents not verified",
    timestamp: "2026-02-02T10:30:00Z"
  }
}
```

## Mobile App Notification Handling

### What happens when notification is received?

1. **App in Foreground** (user has app open)
   - Show in-app notification or alert
   - Update UI to reflect new status
   - Optional: Navigate to dashboard

2. **App in Background** (user has app closed)
   - Show system notification in notification center
   - When user taps notification, open app
   - App receives notification data
   - Can navigate to relevant screen

3. **App Terminated** (user hasn't opened app)
   - Notification sits in notification center
   - When user taps it, app launches
   - Can check what notification triggered launch

## Additional Notes

- **FCM tokens expire**: Mobile SDKs automatically refresh them
- **Multiple devices**: Each device gets its own token
- **Production**: Always test with production Firebase config
- **Rate limiting**: Consider implementing for bulk notifications
- **Data privacy**: Don't send sensitive data in notifications

## Support Resources

- [Firebase Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [React Native Firebase](https://rnfirebase.io/)
- [Firebase Flutter Plugin](https://pub.dev/packages/firebase_messaging)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
