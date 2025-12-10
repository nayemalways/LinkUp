import admin from 'firebase-admin';
import path from 'path';

const serviceAccount = path.resolve(__dirname, '../config/firbase.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})


export default admin;