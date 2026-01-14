// src/services/userService.js
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

export const userService = {
  // Fetch all customers
  async getCustomers() {
    try {
      const querySnapshot = await getDocs(collection(db, "Customers"));
      const customers = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
        
        customers.push({
          id: doc.id,
          uid: data.uid,
          name: data.name || 'N/A',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          city: data.city || 'N/A',
          role: data.role || 'customer',
          userType: 'customer',
          createdAt: createdAt,
          formattedDate: createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A',
          status: 'active',
          isVerified: true
        });
      });
      
      return customers;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Fetch all service providers
  async getServiceProviders() {
    try {
      const querySnapshot = await getDocs(collection(db, "ServiceProviders"));
      const providers = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
        
        // Determine if skilled or unskilled based on serviceCategory
        let serviceType = 'skilled'; // default
        const skilledCategories = ['Carpenter', 'Electrician', 'Fabricator', 'Painter', 'Plumber', 'Solar Panel Technicians', 'Welder'];
        const unskilledCategories = ['Aya (Baby Caretaker)', 'Gardener', 'Guard', 'Helper', 'Sweeper'];
        
        if (unskilledCategories.includes(data.serviceCategory)) {
          serviceType = 'unskilled';
        } else if (!skilledCategories.includes(data.serviceCategory)) {
          serviceType = 'other';
        }
        
        providers.push({
          id: doc.id,
          uid: data.uid,
          name: data.name || 'N/A',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          city: data.city || 'N/A',
          role: 'service_provider',
          userType: 'service_provider',
          serviceType: serviceType,
          serviceCategory: data.serviceCategory || 'N/A',
          subcategories: data.subcategories || [],
          accountStatus: data.accountStatus || 'pending',
          cnicFront: data.cnicFront,
          cnicBack: data.cnicBack,
          profileImage: data.profileImage,
          reason: data.reason || '',
          createdAt: createdAt,
          formattedDate: createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A',
          status: data.accountStatus === 'accepted' ? 'active' : 
                 data.accountStatus === 'pending' ? 'pending' : 'inactive',
          isVerified: data.accountStatus === 'accepted'
        });
      });
      
      return providers;
    } catch (error) {
      console.error("Error fetching service providers:", error);
      throw error;
    }
  },

  // Fetch all users (customers + service providers)
  async getAllUsers() {
    try {
      const [customers, providers] = await Promise.all([
        this.getCustomers(),
        this.getServiceProviders()
      ]);
      
      return [...customers, ...providers];
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const [customers, providers] = await Promise.all([
        this.getCustomers(),
        this.getServiceProviders()
      ]);
      
      const skilledProviders = providers.filter(p => p.serviceType === 'skilled');
      const unskilledProviders = providers.filter(p => p.serviceType === 'unskilled');
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const newToday = [...customers, ...providers].filter(user => {
        const createdDate = user.createdAt;
        return createdDate && createdDate >= startOfDay;
      }).length;
      
      return {
        totalCustomers: customers.length,
        totalProviders: providers.length,
        totalUsers: customers.length + providers.length,
        skilledProviders: skilledProviders.length,
        unskilledProviders: unskilledProviders.length,
        verifiedUsers: customers.length + providers.filter(p => p.isVerified).length,
        activeUsers: customers.length + providers.filter(p => p.status === 'active').length,
        newToday: newToday
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  },

  // Update user information
  async updateUser(userId, userType, data) {
    try {
      const collectionName = userType === 'customer' ? 'Customers' : 'ServiceProviders';
      const userRef = doc(db, collectionName, userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { success: true, message: "User updated successfully" };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId, userType) {
    try {
      const collectionName = userType === 'customer' ? 'Customers' : 'ServiceProviders';
      await deleteDoc(doc(db, collectionName, userId));
      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Search users
  async searchUsers(searchTerm) {
    const users = await this.getAllUsers();
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.serviceCategory && user.serviceCategory.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
};