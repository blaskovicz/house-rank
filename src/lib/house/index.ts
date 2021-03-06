import { parseUpperCamelCase } from "@/lib/string";
import { findCategoryDetailsHomeFact } from "@/lib/house/zillow";
import moment from "moment";

export interface HouseModel {
  score: number;
  scoreExplanation: { scorePart: number; scoreMax: number; reason: string }[];
  zillowId: string;
  zpid: string;
  thumbnailUrl: string;
  thubmnailCaption: string;
  status: string;
  type: string;
  streetAddress: string;
  city: string;
  state: string;
  yearBuilt: number;
  daysListed: number;
  bedrooms: number;
  bathrooms: number;
  price: number;
  lastSoldPrice?: number;
  // zestimate: number;
  priceAppraised: number;
  priceAssessed: number;
  taxPaid: number;
  acreage: number;
  livingArea: number;
  raw: any;
  [index: string]: any;
}

export function mapHouse(house: any): HouseModel {
  const zp = house.property || house.zillow.property;
  const zt = (house.pricing || house.zillow.pricing).taxHistory;
  const zpid = house.zpid || zp.zpid || zt.zpid;

  const htm: HouseModel = {
    zpid,
    zillowId: zpid,
    score: 0,
    taxPaid: zt && zt.length > 0 && zt[0].taxPaid ? zt[0].taxPaid : 0,
    scoreExplanation: [],
    raw: house,
    price: zp.price,
    lastSoldPrice: zp.lastSoldPrice ? +zp.lastSoldPrice : undefined,
    yearBuilt: zp.yearBuilt,
    acreage: acreage(zp.lotSize),
    daysListed: zp.daysOnZillow,
    bedrooms: +zp.bedrooms,
    bathrooms: +zp.bathrooms,
    city: zp.city,
    state: zp.state,
    streetAddress: zp.streetAddress,
    thumbnailUrl: zp.smallPhotos[0].url,
    thubmnailCaption: zp.smallPhotos[0].caption,
    status: parseUpperCamelCase(zp.keystoneHomeStatus),
    livingArea: +zp.livingArea,
    priceAssessed: priceAssessed(zp.taxAssessedValue),
    priceAppraised: priceAppraised(zp.taxAssessedValue),
    // zestimate: +zp.zestimate.toFixed(0),
    type:
      findCategoryDetailsHomeFact(
        zp,
        "Construction",
        "Type and Style",
        "Structure type"
      ) || "-"
  };
  return htm;
}

export function dateYearMonth(date: any): string {
  const d = moment(date);
  if (!d.isValid()) return "--";
  return d.format("YYYY/MM");
}
export function dateYearMonthDay(date: any): string {
  const d = moment(date);
  if (!d.isValid()) return "--";
  return d.format("YYYY/MM/DD");
}
export function dateYear(date: any): string {
  const d = moment(date);
  if (!d.isValid()) return "--";
  return d.format("YYYY");
}

export function acreage(lotSize: number): number {
  if (typeof lotSize !== "number") return 0;
  return +(lotSize / 43560).toFixed(1);
}
export function priceAssessed(taxAssessedValue: number): number {
  if (typeof taxAssessedValue !== "number") return 0;
  return +taxAssessedValue.toFixed(0);
}
export function priceAppraised(taxAssessedValue: number): number {
  if (typeof taxAssessedValue !== "number") return 0;
  return +((taxAssessedValue / 7) * 10).toFixed(0);
}

export function fullPrice(price: number): string {
  if (typeof price !== "number") return "--";
  return `$${price.toLocaleString()}`;
}

export function percentage(decimalPercent: number): string {
  if (typeof decimalPercent !== "number" || decimalPercent === 0) return "--";
  const p = (decimalPercent * 100.0).toFixed(1).replace(".0", "");
  if (decimalPercent > 0) {
    return `+${p}%`;
  }
  return `${p}%`;
}

export function shortPrice(price: number): string {
  if (typeof price !== "number") return "--";
  let count = 0;
  let slimPrice = price;
  // 123 -> 123
  // 666,000 -> 666K
  // 12,500,000 -> 12500K -> 12.5M
  while (slimPrice > 1000 && count < 3) {
    slimPrice /= 1000;
    count += 1;
  }
  let unit = "";
  switch (count) {
    case 1:
      unit = "K";
      break;
    case 2:
      unit = "M";
      break;
    case 3:
      unit = "B";
      break;
    default:
      break;
  }

  let numeral;
  const [preDot, postDot] = `${slimPrice.toFixed(2)}`.split(".", 2);
  const postRemoved = postDot.replace(/0+/g, "");
  if (postRemoved === "" || preDot.length > 2) {
    numeral = preDot;
  } else {
    numeral = `${preDot}.${postRemoved}`;
  }
  return `$${numeral}${unit}`;
}
