// src/services/adsService.js
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  addDoc
} from "firebase/firestore";

export const adsService = {
  // Fetch all ads
  async getAds() {
    try {
      const querySnapshot = await getDocs(query(
        collection(db, "Ads"),
        orderBy("createdAt", "desc")
      ));
      
      const ads = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ads.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          details: data.details || '',
          link: data.link || '',
          bgColor: data.bgColor || '#3B82F6', // Default blue
          textColor: data.textColor || '#FFFFFF', // Default white
          isActive: data.isActive !== false,
          position: data.position || 'mobile',
          width: data.width || 40, // Fixed width 40px
          height: data.height || 20, // Fixed height 20px
          clicks: data.clicks || 0,
          impressions: data.impressions || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        });
      });
      
      return ads;
    } catch (error) {
      console.error("Error fetching ads:", error);
      throw error;
    }
  },

  // Create new ad
  async createAd(adData) {
    try {
      const adRef = await addDoc(collection(db, "Ads"), {
        title: adData.title,
        description: adData.description,
        details: adData.details,
        link: adData.link,
        bgColor: adData.bgColor,
        textColor: adData.textColor,
        isActive: adData.isActive !== false,
        position: adData.position || 'mobile',
        width: 40, // Fixed width for mobile ads
        height: 20, // Fixed height for mobile ads
        clicks: 0,
        impressions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      return { id: adRef.id, success: true };
    } catch (error) {
      console.error("Error creating ad:", error);
      throw error;
    }
  },

  // Update ad
  async updateAd(adId, adData) {
    try {
      const adRef = doc(db, "Ads", adId);
      const updateData = {
        title: adData.title,
        description: adData.description,
        details: adData.details,
        link: adData.link,
        bgColor: adData.bgColor,
        textColor: adData.textColor,
        isActive: adData.isActive,
        position: adData.position,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(adRef, updateData);
      return { success: true };
    } catch (error) {
      console.error("Error updating ad:", error);
      throw error;
    }
  },

  // Delete ad
  async deleteAd(adId) {
    try {
      const adRef = doc(db, "Ads", adId);
      await deleteDoc(adRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting ad:", error);
      throw error;
    }
  },

  // Track ad click
  async trackClick(adId) {
    try {
      const adRef = doc(db, "Ads", adId);
      const ad = await getDoc(adRef);
      
      if (ad.exists()) {
        const currentClicks = ad.data().clicks || 0;
        await updateDoc(adRef, {
          clicks: currentClicks + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  },

  // Track ad impression
  async trackImpression(adId) {
    try {
      const adRef = doc(db, "Ads", adId);
      const ad = await getDoc(adRef);
      
      if (ad.exists()) {
        const currentImpressions = ad.data().impressions || 0;
        await updateDoc(adRef, {
          impressions: currentImpressions + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error tracking impression:", error);
    }
  },

  // Get ad statistics
  async getAdStats() {
    try {
      const ads = await this.getAds();
      
      const stats = {
        total: ads.length,
        active: ads.filter(ad => ad.isActive).length,
        inactive: ads.filter(ad => !ad.isActive).length,
        totalClicks: ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0),
        totalImpressions: ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0),
        ctr: 0,
      };
      
      // Calculate CTR
      if (stats.totalImpressions > 0) {
        stats.ctr = ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2);
      }
      
      return stats;
    } catch (error) {
      console.error("Error getting ad stats:", error);
      throw error;
    }
  }
};