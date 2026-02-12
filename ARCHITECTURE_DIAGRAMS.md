# FCM Notification Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         THEEKA SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────────┐   │
│  │   ADMIN PANEL        │         │   MOBILE APP             │   │
│  │  (React/Vite)        │         │  (React Native/Flutter)  │   │
│  │                      │         │                          │   │
│  │ - User Management    │         │ - User Registration      │   │
│  │ - Approve/Reject     │         │ - FCM Token Management   │   │
│  │ - Send Notifications │         │ - Notification Handler   │   │
│  └──────────┬───────────┘         └──────────┬───────────────┘   │
│             │                                 │                   │
│             │ Update User Status              │ Save FCM Token    │
│             │ + Send Notification             │                   │
│             │                                 │                   │
│             ▼                                 ▼                   │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │           FIREBASE FIRESTORE (Database)                      ││
│  │                                                               ││
│  │  Collections:                                                ││
│  │  ├─ Customers: {uid, name, email, fcmToken, ...}            ││
│  │  └─ ServiceProviders: {uid, name, accountStatus, fcmToken}  ││
│  └──────────┬───────────────────────────────────────────────────┘│
│             │                                                     │
│             │ Read FCM Token                                      │
│             ▼                                                     │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │   NOTIFICATION SERVICE (notificationService.js)              ││
│  │                                                               ││
│  │  - sendApprovalNotification()                                ││
│  │  - sendRejectionNotification()                               ││
│  │  - getUserFCMToken()                                         ││
│  │  - saveFCMToken()                                            ││
│  └──────────┬───────────────────────────────────────────────────┘│
│             │                                                     │
│             │ Call Cloud Function                                │
│             ▼                                                     │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │   FIREBASE CLOUD FUNCTION (sendFCMNotification)              ││
│  │                                                               ││
│  │  - Receive notification data                                 ││
│  │  - Format for platform (Android/iOS/Web)                     ││
│  │  - Validate token                                            ││
│  │  - Send via Firebase Admin SDK                               ││
│  └──────────┬───────────────────────────────────────────────────┘│
│             │                                                     │
│             │ FCM API Call                                        │
│             ▼                                                     │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │      FIREBASE CLOUD MESSAGING (FCM Service)                  ││
│  │                                                               ││
│  │  - Routes message to device                                  ││
│  │  - Handles delivery                                          ││
│  │  - Manages device connectivity                               ││
│  └──────────┬───────────────────────────────────────────────────┘│
│             │                                                     │
│             │ Platform Notification Service                       │
│             ▼                                                     │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │           USER DEVICES (Mobile Phones)                       ││
│  │                                                               ││
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   ││
│  │  │  iPhone      │    │  Android     │    │  iPad        │   ││
│  │  │              │    │              │    │              │   ││
│  │  │ ┌──────────┐ │    │ ┌──────────┐ │    │ ┌──────────┐ │   ││
│  │  │ │Notif Bar │ │    │ │Notif Bar │ │    │ │Notif Bar │ │   ││
│  │  │ │"Approved"│ │    │ │"Approved"│ │    │ │"Approved"│ │   ││
│  │  │ └──────────┘ │    │ └──────────┘ │    │ └──────────┘ │   ││
│  │  └──────────────┘    └──────────────┘    └──────────────┘   ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## User Approval Flow

