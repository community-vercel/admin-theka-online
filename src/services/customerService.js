// src/services/customerService.js
import { db, collection, getDocs, doc, updateDoc, deleteDoc } from './firebase';

export const customerService = {
  // Fetch all customers
  async getCustomers() {
    try {
      const querySnapshot = await getDocs(collection(db, "Customers"));
      const customers = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Convert Firestore timestamp to readable date
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
        
        customers.push({
          id: doc.id,
          uid: data.uid,
          name: data.name || 'N/A',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          city: data.city || 'N/A',
          role: data.role || 'customer',
          createdAt: createdAt,
          // Format date for display
          formattedDate: createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A',
          // Add status based on some criteria (you can customize this)
          status: 'active', // Default status
          isVerified: true // Default to verified
        });
      });
      
      return customers;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Update customer information
  async updateCustomer(customerId, data) {
    try {
      const customerRef = doc(db, "Customers", customerId);
      await updateDoc(customerRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { success: true, message: "Customer updated successfully" };
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  // Delete customer
  async deleteCustomer(customerId) {
    try {
      await deleteDoc(doc(db, "Customers", customerId));
      return { success: true, message: "Customer deleted successfully" };
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },

  // Get user statistics
  async getUserStats() {
    const customers = await this.getCustomers();
    return {
      total: customers.length,
      active: customers.length, // All customers are active by default
      verified: customers.length, // All customers are verified by default
      newToday: customers.filter(c => {
        const today = new Date();
        const createdDate = c.createdAt;
        return createdDate && 
               createdDate.getDate() === today.getDate() &&
               createdDate.getMonth() === today.getMonth() &&
               createdDate.getFullYear() === today.getFullYear();
      }).length
    };
  },

  // Search customers
  async searchCustomers(searchTerm) {
    const customers = await this.getCustomers();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};