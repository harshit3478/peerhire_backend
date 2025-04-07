import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid('freelancer', 'employer').required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const jobSchema = Joi.object({
  title: Joi.string().required().min(5).max(100),
  description: Joi.string().required().min(20),
  budget: Joi.number().required().min(0),
  duration: Joi.number().required().min(1),
  skillsRequired: Joi.array().items(Joi.string()).min(1).required()
});

export const bidSchema = Joi.object({
  bidAmount: Joi.number().required().min(0),
  timeline: Joi.number().required().min(1),
  message: Joi.string().required().min(20)
});