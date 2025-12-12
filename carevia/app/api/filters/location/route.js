import Goods from "@/app/_models/Goods";
import connectDB from "@/app/_lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const goods = await Goods.find({}, { city: 1 });

    const cityToRegion = {
      tyre: "South",
      saida: "South",
      sidon: "South",
      tripoli: "North",
      baalbek: "Beqaa",
      beirut: "Beirut",
      jounieh: "Mount Lebanon",
      zahle: "Beqaa"
    };

    const grouped = {};

    goods.forEach(item => {
      if (!item.city) return;

      const cityLower = item.city.toLowerCase();
      const region = cityToRegion[cityLower];
      if (!region) return;

      const cityName = item.city.charAt(0).toUpperCase() + item.city.slice(1);

      if (!grouped[region]) grouped[region] = [];
      if (!grouped[region].includes(cityName)) grouped[region].push(cityName);
    });

    // Sort cities
    const sortedGrouped = {};
    Object.keys(grouped).sort().forEach(region => {
      sortedGrouped[region] = grouped[region].sort();
    });

    return NextResponse.json({ locations: sortedGrouped });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load locations" }, { status: 500 });
  }
}
