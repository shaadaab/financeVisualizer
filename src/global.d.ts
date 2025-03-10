// src/global.d.ts
import { MongoClient } from 'mongodb';

declare global {
    let _mongoClientPromise: Promise<MongoClient>;
}