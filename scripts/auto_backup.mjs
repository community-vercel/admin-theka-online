import admin from "firebase-admin";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../service-account.json')));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "fixnow-8f2bb.firebasestorage.app"
});

const db = admin.firestore();
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.resolve(__dirname, '../backups/daily');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

async function runDailyBackup() {
    console.log(`🚀 Starting Daily Backup [${timestamp}]...`);
    const backupData = {};

    // 1. Backup Firestore
    const collections = ["ServiceProviders", "Customers", "Orders", "Reviews", "Ads"];
    for (const col of collections) {
        const snapshot = await db.collection(col).get();
        backupData[col] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    fs.writeFileSync(`${backupDir}/firestore_${timestamp}.json`, JSON.stringify(backupData));
    console.log("✅ Firestore Saved.");

    // 2. Backup Auth (Users)
    const listUsers = await admin.auth().listUsers();
    fs.writeFileSync(`${backupDir}/auth_users_${timestamp}.json`, JSON.stringify(listUsers.users));
    console.log("✅ Auth Users Saved.");

    console.log("✨ All data backed up successfully!");
}

runDailyBackup().catch(console.error);
