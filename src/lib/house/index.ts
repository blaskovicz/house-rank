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
  const zp = house.zillow.property;
  const zt = house.zillow.pricing.taxHistory;
  const htm: HouseModel = {
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
    thumbnailUrl: zp.photos[0].url,
    thubmnailCaption: zp.photos[0].caption,
    zillowId: house.zpid,
    zpid: house.zpid,
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
