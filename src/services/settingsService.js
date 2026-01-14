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

  // Service Categories Management - UPDATED FOR YOUR STRUCTURE
  async getServiceCategories() {
    try {
      console.log('Fetching service categories...');
      
      const categories = {
        skilled: [],
        unskilled: []
      };
      
      // Try to get all documents in ServiceCategories collection
      const categoriesSnapshot = await getDocs(collection(db, "ServiceCategories"));
      
      console.log('Total ServiceCategories documents:', categoriesSnapshot.size);
      
      categoriesSnapshot.forEach((doc) => {
        console.log(`Document ID: ${doc.id}`);
        const data = doc.data();
        console.log('Document data:', data);
        
        // Check if this document has the structure we expect
        // Based on your hierarchy, the document might contain both skilled and unskilled fields
        if (data.Skilled && Array.isArray(data.Skilled)) {
          console.log('Found Skilled array:', data.Skilled);
          categories.skilled = [...new Set([...categories.skilled, ...data.Skilled])].sort();
        }
        
        if (data.Unskilled && Array.isArray(data.Unskilled)) {
          console.log('Found Unskilled array:', data.Unskilled);
          categories.unskilled = [...new Set([...categories.unskilled, ...data.Unskilled])].sort();
        }
        
        // Also check for lowercase field names
        if (data.skilled && Array.isArray(data.skilled)) {
          console.log('Found skilled array (lowercase):', data.skilled);
          categories.skilled = [...new Set([...categories.skilled, ...data.skilled])].sort();
        }
        
        if (data.unskilled && Array.isArray(data.unskilled)) {
          console.log('Found unskilled array (lowercase):', data.unskilled);
          categories.unskilled = [...new Set([...categories.unskilled, ...data.unskilled])].sort();
        }
        
        // Check for numbered fields (0, 1, 2, etc.) which might contain category names
        Object.keys(data).forEach(key => {
          const value = data[key];
          if (typeof value === 'string') {
            // Check if it's a skilled category (you might need to adjust this logic)
            const skilledKeywords = ['Carpenter', 'Electrician', 'Fabricator', 'Painter', 'Plumber', 'Solar Panel Technicians', 'Welder'];
            const unskilledKeywords = ['Aya (Baby Caretaker)', 'Gardener', 'Guard', 'Helper', 'Sweeper'];
            
            if (skilledKeywords.includes(value)) {
              categories.skilled = [...new Set([...categories.skilled, value])].sort();
            } else if (unskilledKeywords.includes(value)) {
              categories.unskilled = [...new Set([...categories.unskilled, value])].sort();
            }
          }
        });
      });
      
      console.log('Final categories:', categories);
      return categories;
    } catch (error) {
      console.error("Error fetching service categories:", error);
      throw error;
    }
  },

  // Alternative: If there's a specific document ID
  async getServiceCategoriesAlternative() {
    try {
      // Try to get a document with ID that contains categories
      // Common document IDs might be: "categories", "services", "types", etc.
      const possibleDocIds = ['categories', 'services', 'serviceTypes', 'types', 'allCategories'];
      
      const categories = {
        skilled: [],
        unskilled: []
      };
      
      for (const docId of possibleDocIds) {
        try {
          const docRef = doc(db, "ServiceCategories", docId);
          const docSnapshot = await getDoc(docRef);
          
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            console.log(`Found document ${docId}:`, data);
            
            if (data.Skilled && Array.isArray(data.Skilled)) {
              categories.skilled = [...new Set([...categories.skilled, ...data.Skilled])].sort();
            }
            
            if (data.Unskilled && Array.isArray(data.Unskilled)) {
              categories.unskilled = [...new Set([...categories.unskilled, ...data.Unskilled])].sort();
            }
            
            if (data.skilled && Array.isArray(data.skilled)) {
              categories.skilled = [...new Set([...categories.skilled, ...data.skilled])].sort();
            }
            
            if (data.unskilled && Array.isArray(data.unskilled)) {
              categories.unskilled = [...new Set([...categories.unskilled, ...data.unskilled])].sort();
            }
          }
        } catch (error) {
          console.log(`Document ${docId} not found or error:`, error.message);
        }
      }
      
      // If still empty, try to get all documents and look for any with Skilled/Unskilled fields
      if (categories.skilled.length === 0 && categories.unskilled.length === 0) {
        const allDocs = await getDocs(collection(db, "ServiceCategories"));
        
        allDocs.forEach((doc) => {
          const data = doc.data();
          
          // Look for Skilled field
          if (data.Skilled && Array.isArray(data.Skilled)) {
            categories.skilled = [...new Set([...categories.skilled, ...data.Skilled])].sort();
          }
          
          // Look for Unskilled field
          if (data.Unskilled && Array.isArray(data.Unskilled)) {
            categories.unskilled = [...new Set([...categories.unskilled, ...data.Unskilled])].sort();
          }
          
          // Look for skilled field (lowercase)
          if (data.skilled && Array.isArray(data.skilled)) {
            categories.skilled = [...new Set([...categories.skilled, ...data.skilled])].sort();
          }
          
          // Look for unskilled field (lowercase)
          if (data.unskilled && Array.isArray(data.unskilled)) {
            categories.unskilled = [...new Set([...categories.unskilled, ...data.unskilled])].sort();
          }
        });
      }
      
      return categories;
    } catch (error) {
      console.error("Error fetching service categories (alternative):", error);
      throw error;
    }
  },

  async addServiceCategory(categoryType, categoryName) {
    try {
      // First, get the current structure
      const categories = await this.getServiceCategories();
      const currentCategories = categories[categoryType];
      
      if (currentCategories.includes(categoryName)) {
        throw new Error('Category already exists');
      }
      
      const updatedCategories = [...currentCategories, categoryName].sort();
      
      // We need to update the document that contains the categories
      // First, find which document has the categories
      const categoriesSnapshot = await getDocs(collection(db, "ServiceCategories"));
      let targetDocId = null;
      let targetDocData = null;
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.Skilled || data.skilled || data.Unskilled || data.unskilled) {
          targetDocId = doc.id;
          targetDocData = data;
        }
      });
      
      if (!targetDocId) {
        // No existing document found, create a new one
        targetDocId = 'serviceCategories';
        targetDocData = {};
      }
      
      // Update the data
      const fieldName = categoryType === 'skilled' ? 'Skilled' : 'Unskilled';
      targetDocData[fieldName] = updatedCategories;
      
      // Update in Firestore
      const categoryRef = doc(db, "ServiceCategories", targetDocId);
      await setDoc(categoryRef, targetDocData, { merge: true });
      
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
      
      // Find which document has the categories
      const categoriesSnapshot = await getDocs(collection(db, "ServiceCategories"));
      let targetDocId = null;
      let targetDocData = null;
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.Skilled || data.skilled || data.Unskilled || data.unskilled) {
          targetDocId = doc.id;
          targetDocData = data;
        }
      });
      
      if (!targetDocId) {
        throw new Error('No service categories document found');
      }
      
      // Update the data
      const fieldName = categoryType === 'skilled' ? 'Skilled' : 'Unskilled';
      targetDocData[fieldName] = updatedCategories;
      
      // Update in Firestore
      const categoryRef = doc(db, "ServiceCategories", targetDocId);
      await setDoc(categoryRef, targetDocData, { merge: true });
      
      return { ...categories, [categoryType]: updatedCategories };
    } catch (error) {
      console.error("Error deleting service category:", error);
      throw error;
    }
  },

  // Helper function to debug Firestore structure
  async debugFirestoreStructure() {
    try {
      console.log('=== DEBUG: Firestore Structure ===');
      
      // Check ServiceCategories collection
      const categoriesSnapshot = await getDocs(collection(db, "ServiceCategories"));
      console.log(`ServiceCategories has ${categoriesSnapshot.size} documents:`);
      
      categoriesSnapshot.forEach((doc) => {
        console.log(`Document ID: ${doc.id}`);
        console.log('Document data:', doc.data());
        console.log('Document fields:', Object.keys(doc.data()));
        console.log('---');
      });
      
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