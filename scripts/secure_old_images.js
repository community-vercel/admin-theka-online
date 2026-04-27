// scripts/secure_old_images.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file for configuration
function readEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const config = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            config[key.trim()] = value.trim();
        }
    });
    return config;
}

const env = readEnv();

const firebaseConfig = {
    apiKey: env.VITE_APP_API_KEY,
    authDomain: env.VITE_APP_AUTH_DOMAIN,
    projectId: env.VITE_APP_PROJECT_ID,
    storageBucket: env.VITE_APP_STORAGE_BUCKET,
    messagingSenderId: env.VITE_APP_MESSAGING_SENDER_ID,
    appId: env.VITE_APP_APP_ID
};

// Helper: Extract relative Storage Path from a public URL
function extractPathFromUrl(url) {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) return url;
    try {
        // Find the text between /o/ and ?
        const parts = url.split('/o/')[1].split('?')[0];
        // Decode things like %2F back to /
        return decodeURIComponent(parts);
    } catch (e) {
        console.warn(`Could not extract path from URL: ${url}`);
        return url;
    }
}

async function runSecurityCleanup() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const collections = ["Customers", "ServiceProviders"];
        let totalCount = 0;

        console.log("🔒 Starting Security Cleanup: Converting public URLs to private paths...");

        for (const colName of collections) {
            console.log(`\nScanning collection: ${colName}...`);
            const querySnapshot = await getDocs(collection(db, colName));
            
            for (const userDoc of querySnapshot.docs) {
                const data = userDoc.data();
                const updates = {};
                const fields = ['cnicFront', 'cnicBack', 'profileImage'];

                fields.forEach(field => {
                    const value = data[field];
                    if (value && typeof value === 'string' && value.startsWith('http')) {
                        const newPath = extractPathFromUrl(value);
                        if (newPath !== value) {
                            updates[field] = newPath;
                        }
                    }
                });

                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, colName, userDoc.id), updates);
                    totalCount++;
                    console.log(`✅ Secured document: ${userDoc.id} (${data.name || 'No Name'})`);
                }
            }
        }

        console.log(`\n✨ SECURITY CLEANUP COMPLETE!`);
        console.log(`🔒 Successfully converted ${totalCount} records.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Cleanup failed:", error);
        process.exit(1);
    }
}

runSecurityCleanup();
