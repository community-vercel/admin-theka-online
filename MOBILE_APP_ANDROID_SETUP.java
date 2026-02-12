// mobile-app-integration-example/android-native-setup.java
// Native Android Firebase Messaging Setup

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.RemoteMessage;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.DocumentSnapshot;
import java.util.HashMap;
import java.util.Map;

public class FCMService extends FirebaseMessagingService {
    private static final String TAG = "FCMService";
    private static final String CHANNEL_ID = "theeka_notifications";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // Check if message contains a data payload
        if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());
            handleNotificationData(remoteMessage.getData());
        }

        // Check if message contains a notification payload
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
            showNotification(remoteMessage.getNotification());
        }
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "Refreshed token: " + token);
        // Save the new token to Firestore
        saveFCMTokenToFirestore(token);
    }

    /**
     * Handle notification data
     */
    private void handleNotificationData(Map<String, String> data) {
        String notificationType = data.get("type");
        
        switch (notificationType) {
            case "approval":
                Log.d(TAG, "Account approved!");
                // Handle approval - navigate to dashboard, etc.
                break;
            case "rejection":
                String reason = data.get("reason");
                Log.d(TAG, "Account rejected: " + reason);
                // Handle rejection - navigate to account, etc.
                break;
            default:
                Log.d(TAG, "Unknown notification type: " + notificationType);
        }
    }

    /**
     * Show notification in the notification bar
     */
    private void showNotification(RemoteMessage.Notification notification) {
        String title = notification.getTitle();
        String body = notification.getBody();

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // Create notification channel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Theeka Notifications",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Notifications from Theeka");
            notificationManager.createNotificationChannel(channel);
        }

        // Build notification
        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification) // Replace with your app icon
                .setContentTitle(title)
                .setContentText(body)
                .setAutoCancel(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setPriority(NotificationCompat.PRIORITY_HIGH);

        notificationManager.notify(0, notificationBuilder.build());
    }

    /**
     * Save FCM token to Firestore
     */
    private void saveFCMTokenToFirestore(String fcmToken) {
        FirebaseAuth auth = FirebaseAuth.getInstance();
        FirebaseFirestore db = FirebaseFirestore.getInstance();

        if (auth.getCurrentUser() != null) {
            String userId = auth.getCurrentUser().getUid();

            // Try to update in Customers collection
            db.collection("Customers")
                    .whereEqualTo("uid", userId)
                    .get()
                    .addOnSuccessListener(querySnapshot -> {
                        if (!querySnapshot.isEmpty()) {
                            DocumentSnapshot doc = querySnapshot.getDocuments().get(0);
                            Map<String, Object> updates = new HashMap<>();
                            updates.put("fcmToken", fcmToken);
                            updates.put("fcmTokenUpdated", com.google.firebase.firestore.FieldValue.serverTimestamp());

                            db.collection("Customers")
                                    .document(doc.getId())
                                    .update(updates)
                                    .addOnSuccessListener(aVoid -> Log.d(TAG, "FCM token saved for customer"))
                                    .addOnFailureListener(e -> Log.w(TAG, "Error saving token", e));
                        } else {
                            // Try ServiceProviders collection
                            updateServiceProviderToken(db, userId, fcmToken);
                        }
                    })
                    .addOnFailureListener(e -> Log.w(TAG, "Error querying customers", e));
        }
    }

    /**
     * Update FCM token for service provider
     */
    private void updateServiceProviderToken(FirebaseFirestore db, String userId, String fcmToken) {
        db.collection("ServiceProviders")
                .whereEqualTo("uid", userId)
                .get()
                .addOnSuccessListener(querySnapshot -> {
                    if (!querySnapshot.isEmpty()) {
                        DocumentSnapshot doc = querySnapshot.getDocuments().get(0);
                        Map<String, Object> updates = new HashMap<>();
                        updates.put("fcmToken", fcmToken);
                        updates.put("fcmTokenUpdated", com.google.firebase.firestore.FieldValue.serverTimestamp());

                        db.collection("ServiceProviders")
                                .document(doc.getId())
                                .update(updates)
                                .addOnSuccessListener(aVoid -> Log.d(TAG, "FCM token saved for provider"))
                                .addOnFailureListener(e -> Log.w(TAG, "Error saving token", e));
                    }
                })
                .addOnFailureListener(e -> Log.w(TAG, "Error querying providers", e));
    }
}

// Add to AndroidManifest.xml:
/*
<service
    android:name=".services.FCMService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
*/

// Also add these permissions to AndroidManifest.xml:
/*
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
*/
