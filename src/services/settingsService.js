// src/services/settingsService.js
import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  query,
  where
} from "firebase/firestore";

export const settingsService = {
  // Cities Management (unchanged)
  async getCities() {
    try {
      const citiesRef = doc(db, "Cities", "all_cities");
      const citiesSnapshot = await getDoc(citiesRef);

      if (citiesSnapshot.exists()) {
        const data = citiesSnapshot.data();
        return data.cityList || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  },

  async addCity(cityName) {
    try {
      const cities = await this.getCities();

      if (cities.includes(cityName)) {
        throw new Error('City already exists');
      }

      const updatedCities = [...cities, cityName].sort();

      const citiesRef = doc(db, "Cities", "all_cities");
      await setDoc(citiesRef, {
        cityList: updatedCities,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      return updatedCities;
    } catch (error) {
      console.error("Error adding city:", error);
      throw error;
    }
  },

  async deleteCity(cityName) {
    try {
      const cities = await this.getCities();
      const updatedCities = cities.filter(city => city !== cityName);

      const citiesRef = doc(db, "Cities", "all_cities");
      await setDoc(citiesRef, {
        cityList: updatedCities,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      return updatedCities;
    } catch (error) {
      console.error("Error deleting city:", error);
      throw error;
    }
  },

  // Service Categories Management
  async getServiceCategories() {
    try {
      // Fallback categories (matching userService.js and typical needs)
      const categories = {
        skilled: ['Carpenter', 'Electrician', 'Fabricator', 'Painter', 'Plumber', 'Solar Panel Technicians', 'Welder'],
        unskilled: ['Aya (Baby Caretaker)', 'Gardener', 'Guard', 'Helper', 'Sweeper']
      };

      // 1. Try to get the manifest document (metadata)
      const metadataRef = doc(db, "ServiceCategories", "metadata");
      const metadataSnap = await getDoc(metadataRef);

      if (metadataSnap.exists()) {
        const data = metadataSnap.data();
        if (data.skilled && Array.isArray(data.skilled)) categories.skilled = data.skilled.sort();
        if (data.unskilled && Array.isArray(data.unskilled)) categories.unskilled = data.unskilled.sort();
        return categories;
      }

      // 2. Try to get from the "Skilled" and "Unskilled" documents themselves as redundancy
      const skilledRef = doc(db, "ServiceCategories", "Skilled");
      const unskilledRef = doc(db, "ServiceCategories", "Unskilled");

      const [skilledSnap, unskilledSnap] = await Promise.all([
        getDoc(skilledRef),
        getDoc(unskilledRef)
      ]);

      if (skilledSnap.exists()) {
        const data = skilledSnap.data();
        const list = data.list || data.categories || data.Skilled || data.skilled;
        if (Array.isArray(list)) categories.skilled = [...new Set([...categories.skilled, ...list])].sort();
      }

      if (unskilledSnap.exists()) {
        const data = unskilledSnap.data();
        const list = data.list || data.categories || data.Unskilled || data.unskilled;
        if (Array.isArray(list)) categories.unskilled = [...new Set([...categories.unskilled, ...list])].sort();
      }

      return categories;
    } catch (error) {
      console.error("Error fetching service categories:", error);
      throw error;
    }
  },

  async addServiceCategory(categoryType, categoryName) {
    try {
      const categories = await this.getServiceCategories();
      const currentCategories = categories[categoryType];

      if (currentCategories.includes(categoryName)) {
        throw new Error('Category already exists');
      }

      const updatedCategories = [...currentCategories, categoryName].sort();

      // 1. Update the manifest document
      const metadataRef = doc(db, "ServiceCategories", "metadata");
      await setDoc(metadataRef, {
        [categoryType]: updatedCategories,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // 2. Update the type doc (Skilled/Unskilled)
      const typeDocRef = doc(db, "ServiceCategories", categoryType === 'skilled' ? 'Skilled' : 'Unskilled');
      await setDoc(typeDocRef, {
        list: updatedCategories,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // 3. Create the nested structure (ServiceCategories/{Type}/{Name}/{Name})
      const parentId = categoryType === 'skilled' ? 'Skilled' : 'Unskilled';
      const nestedRef = doc(db, "ServiceCategories", parentId, categoryName, categoryName);

      await setDoc(nestedRef, {
        name: categoryName,
        type: parentId,
        subcategories: [],
        createdAt: new Date().toISOString()
      });

      return { ...categories, [categoryType]: updatedCategories };
    } catch (error) {
      console.error("Error adding service category:", error);
      throw error;
    }
  },

  async deleteServiceCategory(categoryType, categoryName) {
    try {
      const categories = await this.getServiceCategories();
      const currentCategories = categories[categoryType];
      const updatedCategories = currentCategories.filter(cat => cat !== categoryName);

      // 1. Update manifest
      const metadataRef = doc(db, "ServiceCategories", "metadata");
      await setDoc(metadataRef, {
        [categoryType]: updatedCategories,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // 2. Update type doc
      const typeDocRef = doc(db, "ServiceCategories", categoryType === 'skilled' ? 'Skilled' : 'Unskilled');
      await setDoc(typeDocRef, {
        list: updatedCategories
      }, { merge: true });

      return { ...categories, [categoryType]: updatedCategories };
    } catch (error) {
      console.error("Error deleting service category:", error);
      throw error;
    }
  },

  async getSubcategories(categoryType, categoryName) {
    try {
      const parentId = categoryType === 'skilled' ? 'Skilled' : 'Unskilled';
      const docRef = doc(db, "ServiceCategories", parentId, categoryName, categoryName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data().subcategories || [];
      }
      // Document doesn't exist yet - return empty array (will be created on first update)
      return [];
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return [];
    }
  },

  async updateSubcategories(categoryType, categoryName, subcategories) {
    try {
      const parentId = categoryType === 'skilled' ? 'Skilled' : 'Unskilled';
      const docRef = doc(db, "ServiceCategories", parentId, categoryName, categoryName);

      // This will create the document if it doesn't exist, or update if it does
      await setDoc(docRef, {
        name: categoryName,
        type: parentId,
        subcategories: subcategories,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      return subcategories;
    } catch (error) {
      console.error("Error updating subcategories:", error);
      throw new Error(`Failed to update subcategories: ${error.message}`);
    }
  },

  // Helper function to debug Firestore structure
  async debugFirestoreStructure() {
    try {
      const categoriesSnapshot = await getDocs(collection(db, "ServiceCategories"));
      return categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
    } catch (error) {
      console.error('Debug error:', error);
      return [];
    }
  }
};