```
Admin Panel                  Theeka Backend              Mobile Device
     │                            │                            │
     │  1. Click Edit User         │                            │
     ├──────────────────────────►  │                            │
     │                            │                            │
     │  2. Change Status to        │                            │
     │     "Accepted"              │                            │
     ├──────────────────────────►  │                            │
     │                            │                            │
     │  3. Click Update User       │                            │
     ├──────────────────────────►  │                            │
     │                            │                            │
     │                    4. Save User Status                   │
     │                    to Firestore                          │
     │                            │                            │
     │                    5. Get User's FCM Token               │
     │                    from Database                         │
     │                            │                            │
     │              6. Call sendApprovalNotification()          │
     │                            │                            │
     │                7. Call Cloud Function                   │
     │                sendFCMNotification()                     │
     │                            │                            │
     │              8. Cloud Function prepares                  │
     │                 notification message                     │
     │                            │                            │
     │                9. Send to Firebase Cloud Messaging       │
     │                            │                            │
     │              10. FCM routes to device                    │
     │                            ├─────────────────────────►  │
     │                            │                            │
     │                      11. Device receives notification    │
     │                            │                    ◄─────────
     │                            │                            │
     │                      12. Show in Notification Center    │
     │                            │                            │
     │                      13. User sees:                     │
     │                            │        "Account Approved!" │
     │                            │        "You can now use    │
     │                            │         our services"      │
     │                            │                            │
     │◄─ Show Toast: "Notification Sent!"                      │
     │                            │                            │
```

## User Rejection Flow (with Reason)

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin Panel: User Edit Modal                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Account Status: [Rejected dropdown]  ◄─ Select this          │
│                                                                  │
│  NEW: Rejection Reason:                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│ │ CNIC verification failed                                   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Cancel]  [Update User]  ◄─ Click here                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Submission
         ▼
    ┌─────────────────────────────────────────────────────────┐
    │  handleSave() Function                                  │
    │                                                          │
    │  1. previousStatus = 'pending'                          │
    │  2. newStatus = 'rejected'                              │
    │  3. Save to Firestore                                  │
    │  4. Check: previousStatus !== 'rejected' ✓              │
    │            AND newStatus === 'rejected' ✓               │
    │  5. Call sendRejectionNotification()                   │
    │     - userId                                           │
    │     - userName                                         │
    │     - reason: "CNIC verification failed"              │
    └──────────┬──────────────────────────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────────────────────────┐
    │  Cloud Function: sendFCMNotification                    │
    │                                                          │
    │  Receives:                                              │
    │  {                                                      │
    │    title: "Account Rejected",                          │
    │    body: "Your account has been rejected.              │
    │           Reason: CNIC verification failed",           │
    │    data: {                                              │
    │      type: "rejection",                                │
    │      reason: "CNIC verification failed",              │
    │      timestamp: "2026-02-02T10:30:00Z"                │
    │    }                                                    │
    │  }                                                      │
    │                                                          │
    │  Sends to FCM Service...                               │
    └──────────┬──────────────────────────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────────────────────────┐
    │  User's Device Notification                            │
    │                                                          │
    │  ┌─────────────────────────────────────────────────┐   │
    │  │  ✗ Account Rejected                             │   │
    │  │  Your account has been rejected.                │   │
    │  │  Reason: CNIC verification failed               │   │
    │  └─────────────────────────────────────────────────┘   │
    │                                                          │
    │  User can tap to open app and see more details         │
    └─────────────────────────────────────────────────────────┘
```

## Notification State Machine

```
                    ┌──────────────┐
                    │   PENDING    │
                    │   (Initial)  │
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                │                    │
                ▼                    ▼
         ┌─────────────┐      ┌──────────────┐
         │ ACCEPTED    │      │  REJECTED    │
         │             │      │              │
         │ ✓ Admin     │      │ ✓ Admin      │
         │   approves  │      │   rejects    │
         │ ✓ FCM sent  │      │ ✓ FCM sent   │
         │ ✓ User can  │      │ ✓ Reason     │
         │   use app   │      │   provided   │
         │ ✓ Account   │      │ ✓ User sees  │
         │   active    │      │   rejection  │
         └─────────────┘      └──────────────┘
                │                    │
                │                    │
                │            ┌───────┴──────┐
                │            │              │
                │      [After Review]  [Resubmit]
                │            │              │
                │            ▼              ▼
                │      ┌──────────┐    [Return to
                │      │ DELETED  │     PENDING
                │      │ (if no   │     after
                │      │ reapply) │     correction]
                │      └──────────┘
                │
                └──────────► [Continue with
                             Service]
