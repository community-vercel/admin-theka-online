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

    const { token, title, body, data: payloadData } = data;

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
            data: payloadData || {},
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
