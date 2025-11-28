import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface SpeciesRecord {
  species_key: number;
  occurrence_count: number;
}

let cachedData: SpeciesRecord[] | null = null;

async function loadData(): Promise<SpeciesRecord[]> {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), "public", "plant_species_counts.csv");
  const fileContent = await fs.readFile(filePath, "utf-8");
  const lines = fileContent.trim().split("\n");

  cachedData = lines.slice(1).map((line) => {
    const [species_key, occurrence_count] = line.split(",");
    return {
      species_key: parseInt(species_key, 10),
      occurrence_count: parseInt(occurrence_count, 10),
    };
  });

  return cachedData;
}

function computeDataDeficientHistogram(counts: number[], maxOccurrences: number = 100) {
  const dataDeficient = counts.filter((c) => c <= maxOccurrences);
  const bins: { occurrenceCount: number; count: number }[] = [];

  for (let i = 1; i <= maxOccurrences; i++) {
    const count = dataDeficient.filter((c) => c === i).length;
    bins.push({
      occurrenceCount: i,
      count,
    });
  }

  return { bins, total: dataDeficient.length };
}

function computeCategoryPieChart(counts: number[]) {
  return [
    { name: "1-10 occurrences", value: counts.filter((c) => c >= 1 && c <= 10).length, color: "#ef4444" },
    { name: "11-100 occurrences", value: counts.filter((c) => c > 10 && c <= 100).length, color: "#f97316" },
    { name: "101-1000 occurrences", value: counts.filter((c) => c > 100 && c <= 1000).length, color: "#eab308" },
    { name: ">1000 occurrences", value: counts.filter((c) => c > 1000).length, color: "#3b82f6" },
  ];
}

export async function GET() {
  const data = await loadData();
  const counts = data.map((d) => d.occurrence_count);

  const dataDeficientHistogram = computeDataDeficientHistogram(counts);
  const categoryPieChart = computeCategoryPieChart(counts);

  return NextResponse.json({
    dataDeficientHistogram,
    categoryPieChart,
    totalSpecies: data.length,
  });
}
