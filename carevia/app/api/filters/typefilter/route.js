// app/api/filters/type/route.js
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
