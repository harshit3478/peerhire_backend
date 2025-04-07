import express from 'express';
import { auth, verifyEmployer } from '../middleware/auth.js';
import Job from '../models/Job.js';
import { jobSchema } from '../validation/schemas.js';

const router = express.Router();

/**
 * @swagger
 * /jobs/create:
 *   post:
 *     summary: Create a new job posting (Employers only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - budget
 *               - duration
 *               - skillsRequired
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *               duration:
 *                 type: number
 *               skillsRequired:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post('/create', auth, verifyEmployer, async (req, res) => {
  try {
    const { error } = jobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const job = new Job({
      ...req.body,
      postedBy: req.user._id
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job posting' });
  }
});

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all job postings
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter by required skills (comma-separated)
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/src/validation/schemas.js'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { skills } = req.query;
    let query = {};

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query.skillsRequired = { $in: skillsArray };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

/**
 * @swagger
 * /jobs/{jobId}:
 *   get:
 *     summary: Get details of a specific job
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/src/validation/schemas.js'
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job details' });
  }
});

export default router;