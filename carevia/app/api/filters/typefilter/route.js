// app/api/filters/type/route.js
/**
 * @swagger
 * tags:
 *   name: Filters
 *   description: Filters and lookup values
 */

/**
 * @swagger
 * /api/filters/type:
 *   get:
 *     summary: Get available goods types
 *     description: >
 *       Returns a list of distinct goods types used in donations.
 *       Used for filtering items by category.
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: List of available goods types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 types:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - Clothes
 *                     - Food
 *                     - Furniture
 *                     - Electronics
 *       500:
 *         description: Failed to fetch types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch types
 */


import connectDB from "@/app/_lib/mongodb"; // your MongoDB connection
import Goods from "@/app/_models/Goods"; // your Goods model

export async function GET(req) {
  try {
    await connectDB();

    // Get all distinct "Type" values from Goods collection
    const types = await Goods.distinct("Type");

    return new Response(JSON.stringify({ types }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching types:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch types" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
