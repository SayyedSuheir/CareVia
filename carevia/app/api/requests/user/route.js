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
