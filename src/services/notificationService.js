// src/services/notificationService.js
import { db, functions } from './firebase';
import { collection, doc, getDocs, query, where, updateDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export const notificationService = {
  /**
   * Send notification to a user via FCM
   * @param {string} userId - The user ID to send notification to
   * @param {object} notificationData - The notification data
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.body - Notification body
   * @param {object} notificationData.data - Additional data to send (optional)
   * @returns {Promise<object>} - Response from FCM
   */
  async sendNotification(userId, notificationData) {
    try {
      // Get user's FCM token from Firestore
      const fcmToken = await this.getUserFCMToken(userId);
      
      if (!fcmToken) {
        console.warn(`No FCM token found for user ${userId}`);
        return { success: false, message: 'No FCM token available' };
      }

      // Call Firebase Cloud Function to send notification
      const sendFCMNotification = httpsCallable(functions, 'sendFCMNotification');
      const response = await sendFCMNotification({
        token: fcmToken,
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {}
      });

      return { success: true, ...response.data };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send approval notification to user
   * @param {string} userId - The user ID
   * @param {string} userName - The user name
   * @param {string} userType - The user type (customer or service_provider)
   * @returns {Promise<object>}
   */
  async sendApprovalNotification(userId, userName, userType) {
    const title = 'Account Approved!';
    let body = `Your account has been approved. You can now use our services.`;
    
    if (userType === 'service_provider') {
      body = `Congratulations! Your service provider account has been approved. You can now accept service requests.`;
    }

    return this.sendNotification(userId, {
      title,
      body,
      data: {
        type: 'approval',
        userType,
        timestamp: new Date().toISOString()
      }
    });
  },

  /**
   * Send rejection notification to user
   * @param {string} userId - The user ID
   * @param {string} userName - The user name
   * @param {string} reason - The rejection reason
   * @returns {Promise<object>}
   */
  async sendRejectionNotification(userId, userName, reason = '') {
    let body = `Your account has been rejected.`;
    if (reason) {
      body += ` Reason: ${reason}`;
    }

    return this.sendNotification(userId, {
      title: 'Account Rejected',
      body,
      data: {
        type: 'rejection',
        reason,
        timestamp: new Date().toISOString()
      }
    });
  },

  /**
   * Get user's FCM token from Firestore
   * @param {string} userId - The user ID
   * @returns {Promise<string|null>} - The FCM token or null
   */
  async getUserFCMToken(userId) {
    try {
      // Check in Customers collection
      const customerDoc = await getDocs(
        query(collection(db, 'Customers'), where('uid', '==', userId))
      );
      
      if (!customerDoc.empty) {
        const data = customerDoc.docs[0].data();
        return data.fcmToken || null;
      }

      // Check in ServiceProviders collection
      const providerDoc = await getDocs(
        query(collection(db, 'ServiceProviders'), where('uid', '==', userId))
      );
      
      if (!providerDoc.empty) {
        const data = providerDoc.docs[0].data();
        return data.fcmToken || null;
      }

      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  },

  /**
   * Save or update user's FCM token
   * @param {string} userId - The user ID
   * @param {string} userType - The user type (customer or service_provider)
   * @param {string} fcmToken - The FCM token
   * @returns {Promise<void>}
   */
  async saveFCMToken(userId, userType, fcmToken) {
    try {
      const collectionName = userType === 'service_provider' ? 'ServiceProviders' : 'Customers';
      
      // Get the document ID by matching uid
      const querySnapshot = await getDocs(
        query(collection(db, collectionName), where('uid', '==', userId))
      );

      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(db, collectionName, docId), {
          fcmToken: fcmToken,
          fcmTokenUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  },

  /**
   * Send notification to multiple users
   * @param {Array<string>} userIds - Array of user IDs
   * @param {object} notificationData - The notification data
   * @returns {Promise<Array>} - Array of results
   */
  async sendBulkNotification(userIds, notificationData) {
    try {
      const promises = userIds.map(userId =>
        this.sendNotification(userId, notificationData)
      );
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      return [];
    }
  },

  /**
   * Broadcast notification to all users of a specific type
   * @param {string} userType - The user type (customer or service_provider)
   * @param {object} notificationData - The notification data
   * @returns {Promise<object>}
   */
  async broadcastNotification(userType, notificationData) {
    try {
      const collectionName = userType === 'service_provider' ? 'ServiceProviders' : 'Customers';
      const querySnapshot = await getDocs(
        query(collection(db, collectionName), where('fcmToken', '!=', null))
      );

      const userIds = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.uid) {
          userIds.push(data.uid);
        }
      });

      if (userIds.length === 0) {
        return { success: true, message: 'No users with FCM tokens found' };
      }

      const results = await this.sendBulkNotification(userIds, notificationData);
      return { 
        success: true, 
        sentTo: results.filter(r => r.success).length, 
        total: results.length 
      };
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      return { success: false, error: error.message };
    }
  }
};
