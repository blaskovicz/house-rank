import { parseUpperCamelCase } from "@/lib/string";
import { findCategoryDetailsHomeFact } from "@/lib/house/zillow";

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
    yearBuilt: zp.yearBuilt,
    acreage: +(zp.lotSize / 43560).toFixed(1),
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
    priceAssessed: +(+zp.taxAssessedValue).toFixed(0),
    priceAppraised: +((zp.taxAssessedValue / 7) * 10).toFixed(0),
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

export function fullPrice(price: number): string {
  if (typeof price !== "number") return "--";
  const p = `${price}`;
  let p2 = "";
  let offset = 0;
  for (let i = p.length - 1; i >= 0; i -= 1) {
    if (p[i] !== "-" && offset % 3 === 0 && offset > 0) {
      p2 = `,${p2}`;
      offset = 0;
    }
    p2 = p[i] + p2;
    offset += 1;
  }
  return `$${p2}`;
}

export function percentage(decimalPercent: number): string {
  if (decimalPercent === 0) return "--";
  const p = (decimalPercent * 100.0).toFixed(1).replace(".0", "");
  if (decimalPercent > 0) {
    return `+${p}%`;
  }
  return `${p}%`;
}

export function shortPrice(price: number): string {
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
