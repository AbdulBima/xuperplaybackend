// controllers/temporaryCompanyController.ts

import { Request, Response } from 'express';
import TemporaryCompany from '../models/tempCompany.model';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; 


const JWT_SECRET = process.env.JWT_SECRET || "mistemonma"; // Replace with your actual secret key

// Create a temporary company and set a JWT token
export const createTemporaryCompany = async (req: Request, res: Response): Promise<Response> => {
  try {
    
    const { email } = req.body;
    const buid = uuidv4();



    // Check if the company already exists
    const existingCompany = await TemporaryCompany.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company with this email already exists' });
    }

    // Create a new JWT token
    const token = jwt.sign({ email, buid }, JWT_SECRET, { expiresIn: '1h' });

    // Create a new temporary company
    const newCompany = new TemporaryCompany({
      email,
      buid,
      token,
    });

    // Save the new company to the database
    await newCompany.save();

    // Return the new company details (excluding token)
    return res.status(201).json({
      message: 'Temporary company created successfully',
      company: {
        email: newCompany.email,
        buid: newCompany.buid,
      },
      token, // Return the token if you need to send it back to the client
    });
  } catch (error) {
    console.error('Error creating temporary company:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



