// src/services/orderService.js
import { db } from './firebase';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy
} from "firebase/firestore";

export const orderService = {
    /**
     * Get orders for a specific user (either as customer or provider)
     * @param {string} userId - ID of the user
     * @param {string} userType - 'customer' or 'service_provider'
     * @returns {Promise<Array>} - List of orders
     */
    async getOrdersByUser(userId, userType) {
        try {
            // For service providers, the field is providerId
            // For customers, the field might be customerId or userId (as seen in completedRequests screenshot)
            const collectionsToQuery = ["orders", "completedRequests"];
            const allOrders = [];

            for (const coll of collectionsToQuery) {
                const field = userType === 'service_provider' ? 'providerId' :
                    (coll === 'completedRequests' ? 'userId' : 'customerId');

                const q = query(
                    collection(db, coll),
                    where(field, "==", userId),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    allOrders.push({
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
                        formattedDate: data.createdAt?.toDate
                            ? data.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'
                    });
                });
            }

            // Remove duplicates (if any) and sort by date
            const uniqueOrders = Array.from(new Set(allOrders.map(o => o.id)))
                .map(id => allOrders.find(o => o.id === id))
                .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            return uniqueOrders;
        } catch (error) {
            console.error(`Error fetching orders for ${userType} ${userId}:`, error);
            return [];
        }
    },

    /**
     * Get all orders (for general monitoring)
     */
    async getAllOrders() {
        try {
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const orders = [];
            querySnapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() });
            });
            return orders;
        } catch (error) {
            console.error("Error fetching all orders:", error);
            return [];
        }
    },

    /**
     * Get all mutual acceptance logs from completed requests
     */
    async getAcceptanceLogs() {
        try {
            const q = query(
                collection(db, "completedRequests"),
                orderBy("acceptedAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const logs = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.acceptedAt) {
                    logs.push({
                        id: doc.id,
                        ...data,
                        acceptedAt: data.acceptedAt?.toDate ? data.acceptedAt.toDate() : data.acceptedAt,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
                    });
                }
            });
            return logs;
        } catch (error) {
            console.error("Error fetching acceptance logs:", error);
            return [];
        }
    },

    /**
     * Get single acceptance log by ID
     */
    async getAcceptanceLogById(id) {
        try {
            const docRef = doc(db, "completedRequests", id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                return {
                    id: snapshot.id,
                    ...data,
                    acceptedAt: data.acceptedAt?.toDate ? data.acceptedAt.toDate() : data.acceptedAt,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                    completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt
                };
            }
            return null;
        } catch (error) {
            console.error("Error fetching acceptance log:", error);
            throw error;
        }
    }
};
