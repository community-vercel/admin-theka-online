// scripts/db_backup.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read .env file for configuration
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

// List of collections we want to back up
const collectionsToBackup = [
    "ServiceProviders",
    "Customers",
    "Cities",
    "Reviews",
    "Ads",
    "AcceptanceLogs",
    "Orders",
    "Notifications",
    "ServiceCategories"
];

async function runBackup() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const fullBackup = {};

        console.log("📂 Starting full Firestore backup...");

        for (const colName of collectionsToBackup) {
            console.log(`📡 Fetching collection: ${colName}...`);
            const querySnapshot = await getDocs(collection(db, colName));
            fullBackup[colName] = [];
            
            querySnapshot.forEach((doc) => {
                fullBackup[colName].push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log(`✅ Saved ${fullBackup[colName].length} documents from ${colName}.`);
        }

        // Create backups directory if it doesn't exist
        const backupDir = path.resolve(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `firestore_backup_${timestamp}.json`);
        
        fs.writeFileSync(backupPath, JSON.stringify(fullBackup, null, 2));

        console.log(`\n✨ BACKUP COMPLETE!`);
        console.log(`📄 Location: ${backupPath}`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Backup failed:", error);
        process.exit(1);
    }
}

runBackup();