```

## Notification Types & Content

```
┌─────────────────────────────────────────────────────────────────┐
│                   NOTIFICATION TYPES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ╔════════════════════════════════════════════════════════════╗ │
│  ║ TYPE 1: APPROVAL NOTIFICATION                              ║ │
│  ╠════════════════════════════════════════════════════════════╣ │
│  ║                                                             ║ │
│  ║  Title: "Account Approved!"                                ║ │
│  ║  Body:  "Your account has been approved. You can now use   ║ │
│  ║         our services."                                     ║ │
│  ║                                                             ║ │
│  ║  Data:  {                                                   ║ │
│  ║    type: "approval",                                       ║ │
│  ║    userType: "service_provider" | "customer",             ║ │
│  ║    timestamp: ISO timestamp                                ║ │
│  ║  }                                                          ║ │
│  ║                                                             ║ │
│  ║  Actions:                                                   ║ │
│  ║  - Navigate to Dashboard                                   ║ │
│  ║  - Show success message                                    ║ │
│  ║  - Update app UI                                           ║ │
│  ║                                                             ║ │
│  ╚════════════════════════════════════════════════════════════╝ │
│                                                                  │
│  ╔════════════════════════════════════════════════════════════╗ │
│  ║ TYPE 2: REJECTION NOTIFICATION                             ║ │
│  ╠════════════════════════════════════════════════════════════╣ │
│  ║                                                             ║ │
│  ║  Title: "Account Rejected"                                 ║ │
│  ║  Body:  "Your account has been rejected. Reason: [reason]  ║ │
│  ║         Please review and resubmit."                       ║ │
│  ║                                                             ║ │
│  ║  Data:  {                                                   ║ │
│  ║    type: "rejection",                                      ║ │
│  ║    reason: "CNIC verification failed",                     ║ │
│  ║    timestamp: ISO timestamp                                ║ │
│  ║  }                                                          ║ │
│  ║                                                             ║ │
│  ║  Actions:                                                   ║ │
│  ║  - Show rejection screen                                   ║ │
│  ║  - Display reason to user                                  ║ │
│  ║  - Offer to resubmit                                       ║ │
│  ║  - Navigate to account settings                            ║ │
│  ║                                                             ║ │
│  ╚════════════════════════════════════════════════════════════╝ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
╔═══════════════════════════════════════════════════════════════════╗
║                    ADMIN UPDATES USER                             ║
║           (Change Status: Pending → Accepted)                     ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  Admin Panel (React)                                              ║
║    └─► handleSave(userData)                                       ║
║         └─► userData = {                                          ║
║               accountStatus: "accepted",                          ║
║               name: "John Doe",                                   ║
║               ... other fields                                    ║
║             }                                                     ║
║                                                                    ║
║         └─► userService.updateUser()                              ║
║              └─► Firestore Update                                 ║
║                  └─► ServiceProviders/{docId}                    ║
║                      {                                            ║
║                        accountStatus: "accepted"                  ║
║                      }                                            ║
║                                                                    ║
║         └─► Check Status Changed?                                 ║
║              └─► previousStatus !== "accepted" ✓                  ║
║              └─► newStatus === "accepted" ✓                       ║
║                   └─► YES: Call sendApprovalNotification()        ║
║                                                                    ║
║  Notification Service (JS)                                        ║
║    └─► sendApprovalNotification(userId, userName, userType)       ║
║         └─► getUserFCMToken(userId)                               ║
║              └─► Query Firestore                                  ║
║                  WHERE uid == userId                              ║
║                  RETURN fcmToken                                  ║
║                   └─► Returns: "abc123xyz..."                    ║
║         └─► sendNotification(userId, {                            ║
║               title: "Account Approved!",                         ║
║               body: "...",                                        ║
║               data: { type: "approval", ... }                    ║
║             })                                                    ║
║                                                                    ║
║  Cloud Function                                                   ║
║    └─► sendFCMNotification(data)                                 ║
║         └─► Message = {                                           ║
║               token: "abc123xyz...",                             ║
║               notification: { title, body },                      ║
║               data: { type, userType, timestamp },                ║
║               android: { ... },                                   ║
║               apns: { ... },                                      ║
║               webpush: { ... }                                    ║
║             }                                                     ║
║         └─► admin.messaging().send(message)                       ║
║              └─► Firebase FCM Service                             ║
║                                                                    ║
║  Firebase Cloud Messaging                                         ║
║    └─► Route message to device with token "abc123xyz..."         ║
║         └─► Via platform services:                                ║
║             ├─► APNS (Apple Push Notification service) for iOS   ║
║             ├─► FCM (Firebase Cloud Messaging) for Android       ║
║             └─► WebPush for web/PWA                               ║
║                                                                    ║
║  User's Mobile Device                                             ║
║    └─► Receives notification                                      ║
║         └─► OS shows in notification center                       ║
║              ┌──────────────────────────────────────┐            ║
║              │ ✓ Account Approved!                  │            ║
║              │ Your account has been approved.      │            ║
║              │ You can now use our services.        │            ║
║              └──────────────────────────────────────┘            ║
║         └─► App receives notification event                       ║
║              └─► Handler checks type: "approval"                 ║
║                   └─► Navigate to Dashboard                      ║
║                   └─► Show success dialog                        ║
║                   └─► Update UI state                             ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

