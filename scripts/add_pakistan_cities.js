// scripts/add_pakistan_cities.js
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read .env file
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
    appId: env.VITE_APP_APP_ID,
    measurementId: env.VITE_APP_MEASUREMENT_ID
};

const pakistaniCities = {
    Punjab: [
        "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Bahawalpur",
        "Sargodha", "Sialkot", "Sheikhupura", "Rahim Yar Khan", "Jhang",
        "Dera Ghazi Khan", "Gujrat", "Sahiwal", "Kasur", "Okara", "Chiniot",
        "Hafizabad", "Ahmedpur East", "Attock", "Bahawalnagar", "Bhakkar", "Bhalwal",
        "Bhawana", "Chakwal", "Chichawatni", "Jhelum", "Khanewal", "Khushab",
        "Kot Momin", "Lalamusa", "Lalian", "Layyah", "Mandi Bahauddin", "Mian Channu",
        "Muridke", "Muzaffargarh", "Pakpattan", "Sadiqabad", "Toba Tek Singh", "Vehari", "Wazirabad"
    ],
    Sindh: [
        "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah", "Kotri",
        "Mirpur Khas", "Shikarpur", "Jacobabad", "Badin", "Ghotki", "Dadu", "Digri",
        "Diplo", "Dokri", "Haala", "Islamkot", "Jamshoro", "Kandhkot", "Kandiaro",
        "Kashmore", "Keti Bandar", "Khairpur", "Matiari", "Mehar", "Mehrabpur",
        "Mithani", "Mithi", "Moro", "Nagarparkar", "Naudero", "Naushahro Feroze",
        "Qambar", "Qasimabad", "Ranipur", "Ratodero", "Rohri", "Sakrand", "Sanghar",
        "Shahbandar", "Shahdadkot", "Shahdadpur", "Shahpur Chakar", "Sujawal",
        "Tando Adam Khan", "Tando Allahyar", "Tando Muhammad Khan", "Thatta", "Umerkot", "Warah"
    ],
    KPK: [
        "Peshawar", "Mardan", "Mingora", "Kohat", "Abbottabad", "Dera Ismail Khan",
        "Swabi", "Nowshera", "Mansehra", "Charsadda", "Bannu", "Batkhela",
        "Battagram", "Chitral", "Dir", "Hangu", "Haripur", "Havelian", "Kalam",
        "Karak", "Lakki Marwat", "Malakand", "Risalpur", "Saidu Sharif", "Swat",
        "Timergara", "Tank", "Wana"
    ],
    Balochistan: [
        "Quetta", "Khuzdar", "Hub", "Chaman", "Gwadar", "Turbat", "Sibi", "Zhob",
        "Awaran", "Barkhan", "Bela", "Bhag", "Chagai", "Dalbandin", "Dera Allah Yar",
        "Dera Bugti", "Dera Murad Jamali", "Harnai", "Kalat", "Kharan", "Kohlu",
        "Loralai", "Mastung", "Nushki", "Panjgur", "Pishin", "Usta Muhammad", "Ziarat"
    ],
    AJK: [
        "Muzaffarabad", "Mirpur", "Kotli", "Rawalakot", "Bagh", "Bhimber",
        "Hattian Bala", "Haveli", "Sudhanoti", "Neelum Valley", "Dadyal", "Palandri"
    ],
    GilgitBaltistan: [
        "Gilgit", "Skardu", "Chilas", "Gahkuch", "Khaplu", "Astore", "Hunza"
    ],
    Federal: [
        "Islamabad"
    ]
};

// Flatten the list
const allCitiesList = Object.values(pakistaniCities).flat().sort();

async function addCities() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log("Connecting to Firestore...");
        const citiesRef = doc(db, "Cities", "all_cities");
        const citiesSnapshot = await getDoc(citiesRef);

        let existingCities = [];
        if (citiesSnapshot.exists()) {
            existingCities = citiesSnapshot.data().cityList || [];
            console.log(`Found ${existingCities.length} existing cities.`);
        } else {
            console.log("Cities document does not exist. Creating new one.");
        }

        // Merge and remove duplicates
        const mergedCities = [...new Set([...existingCities, ...allCitiesList])].sort();

        console.log(`Adding ${mergedCities.length - existingCities.length} new cities. Total will be ${mergedCities.length}.`);

        await setDoc(citiesRef, {
            cityList: mergedCities,
            lastUpdated: new Date().toISOString()
        }, { merge: true });

        console.log("✅ Successfully updated cities list in Firestore!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error updating cities:", error);
        process.exit(1);
    }
}

addCities();
