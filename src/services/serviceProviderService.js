// src/services/serviceProviderService.js
import { db, collection, getDocs, doc, updateDoc } from './firebase';

export const serviceProviderService = {
  // Fetch all service providers
  async getServiceProviders() {
    try {
      const querySnapshot = await getDocs(collection(db, "ServiceProviders"));
      const serviceProviders = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Convert Firestore timestamp to readable date
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
        
        serviceProviders.push({
          id: doc.id,
          uid: data.uid,
          name: data.name || 'N/A',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          city: data.city || 'N/A',
          serviceCategory: data.serviceCategory || 'N/A',
          serviceType: data.serviceType || 'N/A',
          subcategories: data.subcategories || [],
          totalSubcategories: data.totalSubcategories || 0,
          cnicFront: data.cnicFront,
          cnicBack: data.cnicBack,
          profileImage: data.profileImage,
          accountStatus: data.accountStatus || 'pending',
          role: data.role || 'ServiceProvider',
          reason: data.reason || '',
          createdAt: createdAt,
          // Format date for display
          formattedDate: createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A'
        });
      });
      
      return serviceProviders;
    } catch (error) {
      console.error("Error fetching service providers:", error);
      throw error;
    }
  },

  // Update account status
  async updateAccountStatus(providerId, status, reason = '') {
    try {
      const providerRef = doc(db, "ServiceProviders", providerId);
      const updateData = {
        accountStatus: status,
        reviewedAt: new Date().toISOString()
      };
      
      if (reason) {
        updateData.reason = reason;
      }
      
      await updateDoc(providerRef, updateData);
      return { success: true, message: "Status updated successfully" };
    } catch (error) {
      console.error("Error updating account status:", error);
      throw error;
    }
  },

  // Get counts by status
  async getStatusCounts(providers) {
    return {
      total: providers.length,
      pending: providers.filter(p => p.accountStatus === 'pending').length,
      accepted: providers.filter(p => p.accountStatus === 'accepted').length,
      rejected: providers.filter(p => p.accountStatus === 'rejected').length
    };
  }
};