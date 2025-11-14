import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import 'dotenv/config';
import createRefreshHandler from './middleware/refreshToken.js';

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

    // bcryptjs doesn't return promises reliably; use synchronous API to avoid native build issues
    const hashedPassword = bcrypt.hashSync(password, 10);
        
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        // create refresh token and store in DB
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' });
        await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

    const valid = bcrypt.compareSync(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        // generate and save refresh token
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' });
        await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id } });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Refresh route to obtain new access token using a refresh token
app.post('/refresh', createRefreshHandler(prisma));

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

app.get('/users', authenticateToken, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true
            }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});