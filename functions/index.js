const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Existing FCM notification function
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

// Configure Nodemailer (Hardcoded Option 2)
const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'mr.ikramsatti@gmail.com',
        pass: 'fxoe chdc dlza fbee'
    }
});

// Send email to admin when a new Service Provider registers
exports.onServiceProviderCreate = functions.firestore
    .document('ServiceProviders/{providerId}')
    .onCreate(async (snap, context) => {
        const newValue = snap.data();
        const adminEmail = 'mr.ikramsatti@gmail.com';

        const mailOptions = {
            from: `"Theeka Platform" <mr.ikramsatti@gmail.com>`,
            to: adminEmail,
            subject: 'New Service Provider Registration Awaiting Approval',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #6366f1;">New Provider Alert 🔔</h2>
                    <p>A new service provider has just registered on the platform and requires your review.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                            <td style="padding: 8px 0;">${newValue.name || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Service:</td>
                            <td style="padding: 8px 0;">${newValue.service || newValue.category || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">City:</td>
                            <td style="padding: 8px 0;">${newValue.city || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                            <td style="padding: 8px 0;">${newValue.phoneNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold;">Registered:</td>
                            <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 30px;">
                        <a href="https://fixnow-8f2bb.web.app/verification" 
                           style="background-color: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                           Review in Admin Panel
                        </a>
                    </div>
                </div>
            `
        };

        try {
            await transport.sendMail(mailOptions);
            console.log(`Email notification sent to ${adminEmail} for provider ${context.params.providerId}`);
        } catch (error) {
            console.error('Error sending admin notification email:', error);
        }
    });
