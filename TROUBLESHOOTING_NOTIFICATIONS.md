# ❌ Notifications Not Working - Troubleshooting Guide

## 🔍 Quick Diagnosis

When you approve a user but **no notification appears on mobile**, one of these is missing:

---

## **🚨 MOST COMMON ISSUE: Cloud Function Not Deployed**

### Check #1: Is Cloud Function Deployed?

```bash
firebase functions:log
```

**If you see errors or nothing** → Cloud Function NOT deployed ❌

**If you see activity** → Cloud Function IS deployed ✅

---

## **Step-by-Step Troubleshooting**

### 1️⃣ VERIFY CLOUD FUNCTION IS DEPLOYED

**Problem**: Notifications won't work without Cloud Function

**Solution**:
```bash
# Go to your project directory
cd your-project

# Deploy Cloud Function
firebase deploy --only functions

# Verify it deployed
firebase functions:log
```

**Expected Output**:
```
i  functions: updating Node.js 16 function sendFCMNotification...
✔  functions[sendFCMNotification]: Successful update operation.
```

❌ **If deployment fails**, check:
- Are you logged in to Firebase? Run: `firebase login`
- Is your Firebase project correct? Run: `firebase projects:list`
- Do you have permissions? Check Firebase Console

---

### 2️⃣ CHECK IF FCM TOKEN IS SAVED

Your mobile app must save the FCM token to Firestore first.

**Steps**:
1. Go to **Firebase Console** → **Firestore Database**
2. Click **Collections**
3. Open **Customers** or **ServiceProviders** collection
4. Find **your test user document**
5. Look for `fcmToken` field

**What you should see**:
```
{
  name: "Your Name"
  email: "your@email.com"
  fcmToken: "abc123xyz..."  ← SHOULD EXIST!
  fcmTokenUpdated: Feb 2, 2026
  ...
}
```

### ❌ If `fcmToken` field is MISSING:

**Problem**: Mobile app didn't save FCM token

**Solution**: Your mobile app needs to:
1. Initialize Firebase Messaging
2. Get FCM token
3. Save token to backend

**Check your mobile app code**:

**React Native**:
```javascript
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

// Call this after user logs in
async function saveFCMToken(userId) {
  const token = await messaging().getToken();
  
  // Save to Firestore
  const userDoc = await firestore()
    .collection('Customers')
    .where('uid', '==', userId)
    .get();
    
  if (!userDoc.empty) {
    await firestore()
      .collection('Customers')
      .doc(userDoc.docs[0].id)
      .update({ fcmToken: token });
  }
}
```

**Flutter**:
```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

Future<void> saveFCMToken(String userId) async {
  final token = await FirebaseMessaging.instance.getToken();
  
  final userDoc = await FirebaseFirestore.instance
    .collection('Customers')
    .where('uid', isEqualTo: userId)
    .get();
    
  if (userDoc.docs.isNotEmpty) {
    await FirebaseFirestore.instance
      .collection('Customers')
      .doc(userDoc.docs[0].id)
      .update({'fcmToken': token});
  }
}
```

---

### 3️⃣ CHECK ADMIN PANEL CODE

Make sure admin panel is calling notification service correctly.

**File**: `src/pages/Users/index.jsx`

Should have this:
```javascript
import { notificationService } from '../../services/notificationService';

const handleSave = async (userData) => {
  try {
    if (selectedUser) {
      const previousStatus = selectedUser.accountStatus;
      const newStatus = userData.accountStatus;
      
      // Update user
      await userService.updateUser(selectedUser.id, selectedUser.userType, userData);
      
      // Send notification if approved
      if (previousStatus !== 'accepted' && newStatus === 'accepted') {
        await notificationService.sendApprovalNotification(
          selectedUser.uid,
          selectedUser.name,
          selectedUser.userType
        );
        toast.success('Notification sent!');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

### 4️⃣ CHECK BROWSER CONSOLE FOR ERRORS

When you click "Approve" in admin panel:

1. Open **Browser DevTools** (F12)
2. Go to **Console** tab
3. Click **Approve** user
4. Watch for errors

**Look for**:
```
✅ Good: "Notification sent successfully"
❌ Bad: "No FCM token found for user..."
❌ Bad: "Cloud function not found"
❌ Bad: "Permission denied"
```

---

### 5️⃣ CHECK FIREBASE CLOUD FUNCTION LOGS

```bash
firebase functions:log --tail
```

Then approve a user in admin panel and **watch the logs in real-time**.

**Expected logs**:
```
✔ Function execution started
  Received FCM notification request
  Token: abc123xyz...
  Title: Account Approved!
  Sending to Firebase Messaging...
  ✔ Message sent: xyz789abc
  Function execution completed
