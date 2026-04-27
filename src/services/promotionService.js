// src/services/promotionService.js
import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  addDoc
} from "firebase/firestore";

export const promotionService = {
  // Fetch all promotions (formerly ads)
  async getPromotions() {
    try {
      const querySnapshot = await getDocs(query(
        collection(db, "Ads"),
        orderBy("createdAt", "desc")
      ));

      const promotions = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        promotions.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          details: data.details || '',
          link: data.link || '',
          bgColor: data.bgColor || '#3B82F6', // Default blue
          textColor: data.textColor || '#FFFFFF', // Default white
          isActive: data.isActive !== false,
          position: data.position || 'mobile',
          companyLogo: data.companyLogo || '',
          width: data.width || 300,
          height: data.height || 50, // Fixed height 50px
          clicks: data.clicks || 0,
          impressions: data.impressions || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        });
      });

      return promotions;
    } catch (error) {
      console.error("Error fetching promotions:", error);
      throw error;
    }
  },

  // Create new promotion
  async createPromotion(promoData) {
    try {
      const promoRef = await addDoc(collection(db, "Ads"), {
        title: promoData.title,
        description: promoData.description,
        details: promoData.details,
        link: promoData.link,
        bgColor: promoData.bgColor,
        textColor: promoData.textColor,
        isActive: promoData.isActive !== false,
        position: promoData.position || 'mobile',
        companyLogo: promoData.companyLogo || '',
        width: 300,
        height: 50, // Fixed height for mobile ads
        clicks: 0,
        impressions: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return { id: promoRef.id, success: true };
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw error;
    }
  },

  // Update promotion
  async updatePromotion(promoId, promoData) {
    try {
      const promoRef = doc(db, "Ads", promoId);
      const updateData = {
        title: promoData.title,
        description: promoData.description,
        details: promoData.details,
        link: promoData.link,
        bgColor: promoData.bgColor,
        textColor: promoData.textColor,
        isActive: promoData.isActive,
        position: promoData.position,
        companyLogo: promoData.companyLogo || '',
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(promoRef, updateData);
      return { success: true };
    } catch (error) {
      console.error("Error updating promotion:", error);
      throw error;
    }
  },

  // Delete promotion
  async deletePromotion(promoId) {
    try {
      const promoRef = doc(db, "Ads", promoId);
      await deleteDoc(promoRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting promotion:", error);
      throw error;
    }
  },

  // Track promotion click
  async trackClick(promoId) {
    try {
      const promoRef = doc(db, "Ads", promoId);
      const promoDoc = await getDoc(promoRef);

      if (promoDoc.exists()) {
        const currentClicks = promoDoc.data().clicks || 0;
        await updateDoc(promoRef, {
          clicks: currentClicks + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  },

  // Track promotion impression
  async trackImpression(promoId) {
    try {
      const promoRef = doc(db, "Ads", promoId);
      const promoDoc = await getDoc(promoRef);

      if (promoDoc.exists()) {
        const currentImpressions = promoDoc.data().impressions || 0;
        await updateDoc(promoRef, {
          impressions: currentImpressions + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error tracking impression:", error);
    }
  },

  // Get promotion statistics
  async getPromotionStats() {
    try {
      const promotions = await this.getPromotions();

      const stats = {
        total: promotions.length,
        active: promotions.filter(p => p.isActive).length,
        inactive: promotions.filter(p => !p.isActive).length,
        totalClicks: promotions.reduce((sum, p) => sum + (p.clicks || 0), 0),
        totalImpressions: promotions.reduce((sum, p) => sum + (p.impressions || 0), 0),
        ctr: 0,
      };

      // Calculate CTR
      if (stats.totalImpressions > 0) {
        stats.ctr = ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2);
      }

      return stats;
    } catch (error) {
      console.error("Error getting promotion stats:", error);
      throw error;
    }
  }
};
