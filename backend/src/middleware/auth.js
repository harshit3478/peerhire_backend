import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    // console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const verifyEmployer = (req, res, next) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ message: 'Access denied. Employers only.' });
  }
  next();
};

export const verifyFreelancer = (req, res, next) => {
  if (req.user.role !== 'freelancer') {
    return res.status(403).json({ message: 'Access denied. Freelancers only.' });
  }
  next();
};