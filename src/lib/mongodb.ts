import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const options = {
    tls: true, // Enable TLS/SSL
    tlsAllowInvalidCertificates: false, // Do not allow invalid certificates
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the MongoClient instance
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, create a new MongoClient instance
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;