import { ObjectId } from 'mongodb';

export interface Transaction {
    _id?: ObjectId;
    amount: number;
    date: Date;
    description: string;
    category: string;
}

export interface Budget {
    _id?: ObjectId;
    category: string;
    amount: number; // Budget amount for the category
    month: string; // Format: "YYYY-MM"
}