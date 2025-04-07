import express from 'express';
import { auth, verifyFreelancer, verifyEmployer } from '../middleware/auth.js';
import Bid from '../models/Bid.js';
import Job from '../models/Job.js';
import { bidSchema } from '../validation/schemas.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Bid:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The bid ID
 *         job:
 *           type: string
 *           description: The job ID this bid is for
 *         freelancer:
 *           type: object
 *           description: The freelancer who placed the bid
 *         bidAmount:
 *           type: number
 *           description: The amount proposed for the job
 *         timeline:
 *           type: number
 *           description: Number of days to complete the job
 *         message:
 *           type: string
 *           description: Cover letter or proposal message
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           description: Current status of the bid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /bids/{jobId}:
 *   post:
 *     summary: Place a bid on a job (Freelancers only)
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the job to bid on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bidAmount:
 *                 type: number
 *                 description: Amount proposed for the job
 *               timeline:
 *                 type: number
 *                 description: Number of days to complete the job
 *               message:
 *                 type: string
 *                 description: Cover letter or proposal message
 *             required:
 *               - bidAmount
 *               - timeline
 *               - message
 *     responses:
 *       201:
 *         description: Bid placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bid'
 *       400:
 *         description: Invalid input or bid already exists
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Forbidden - User is not a freelancer
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.post('/:jobId', auth, verifyFreelancer, async (req, res) => {
  try {
    const { error } = bidSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status === 'closed') {
      return res.status(400).json({ message: 'This job is no longer accepting bids' });
    }

    const existingBid = await Bid.findOne({
      job: req.params.jobId,
      freelancer: req.user._id
    });

    if (existingBid) {
      return res.status(400).json({ message: 'You have already placed a bid on this job' });
    }

    const bid = new Bid({
      ...req.body,
      job: req.params.jobId,
      freelancer: req.user._id
    });

    await bid.save();
    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Error placing bid' });
  }
});

/**
 * @swagger
 * /bids/{jobId}:
 *   get:
 *     summary: Get all bids for a specific job
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the job to get bids for
 *     responses:
 *       200:
 *         description: List of bids
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bid'
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Access denied
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get('/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Only allow the job poster or the bidder to see the bids
    if (job.postedBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bids = await Bid.find({ job: req.params.jobId })
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bids' });
  }
});

/**
 * @swagger
 * /bids/{bidId}/accept:
 *   patch:
 *     summary: Accept a bid (Employers only)
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the bid to accept
 *     responses:
 *       200:
 *         description: Bid accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bid'
 *       400:
 *         description: Bid has already been processed
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Access denied - User is not the employer who posted the job
 *       404:
 *         description: Bid not found
 *       500:
 *         description: Server error
 */
router.patch('/:bidId/accept', auth, verifyEmployer, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId)
      .populate('job');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Bid has already been processed' });
    }

    bid.status = 'accepted';
    await bid.save();

    // Close the job
    await Job.findByIdAndUpdate(bid.job._id, { status: 'closed' });

    // Reject all other pending bids
    await Bid.updateMany(
      {
        job: bid.job._id,
        _id: { $ne: bid._id },
        status: 'pending'
      },
      { status: 'rejected' }
    );

    // Emit WebSocket event
    const io = req.app.get('io');
    io.emit('bidAccepted', {
      bidId: bid._id,
      jobId: bid.job._id,
      freelancerId: bid.freelancer.toString(),
      message: 'Your bid has been accepted!'
    });

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting bid' });
  }
});

/**
 * @swagger
 * /bids/{bidId}/reject:
 *   patch:
 *     summary: Reject a bid (Employers only)
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the bid to reject
 *     responses:
 *       200:
 *         description: Bid rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bid'
 *       400:
 *         description: Bid has already been processed
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *       403:
 *         description: Access denied - User is not the employer who posted the job
 *       404:
 *         description: Bid not found
 *       500:
 *         description: Server error
 */
router.patch('/:bidId/reject', auth, verifyEmployer, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId)
      .populate('job');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Bid has already been processed' });
    }

    bid.status = 'rejected';
    await bid.save();

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting bid' });
  }
});

export default router;