## Component Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT DEPENDENCY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Users/index.jsx                                              │
│   ├─ Imports: userService                                     │
│   ├─ Imports: notificationService  ◄── NEW                    │
│   ├─ State: selectedUser                                      │
│   ├─ State: users                                             │
│   └─ Handler: handleSave()                                    │
│      ├─ Calls: userService.updateUser()                       │
│      ├─ Calls: notificationService.sendApprovalNotification() │
│      ├─ Calls: notificationService.sendRejectionNotification()│
│      └─ Shows: toast.success()                                │
│                                                                 │
│   Users/UserModal.jsx                                         │
│   ├─ Props: user, onClose, onSave                            │
│   ├─ State: formData                                          │
│   │  ├─ name, email, phone, city                            │
│   │  ├─ accountStatus                                        │
│   │  └─ reason  ◄── NEW                                      │
│   ├─ Field: Rejection Reason  ◄── NEW                        │
│   │  └─ Shows only when accountStatus === "rejected"         │
│   └─ Handler: handleSubmit()                                 │
│      └─ Calls: props.onSave(formData)                        │
│                                                                 │
│   Services/notificationService.js  ◄── NEW                   │
│   ├─ sendNotification(userId, data)                          │
│   ├─ sendApprovalNotification(userId, name, userType)       │
│   ├─ sendRejectionNotification(userId, name, reason)        │
│   ├─ getUserFCMToken(userId)                                │
│   ├─ saveFCMToken(userId, userType, token)                  │
│   ├─ sendBulkNotification(userIds, data)                    │
│   └─ broadcastNotification(userType, data)                  │
│                                                                 │
│   Services/firebase.js                                        │
│   ├─ db (Firestore)                                          │
│   ├─ auth (Authentication)                                   │
│   ├─ functions (Cloud Functions)  ◄── Used for FCM          │
│   └─ ... other Firebase services                             │
│                                                                 │
│   Firebase Cloud Functions                                    │
│   └─ sendFCMNotification()  ◄── NEW                          │
│      ├─ Receives: token, title, body, data                  │
│      ├─ Calls: admin.messaging().send(message)              │
│      └─ Returns: { success, messageId }                      │
│                                                                 │
│   Firestore Database                                          │
│   ├─ Collections/Customers/{userId}                         │
│   │  └─ Fields: fcmToken, fcmTokenUpdated, ...             │
│   └─ Collections/ServiceProviders/{userId}                 │
│      └─ Fields: fcmToken, fcmTokenUpdated, ...             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**These diagrams show the complete flow from admin approval to user notification delivery.**
