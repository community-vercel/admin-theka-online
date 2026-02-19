// src/services/dashboardService.js
import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";

export const dashboardService = {
  // Get total counts
  async getTotalCounts() {
    try {
      // Get total customers
      const customersSnapshot = await getCountFromServer(collection(db, "Customers"));
      const totalCustomers = customersSnapshot.data().count;

      // Get total service providers
      const providersSnapshot = await getCountFromServer(collection(db, "ServiceProviders"));
      const totalProviders = providersSnapshot.data().count;

      // Get pending verifications
      const pendingQuery = query(
        collection(db, "ServiceProviders"),
        where("accountStatus", "==", "pending")
      );
      const pendingSnapshot = await getCountFromServer(pendingQuery);
      const pendingVerification = pendingSnapshot.data().count;

      // Get accepted service providers
      const acceptedQuery = query(
        collection(db, "ServiceProviders"),
        where("accountStatus", "==", "accepted")
      );
      const acceptedSnapshot = await getCountFromServer(acceptedQuery);
      const acceptedProviders = acceptedSnapshot.data().count;

      return {
        totalCustomers,
        totalProviders,
        totalUsers: totalCustomers + totalProviders,
        pendingVerification,
        acceptedProviders
      };
    } catch (error) {
      console.error("Error getting total counts:", error);
      throw error;
    }
  },

  // Get city distribution
  async getCityDistribution() {
    try {
      const customers = await getDocs(collection(db, "Customers"));
      const providers = await getDocs(collection(db, "ServiceProviders"));

      const cityDistribution = {};

      // Process customers
      customers.forEach(doc => {
        const data = doc.data();
        const city = data.city || 'Unknown';
        cityDistribution[city] = (cityDistribution[city] || 0) + 1;
      });

      // Process service providers
      providers.forEach(doc => {
        const data = doc.data();
        const city = data.city || 'Unknown';
        cityDistribution[city] = (cityDistribution[city] || 0) + 1;
      });

      // Convert to array format for charts
      const cityData = Object.entries(cityDistribution).map(([name, value]) => ({
        name,
        users: value
      }));

      // Sort by count descending
      return cityData.sort((a, b) => b.users - a.users).slice(0, 10);
    } catch (error) {
      console.error("Error getting city distribution:", error);
      throw error;
    }
  },

  // Get service category distribution
  async getServiceCategoryDistribution() {
    try {
      const providers = await getDocs(collection(db, "ServiceProviders"));

      const categoryDistribution = {};

      providers.forEach(doc => {
        const data = doc.data();
        const category = data.serviceCategory || 'Unknown';
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
      });

      // Convert to array format for charts
      const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
        name,
        providers: value
      }));

      return categoryData.sort((a, b) => b.providers - a.providers);
    } catch (error) {
      console.error("Error getting service category distribution:", error);
      throw error;
    }
  },

  // Get verification status distribution
  async getVerificationDistribution() {
    try {
      const providers = await getDocs(collection(db, "ServiceProviders"));

      const statusCounts = {
        pending: 0,
        accepted: 0,
        rejected: 0
      };

      providers.forEach(doc => {
        const data = doc.data();
        const status = data.accountStatus || 'pending';
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });

      return [
        { name: 'Approved', value: statusCounts.accepted, color: '#10B981' },
        { name: 'Pending', value: statusCounts.pending, color: '#F59E0B' },
        { name: 'Rejected', value: statusCounts.rejected, color: '#EF4444' },
      ];
    } catch (error) {
      console.error("Error getting verification distribution:", error);
      throw error;
    }
  },

  // Get recent registrations (last 30 days)
  async getRecentRegistrations() {
    try {
      const customers = await getDocs(collection(db, "Customers"));
      const providers = await getDocs(collection(db, "ServiceProviders"));

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRegistrations = [];

      // Process customers
      customers.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        if (createdAt >= thirtyDaysAgo) {
          recentRegistrations.push({
            id: doc.id,
            name: data.name || 'Unknown',
            type: 'customer',
            date: createdAt,
            city: data.city || 'Unknown'
          });
        }
      });

      // Process service providers
      providers.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        if (createdAt >= thirtyDaysAgo) {
          recentRegistrations.push({
            id: doc.id,
            name: data.name || 'Unknown',
            type: 'service_provider',
            date: createdAt,
            city: data.city || 'Unknown'
          });
        }
      });

      // Sort by date descending
      return recentRegistrations
        .sort((a, b) => b.date - a.date)
        .slice(0, 10);
    } catch (error) {
      console.error("Error getting recent registrations:", error);
      throw error;
    }
  },

  // Get daily registration trend (last 7 days)
  async getRegistrationTrend() {
    try {
      const customers = await getDocs(collection(db, "Customers"));
      const providers = await getDocs(collection(db, "ServiceProviders"));

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      }).reverse();

      const dailyData = last7Days.map(date => {
        const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          day: dayStr,
          date: dateStr,
          customers: 0,
          providers: 0,
          total: 0
        };
      });

      // Process customers
      customers.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        const createdDate = new Date(createdAt);
        createdDate.setHours(0, 0, 0, 0);

        const index = last7Days.findIndex(date =>
          date.getTime() === createdDate.getTime()
        );

        if (index !== -1) {
          dailyData[index].customers++;
          dailyData[index].total++;
        }
      });

      // Process service providers
      providers.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        const createdDate = new Date(createdAt);
        createdDate.setHours(0, 0, 0, 0);

        const index = last7Days.findIndex(date =>
          date.getTime() === createdDate.getTime()
        );

        if (index !== -1) {
          dailyData[index].providers++;
          dailyData[index].total++;
        }
      });

      return dailyData;
    } catch (error) {
      console.error("Error getting registration trend:", error);
      throw error;
    }
  },

  // Get recent reviews and platform rating
  async getRecentReviews() {
    try {
      const completedSnapshot = await getDocs(collection(db, "completedRequests"));

      const customerReviews = []; // Reviews from Customers about Providers
      const providerReviews = []; // Reviews from Providers about Customers

      let totalRating = 0;
      let ratingCount = 0;

      // Pre-fetch all names to avoid multiple lookups (optimized for small to medium sets)
      const customersMap = {};
      const providersMap = {};

      try {
        const [custDocs, provDocs] = await Promise.all([
          getDocs(collection(db, "Customers")),
          getDocs(collection(db, "ServiceProviders"))
        ]);
        custDocs.forEach(doc => customersMap[doc.id] = doc.data().name);
        provDocs.forEach(doc => providersMap[doc.id] = doc.data().name);
      } catch (e) {
        console.warn("Could not pre-fetch user maps:", e);
      }

      completedSnapshot.forEach(doc => {
        const data = doc.data();

        // Resolve Names based on Firestore screenshot fields (userName/userId for customers, providerName/providerId for providers)
        const customerId = data.userId || data.customerId;
        const providerId = data.providerId;

        const finalCustomerName = data.userName || data.customerName || customersMap[customerId] || 'Anonymous Customer';
        const finalProviderName = data.providerName || providersMap[providerId] || data.service || 'Service Provider';

        // Use customerRating as the primary platform quality metric
        const customerRating = parseFloat(data.customerRating || data.userRating);
        if (!isNaN(customerRating)) {
          totalRating += customerRating;
          ratingCount++;
        }

        const date = data.completedAt?.toDate ? data.completedAt.toDate() :
          (data.ratedAt?.toDate ? data.ratedAt.toDate() : new Date());

        // Process Customer Reviews (Feedback for Providers)
        if (data.customerReview || data.customerRating) {
          customerReviews.push({
            id: doc.id,
            rating: data.customerRating || 0,
            review: data.customerReview || 'No comment provided',
            reviewerName: finalCustomerName,
            recipientName: finalProviderName,
            serviceName: data.service || 'General Service',
            date,
            imageUrl: data.userProfileImage || data.imageUrl || null
          });
        }

        // Process Provider Reviews (Feedback for Customers)
        if (data.providerReview || data.providerRating) {
          providerReviews.push({
            id: doc.id,
            rating: data.providerRating || 0,
            review: data.providerReview || 'No comment provided',
            reviewerName: finalProviderName,
            recipientName: finalCustomerName,
            serviceName: data.service || 'General Service',
            date,
            imageUrl: data.providerProfileImage || data.imageUrl || null
          });
        }
      });

      // Calculate average rating
      const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

      // Sort reviews by date descending
      const sortFn = (a, b) => b.date - a.date;
      const sortedCustomerReviews = customerReviews.sort(sortFn).slice(0, 10);
      const sortedProviderReviews = providerReviews.sort(sortFn).slice(0, 10);

      return {
        customerReviews: sortedCustomerReviews,
        providerReviews: sortedProviderReviews,
        averageRating,
        totalReviews: customerReviews.length + providerReviews.length
      };
    } catch (error) {
      console.error("Error getting recent reviews:", error);
      return { customerReviews: [], providerReviews: [], averageRating: 0, totalReviews: 0 };
    }
  },

  // Get recent mutual acceptances
  async getRecentAcceptances() {
    try {
      const completedSnapshot = await getDocs(
        query(
          collection(db, "completedRequests"),
          orderBy("acceptedAt", "desc"),
          limit(10)
        )
      );

      const acceptances = [];
      completedSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.acceptedAt) {
          acceptances.push({
            id: doc.id,
            userName: data.userName || "Customer",
            providerName: data.providerName || "Provider",
            service: data.service || "General Service",
            acceptedAt: data.acceptedAt?.toDate ? data.acceptedAt.toDate() : data.acceptedAt,
            status: data.status || "completed"
          });
        }
      });

      return acceptances;
    } catch (error) {
      console.error("Error getting recent acceptances:", error);
      return [];
    }
  },

  // Get single review details
  async getReviewDetails(reviewId) {
    try {
      const docRef = doc(db, "completedRequests", reviewId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Review not found");
      }

      const data = docSnap.data();

      // Basic formatting for dates
      const dates = {
        acceptedAt: data.acceptedAt?.toDate ? data.acceptedAt.toDate() : null,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        ratedAt: data.ratedAt?.toDate ? data.ratedAt.toDate() : null,
        ratedByCustomerAt: data.ratedByCustomerAt?.toDate ? data.ratedByCustomerAt.toDate() : null
      };

      return {
        id: docSnap.id,
        ...data,
        ...dates
      };
    } catch (error) {
      console.error("Error getting review details:", error);
      throw error;
    }
  }
};