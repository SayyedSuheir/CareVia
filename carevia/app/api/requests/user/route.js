// /api/requests/user
/**
 * @swagger
 * tags:
 *   name: RequestedItems
 *   description: Manage "Need It" requests for logged-in users
 */

/**
 * @swagger
 * /api/requests/user:
 *   get:
 *     summary: Get all requested items for the logged-in user
 *     description: Fetch all requested items with optional filters. Categorizes into active, expired, and picked up.
 *     tags: [RequestedItems]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, picked_up, expired, cancelled]
 *         description: Filter requests by status (optional)
 *       - in: query
 *         name: includeExpired
 *         schema:
 *           type: boolean
 *         description: Include expired items in results (default: false)
 *     responses:
 *       200:
 *         description: List of requested items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     all:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RequestedItem'
 *                     active:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RequestedItem'
 *                     expired:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RequestedItem'
 *                     pickedUp:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RequestedItem'
 *                 count:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     active:
 *                       type: integer
 *                     expired:
 *                       type: integer
 *                     pickedUp:
 *                       type: integer
 *       401:
 *         description: Unauthorized (not logged in)
 *       500:
 *         description: Internal server error
 *
 *   patch:
 *     summary: Update the status of a requested item
 *     description: Allows logged-in users to update their request status (pending, picked_up, expired, cancelled)
 *     tags: [RequestedItems]
 *     parameters:
 *       - in: query
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the requested item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, picked_up, expired, cancelled]
 *                 example: picked_up
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: Item marked as picked_up
 *       400:
 *         description: Missing or invalid parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found or unauthorized
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     RequestedItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         requestedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, picked_up, expired, cancelled]
 *         timeRemaining:
 *           type: integer
 *           description: Minutes remaining until expiration
 *         isExpired:
 *           type: boolean
 *         goods:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             image:
 *               type: string
 *             type:
 *               type: string
 *             address:
 *               type: string
 */

import RequestedItem from '@/app/_models/requesteditems';
import connectDB from '@/app/_lib/mongodb';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Utility: get logged-in user from JWT cookie
 */
async function getUserFromRequest(request) {
  try {
    const token = request.cookies.get('sessionToken')?.value;
    if (!token) return null;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT secret missing');

    const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    return decoded; // contains userId, email, phoneNumber, role
  } catch (err) {
    console.error('❌ getUserFromRequest error:', err);
    return null;
  }
}

/**
 * GET /api/requested-items/user
 * Fetch all requested items for the logged-in user
 */
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // optional filter
    const includeExpired = searchParams.get('includeExpired') === 'true';

    await connectDB();

    const query = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) query.status = status;
    if (!includeExpired) query.expiresAt = { $gt: new Date() };

    const requestedItems = await RequestedItem.find(query)
      .populate({ path: 'goodsId', select: 'name description image Type address createdAt' })
      .sort({ requestedAt: -1 })
      .lean();

    const formattedItems = requestedItems.map(item => {
      const timeRemaining = item.expiresAt
        ? Math.max(0, Math.floor((new Date(item.expiresAt) - new Date()) / 1000 / 60))
        : 0;

      return {
        id: item._id.toString(),
        requestedAt: item.requestedAt,
        expiresAt: item.expiresAt,
        status: item.status,
        timeRemaining,
        isExpired: timeRemaining === 0,
        goods: item.goodsId
          ? {
              id: item.goodsId._id.toString(),
              name: item.goodsId.name,
              description: item.goodsId.description,
              image: item.goodsId.image,
              type: item.goodsId.Type,
              address: item.goodsId.address,
            }
          : null,
      };
    });

    const activeItems = formattedItems.filter(i => !i.isExpired && i.status === 'pending');
    const expiredItems = formattedItems.filter(i => i.isExpired || i.status === 'expired');
    const pickedUpItems = formattedItems.filter(i => i.status === 'picked_up');

    return NextResponse.json({
      success: true,
      data: { all: formattedItems, active: activeItems, expired: expiredItems, pickedUp: pickedUpItems },
      count: {
        total: formattedItems.length,
        active: activeItems.length,
        expired: expiredItems.length,
        pickedUp: pickedUpItems.length,
      },
    });
  } catch (err) {
    console.error('❌ Error fetching requested items:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/requested-items/user?itemId=xxx
 * Update status of a requested item
 */
export async function PATCH(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const body = await request.json();
    const { status } = body;

    if (!itemId) return NextResponse.json({ success: false, error: 'itemId is required' }, { status: 400 });
    if (!status || !['pending', 'picked_up', 'expired', 'cancelled'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Valid status is required (pending, picked_up, expired, cancelled)',
      }, { status: 400 });
    }

    await connectDB();

    const updatedItem = await RequestedItem.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(itemId), userId: new mongoose.Types.ObjectId(userId) },
      { status, ...(status === 'picked_up' && { pickedUpAt: new Date() }) },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ success: false, error: 'Item not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { id: updatedItem._id.toString(), status: updatedItem.status, updatedAt: updatedItem.updatedAt },
      message: `Item marked as ${status}`,
    });
  } catch (err) {
    console.error('❌ Error updating requested item:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