```

**Problem logs**:
```
❌ Error: Messaging service not available
❌ Error: Invalid registration token
❌ Error: User not authenticated
```

---

## 🎯 Complete Diagnostic Checklist

Run through this checklist:

### Backend Setup
- [ ] Cloud Function deployed? (`firebase deploy --only functions`)
- [ ] Cloud Function working? (`firebase functions:log`)
- [ ] No errors in function logs?

### Database
- [ ] User's `fcmToken` field exists in Firestore?
- [ ] FCM token is not empty/null?
- [ ] `fcmTokenUpdated` timestamp is recent?

### Admin Panel
- [ ] notificationService is imported?
- [ ] handleSave calls notification function?
- [ ] Browser console shows no errors?

### Mobile App
- [ ] Firebase Messaging initialized?
- [ ] Notification permissions granted?
- [ ] FCM token obtained?
- [ ] Token saved to Firestore?
- [ ] Notification listeners set up?

### Device
- [ ] Notification permissions enabled on device?
- [ ] App notifications enabled in device settings?
- [ ] Internet connection active?
- [ ] FCM services installed (Android)?

---

## 🔧 Quick Fix Steps (In Order)

### Step 1: Deploy Cloud Function ⚡
```bash
firebase deploy --only functions
```

### Step 2: Check FCM Token in Firestore ✅
- Firebase Console → Firestore
- Find user document
- Look for `fcmToken` field

### Step 3: Test Admin Panel
- Go to User Management
- Approve a test user
- Check browser console (F12)

### Step 4: Check Logs
```bash
firebase functions:log --tail
```

### Step 5: Mobile App FCM Setup
- Ensure FCM token saving code is implemented
- Test on real device (not emulator)

---

## ❓ Specific Scenarios

### Scenario 1: "Admin approve works, but no notification on mobile"

**Most likely**: FCM token not saved to Firestore

**Fix**:
1. Add FCM token saving to mobile app login flow
2. Verify token in Firestore (should see `fcmToken` field)
3. Try approving user again

### Scenario 2: "I see error in browser console"

**Possible errors**:
```
"No FCM token found" → Mobile app didn't save token
"Cloud function not found" → Function not deployed
"Permission denied" → Firebase rules issue
"Invalid token" → Token expired or corrupted
```

**Fix**: See specific error message section below

### Scenario 3: "Cloud Function deployed but still not working"

**Check**:
1. User's `fcmToken` exists in Firestore?
2. Is it the SAME Firebase project in both admin and mobile?
3. Check function logs: `firebase functions:log`

---

## 📱 Common Mobile App Issues

### React Native Issues

**Problem**: Token not saving
```javascript
// ❌ Wrong - token not being saved
messaging().getToken();

// ✅ Correct - token is saved
const token = await messaging().getToken();
await saveFCMTokenToFirestore(userId, token);
```

**Problem**: Notifications not showing in foreground
```javascript
// Must add listener for foreground messages
messaging().onMessage(async (remoteMessage) => {
  console.log('Notification received:', remoteMessage);
  // Show notification to user
});
```

### Flutter Issues

**Problem**: Getting token but not saving
```dart
// ❌ Wrong
await FirebaseMessaging.instance.getToken();

// ✅ Correct
final token = await FirebaseMessaging.instance.getToken();
await saveFCMTokenToFirestore(userId, token);
```

---

## 🚨 Error Messages & Solutions

### "No FCM token found for user"
```
Cause: Mobile app hasn't saved FCM token yet
Fix: 
1. Ensure Firebase Messaging is initialized in mobile app
2. Call saveFCMToken() after user logs in
3. Check Firestore - should see fcmToken field
```

### "Cloud function sendFCMNotification not found"
```
Cause: Cloud Function not deployed
Fix:
1. Run: firebase deploy --only functions
2. Verify with: firebase functions:log
```

### "Invalid registration token"
```
Cause: FCM token is invalid or expired
Fix:
1. Token may have expired
2. Re-initialize Firebase Messaging in mobile app
3. Get new token and save to Firestore
4. Try approving user again
```

### "Insufficient permission"
```
Cause: Firebase security rules blocking the operation
Fix:
1. Check Firestore security rules
2. Ensure authenticated user can read/write documents
3. Update rules if needed
```

### "User not authenticated"
```
Cause: Admin not logged in to Firebase
Fix:
1. Check admin panel - should show logged in user
2. Log out and log in again
3. Check Firebase Console for auth issues
```

---

## ✅ Working Setup Verification

Run this complete test:

### Test 1: Cloud Function
```bash
firebase functions:log --tail
# Should show function activity
```

### Test 2: FCM Token in Database
```
1. Firebase Console
2. Firestore
3. Customers collection
4. Your test user
5. Should see: fcmToken: "token_value"
```

### Test 3: Admin Panel
```
1. User Management
2. Edit test user
3. Change status to "Accepted"
4. Click Update
5. Check browser console (F12)
6. Should see: "Notification sent successfully"
```

### Test 4: Cloud Function Logs
```bash
firebase functions:log
# Should see your function being called and sending notification
```

### Test 5: Mobile Device
```
1. Keep app open or minimized
2. Should see notification in notification center
3. Title: "Account Approved!"
4. Body: "Your account has been approved..."
```

---

## 💡 Pro Tips

1. **Always test with real device**, not emulator
2. **Check browser console (F12)** - shows most errors
3. **Watch function logs in real-time**: `firebase functions:log --tail`
4. **FCM tokens can expire** - refresh them periodically
5. **Use test users first** - easier to debug

---

## 📞 Get More Help

If still not working, check:
1. [FCM_QUICK_REFERENCE.md](FCM_QUICK_REFERENCE.md) - Troubleshooting section
2. [FCM_SETUP_GUIDE.md](FCM_SETUP_GUIDE.md) - Mobile app setup
3. [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) - How it works

---

**Need specific error code help?** Show me:
1. Browser console error (F12)
2. Firebase function logs (`firebase functions:log`)
3. What happens when you approve a user

I'll help fix it! 🔧
