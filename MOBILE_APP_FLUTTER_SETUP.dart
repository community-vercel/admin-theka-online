// mobile-app-integration-example/flutter-setup.dart
// Flutter Firebase Messaging Setup
// Add to your Flutter project's lib folder

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class FCMService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static final FirebaseAuth _auth = FirebaseAuth.instance;

  /// Initialize Firebase Cloud Messaging
  static Future<void> initializeFCM() async {
    try {
      // Request user permission (iOS)
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carefullyProvisional: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        print('User granted permission');

        // Get the FCM token
        String? token = await _firebaseMessaging.getToken();
        print('FCM Token: $token');

        // Save token to Firestore
        if (_auth.currentUser != null && token != null) {
          await _saveFCMTokenToFirestore(_auth.currentUser!.uid, token);
        }

        // Listen for token refresh
        _firebaseMessaging.onTokenRefresh.listen((newToken) {
          print('FCM Token refreshed: $newToken');
          if (_auth.currentUser != null) {
            _saveFCMTokenToFirestore(_auth.currentUser!.uid, newToken);
          }
        });

        // Setup notification listeners
        setupNotificationListeners();
      }
    } catch (e) {
      print('Error initializing FCM: $e');
    }
  }

  /// Save FCM token to Firestore
  static Future<void> _saveFCMTokenToFirestore(String userId, String fcmToken) async {
    try {
      // Check in Customers collection
      QuerySnapshot customerQuery = await _firestore
          .collection('Customers')
          .where('uid', isEqualTo: userId)
          .get();

      if (customerQuery.docs.isNotEmpty) {
        await _firestore
            .collection('Customers')
            .doc(customerQuery.docs[0].id)
            .update({
              'fcmToken': fcmToken,
              'fcmTokenUpdated': FieldValue.serverTimestamp(),
            });
        return;
      }

      // Check in ServiceProviders collection
      QuerySnapshot providerQuery = await _firestore
          .collection('ServiceProviders')
          .where('uid', isEqualTo: userId)
          .get();

      if (providerQuery.docs.isNotEmpty) {
        await _firestore
            .collection('ServiceProviders')
            .doc(providerQuery.docs[0].id)
            .update({
              'fcmToken': fcmToken,
              'fcmTokenUpdated': FieldValue.serverTimestamp(),
            });
      }
    } catch (e) {
      print('Error saving FCM token: $e');
    }
  }

  /// Setup notification listeners
  static void setupNotificationListeners() {
    // Handle notification in foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');

      if (message.notification != null) {
        print('Message notification: ${message.notification}');
        _handleNotification(message);
      }
    });

    // Handle notification when app is opened from background
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('A new onMessageOpenedApp event was published!');
      print('Message data: ${message.data}');
      _handleNotification(message);
    });

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  /// Handle incoming notification
  static void _handleNotification(RemoteMessage message) {
    final notificationType = message.data['type'];
    
    switch (notificationType) {
      case 'approval':
        print('Account approved!');
        // Navigate to home/dashboard or show success dialog
        // Navigator.of(context).pushNamed('/dashboard');
        break;
      case 'rejection':
        final reason = message.data['reason'] ?? 'No reason provided';
        print('Account rejected: $reason');
        // Navigate to account settings or show error dialog
        // Navigator.of(context).pushNamed('/account');
        break;
      default:
        print('Unknown notification type');
    }
  }

  /// Background message handler (static function at top level)
  static Future<void> handleBackgroundMessage(RemoteMessage message) async {
    print('Handling a background message: ${message.messageId}');
    // Handle background notification
  }
}

/// Top-level function to handle background messages
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('Handling a background message: ${message.messageId}');
  // Call your notification handling logic
  FCMService._handleNotification(message);
}

/// Example usage in your main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize FCM
  await FCMService.initializeFCM();
  
  runApp(const MyApp());
}
