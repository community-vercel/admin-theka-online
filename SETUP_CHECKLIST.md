# FCM Implementation - Environment Setup Checklist

## Environment Variables (Already Configured)

Your Firebase config in `.env` should already have these from your Vite config:

```env
VITE_APP_API_KEY=your_api_key
VITE_APP_AUTH_DOMAIN=your_auth_domain
VITE_APP_PROJECT_ID=your_project_id
VITE_APP_STORAGE_BUCKET=your_storage_bucket
VITE_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_APP_APP_ID=your_app_id
VITE_APP_MEASUREMENT_ID=your_measurement_id
```

✅ **These are already being used in your Firebase initialization**

## Pre-Deployment Checklist

### Admin Panel Setup ✅
- [x] `notificationService.js` created
- [x] `Users/index.jsx` updated with notification logic
- [x] `Users/UserModal.jsx` updated with rejection reason field
- [x] All imports added correctly
- [x] Error handling implemented

### Cloud Function Setup ⚠️
- [ ] Deploy `CLOUD_FUNCTIONS.js` to Firebase
  - [ ] Copy code to `functions/index.js`
  - [ ] Run `firebase deploy --only functions`
  - [ ] Verify with `firebase functions:log`

### Firestore Database Setup ✅
- [x] Collections already exist: `Customers`, `ServiceProviders`
- [x] Documents can be updated with `fcmToken` field
- [x] Server timestamps available

### Firebase Security Rules (Check)

Verify your Firestore rules allow updates to fcmToken:

```javascript
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     // Allow authenticated users to update their own documents
//     match /Customers/{document=**} {
//       allow read, update: if request.auth.uid == resource.data.uid;
//       allow create: if request.auth.uid != null;
//     }
//     
//     match /ServiceProviders/{document=**} {
//       allow read, update: if request.auth.uid == resource.data.uid;
//       allow create: if request.auth.uid != null;
//     }
//   }
// }
```

If you have stricter rules, ensure they allow the `fcmToken` update.

## Database Schema Updates Needed

### Customers Collection

Add to documents:
```javascript
{
  uid: "user_id",
  name: "User Name",
  email: "user@email.com",
  phone: "phone_number",
  city: "city_name",
  role: "customer",
  createdAt: timestamp,
  fcmToken: "device_fcm_token_here",      // NEW - for notifications
  fcmTokenUpdated: timestamp               // NEW - when token was saved
}
```

### ServiceProviders Collection

Add to documents:
```javascript
{
  uid: "user_id",
  name: "Provider Name",
  email: "provider@email.com",
  serviceCategory: "Electrician",
  accountStatus: "pending",  // or "accepted", "rejected"
  createdAt: timestamp,
  fcmToken: "device_fcm_token_here",      // NEW - for notifications
  fcmTokenUpdated: timestamp,              // NEW - when token was saved
  reason: "Rejection reason if rejected"   // NEW - optional
}
```

## Mobile App Prerequisites

### Firebase Setup in Mobile App

1. **Add Firebase to your mobile project**
   - React Native: `npm install @react-native-firebase/app @react-native-firebase/messaging`
   - Flutter: `flutter pub add firebase_messaging`
   - Android: Add Firebase via Firebase Console

2. **Download Configuration Files**
   - **iOS**: Download `GoogleService-Info.plist`
   - **Android**: Download `google-services.json`

3. **Ensure Same Firebase Project**
   - Use the SAME Firebase project ID as admin panel
   - Otherwise notifications won't route correctly

### Mobile App Permissions

**Android (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

**iOS (Info.plist):**
- Notification permissions handled via UIUserNotificationSettings
- User will be prompted when app first requests permission

## Testing Environment

### Development Testing

1. **Firebase Emulator (Optional)**
   ```bash
   firebase emulators:start
   ```

2. **Local Cloud Function Testing**
   ```bash
   firebase emulators:start --only functions
   ```

3. **Firebase Console Testing**
   - Go to Cloud Messaging
   - Send test message to verify setup

### Staging/Production

- Use production Firebase config
- Test with real devices
- Monitor Cloud Function logs
- Check Firestore for saved tokens

## Deployment Order

### First Time Setup:

1. **Deploy Cloud Function** (required for notifications to work)
   ```bash
   firebase deploy --only functions
   ```

2. **Deploy Updated Admin Panel**
   ```bash
   npm run build
   npm run deploy
   ```

3. **Update Mobile App** (depends on platform)
   - Build and deploy to test devices first
   - Test full approval flow
   - Monitor logs for errors

### Subsequent Updates:

- Update admin panel normally
- Cloud Function rarely needs updates
- Mobile app updates as needed

## Monitoring & Debugging

### View Cloud Function Logs

```bash
# Real-time logs
firebase functions:log --tail

# Last 50 logs
firebase functions:log

# Filter by function
firebase functions:log sendFCMNotification
```

### View Firestore Updates

1. Go to Firebase Console → Firestore
2. Check `Customers` and `ServiceProviders` collections
3. Look for `fcmToken` and `fcmTokenUpdated` fields
4. Verify timestamps are recent

### Check FCM Token Status

Query in Firestore:
```javascript
// Get a user's FCM token
db.collection("Customers")
  .where("uid", "==", "user_id_here")
  .get()
  .then(snapshot => {
    console.log(snapshot.docs[0].data().fcmToken);
  });
```

## Performance Considerations

- **FCM Token Refresh**: Automatic, happens in background
- **Notification Delivery**: Usually within seconds
- **Firestore Writes**: Minimal impact, only on token refresh
- **Cloud Function**: Scales automatically
- **Recommended**: Monitor function execution time in Firebase Console

## Rollback Plan

If issues occur:

1. **Admin panel doesn't save user?**
   - Check `notificationService.js` error handling
   - Verify notification error doesn't prevent save

2. **Notifications not sent?**
   - Cloud Function may not be deployed
   - FCM tokens not saved
   - Check browser console and Firebase logs

3. **Mobile app doesn't receive notifications?**
   - FCM token not being sent to backend
   - Notification permissions not granted
   - Firebase config issue in mobile app

## Compliance & Privacy

- ✅ FCM tokens stored in Firestore
- ✅ Tokens automatically managed by Firebase
- ✅ No third-party dependencies for FCM
- ✅ Notifications encrypted in transit
- ✅ User can disable notifications via device settings

## FAQ

**Q: Do I need to update my Firestore rules?**
A: Only if your current rules prevent user updates. The code handles both auto-update and manual token saving.

**Q: Can I test without deploying Cloud Function?**
A: No, the Cloud Function is required to actually send notifications.

**Q: What if user uninstalls app?**
A: FCM token becomes invalid, notification will fail silently. Next time user installs and opens app, new token is generated.

**Q: How often do FCM tokens refresh?**
A: Automatically managed by Firebase SDK. Usually every 8 weeks or when app is reinstalled.

**Q: Can I send notifications from other services?**
A: Yes! Use the same Cloud Function or direct FCM API if you have server access.

## Next Steps

1. ✅ Admin panel code is ready (you have it)
2. ⚠️ Deploy Cloud Function (see CLOUD_FUNCTIONS.js)
3. ⚠️ Update mobile app (use appropriate setup guide)
4. 🧪 Test with real devices
5. 📊 Monitor logs and Firestore
6. 🚀 Deploy to production

---

Ready? Start with deploying the Cloud Function!
