import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { collection } from '../models/userModels.js';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '5h' }
  );
};

async function login(req, res) {
  const { user, password } = req.body;

  try {
    const existingUser = await collection.findOne({ user });
    if (!existingUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(existingUser);
    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function register(req, res) {
  const { user, password, email, name } = req.body;

  try {
    const existingUser = await collection.findOne({ user });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      user,
      name,
      email,
      password: hashedPassword,
      rol: 'Usuario', // Rol por defecto
      date_create: new Date()
    };

    const result = await collection.insertOne(newUser);
    const token = generateToken(newUser);

    res.status(201).json({ token });
  } catch (error) {
    console.error(`Error registering: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function logoutUser(req, res) {
  // Eliminar el token del cliente
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}

export { login, register, logoutUser };
