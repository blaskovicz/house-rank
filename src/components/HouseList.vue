<template>
  <div id="houses">
    <b-table :foot-clone="true" responsive bordered striped hover small :items="tableModel" :fields="fields">
      <template slot="image" slot-scope="data">
        <a target="_blank" rel="noopener noreferer" :href="`https://www.zillow.com/homedetails/${data.item.zillowId}_zpid`">
          <div class="for-sale-status">{{data.item.status}}</div>
          <img class="for-sale-thumb" :alt="data.item.thumbnailCaption" :src="data.item.thumbnailUrl" >
        </a>
      </template>
      <template slot="score" slot-scope="data">
        <div :id="'score-' + data.item.zillowId">{{data.item.score.toFixed(2)}}</div>
        <b-popover title='About this Score' :target="'score-' + data.item.zillowId" triggers="hover focus">
          <ul>
            <li v-for="ex in data.item.scoreExplanation" :key="ex.scorePart+' '+ex.reason">
              <b>{{ex.scorePart.toFixed(2)}}/{{ex.scoreMax}}</b>: {{ex.reason}}
            </li>
          </ul>
        </b-popover>
      </template>      
      <template slot="price" slot-scope="data">
        ${{data.item.price}}
      </template>
      <template slot="priceAppraised" slot-scope="data">
        ${{data.item.priceAppraised}}
      </template>   
      <template slot="priceAssessed" slot-scope="data">
        ${{data.item.priceAssessed}}
      </template>
      <template slot="taxPaid" slot-scope="data">
        ${{data.item.taxPaid}}
      </template>      
      <!-- <template slot="zestimate" slot-scope="data">
        ${{data.item.zestimate}}
      </template>   -->
      <template slot="options" slot-scope="row">
        <b-button size="sm" @click.stop="row.toggleDetails" class="mr-2">
          {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
        </b-button>        
        <b-button @click="houseRemoved(row.item.zillowId)" size='sm' variant='primary'>Remove From List</b-button>
      </template>
      <template slot="row-details" slot-scope="row">
        <house-category-details @close="row.toggleDetails" :house="row.item.raw"></house-category-details>
      </template>      
    </b-table>    
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";
import HouseCategoryDetails from "./HouseCategoryDetails.vue";

interface HouseTableModel {
  score: number;
  scoreExplanation: { scorePart: number; scoreMax: number; reason: string }[];
  zillowId: string;
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

function mapHouse(house: any): HouseTableModel {
  const zp = house.zillow.property;
  const zt = house.zillow.pricing.taxHistory;
  const htm: HouseTableModel = {
    score: 0,
    taxPaid: zt && zt.length > 0 ? zt[0].taxPaid : 0,
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

const tableModelFields = [
  { key: "image", label: "", sortable: false },
  { key: "score", sortable: true },
  { key: "type", sortable: true },
  { key: "streetAddress", label: "Address", sortable: true },
  { key: "city", sortable: true },
  { key: "state", sortable: true },
  { key: "bedrooms", sortable: true },
  { key: "bathrooms", sortable: true },
  { key: "acreage", sortable: true },
  { key: "yearBuilt", sortable: true },
  { key: "livingArea", label: "Living Area", sortable: true },
  { key: "price", sortable: true },
  { key: "priceAppraised", label: "Appraised", sortable: true },
  { key: "priceAssessed", label: "Assessed", sortable: true },
  { key: "taxPaid", label: "Taxes", sortable: true },
  { key: "daysListed", sortable: true },
  { key: "daysListed", sortable: true }, // TODO actual listing days based on listing history add/remove
  // { key: "zestimate", sortable: true },
  { key: "options", label: "", sortable: false }
];

const AZ = /[A-Z]/;
function parseUpperCamelCase(word: string): string {
  let newWord = "";
  for (let i = 0; i < word.length; i += 1) {
    const char = word[i];
    if (AZ.test(char) && newWord !== "") {
      newWord += " ";
    }
    newWord += char;
  }
  return newWord.toLowerCase();
}

function findCategoryDetailsHomeFact(
  house: any,
  category1: string,
  category2: string,
  category3: string
): string | undefined {
  // special info is burried deep within categories/sub-categories
  const c2 = house.homeFacts.categoryDetails.find(
    (c: any) => c.categoryGroupName === category1
  );
  for (const c3 of c2.categories) {
    if (c3.categoryName !== category2) {
      continue;
    }
    return (c3.categoryFacts as any[])
      .filter((c4: any) => c4.factLabel === category3)
      .map((c5: any) => c5.factValue)
      .join(", ");
  }
}

function scoreHouses(houses: HouseTableModel[]) {
  if (!houses || houses.length === 0) return;

  const statPoints: {
    [key: string]: {
      score: number;
    };
  } = {
    price: { score: 30 },
    priceAppraised: { score: 10 },
    bedrooms: { score: 10 },
    bathrooms: { score: 10 },
    acreage: { score: 10 },
    livingArea: { score: 10 },
    taxPaid: { score: 10 },
    yearBuilt: { score: 10 }
  };

  // first, build lookup for numeric stats, keyed by column
  const stats: {
    avg: { [key: string]: number };
    max: { [key: string]: number };
    min: { [key: string]: number };
  } = {
    avg: {},
    max: {},
    min: {}
  };

  for (const h of houses) {
    for (const [key, value] of Object.entries(h)) {
      if (typeof value !== "number") continue;
      if (stats.avg[key] === undefined) {
        stats.avg[key] = 0;
        stats.max[key] = 0;
        stats.min[key] = 0;
      }

      // new max
      if (value > stats.max[key]) {
        stats.max[key] = value;
      }
      // new min
      if (value < stats.min[key]) {
        stats.min[key] = value;
      }
      // accumulate for avg
      stats.avg[key] += value;
    }
  }
  for (const [key, value] of Object.entries(stats.avg)) {
    stats.avg[key] = +value / houses.length;
  }

  // now apply logic for scoring
  for (const h of houses) {
    let { score } = h;
    const { scoreExplanation } = h;
    const addToScore = (
      scorePart: number,
      scoreMax: number,
      reason: string
    ) => {
      score += scorePart;
      scoreExplanation.push({ scorePart, scoreMax, reason });
    };

    // highest %, shared
    for (const sharedBestStat of [
      "priceAppraised",
      "bedrooms",
      "bathrooms",
      "acreage",
      "livingArea"
    ]) {
      if (typeof h[sharedBestStat] !== "number") {
        throw new Error(
          `Cannot calculate score for House${JSON.stringify(
            h
          )} - missing ${sharedBestStat}`
        );
      }
      addToScore(
        (h[sharedBestStat] * statPoints[sharedBestStat].score) /
          stats.max[sharedBestStat],
        statPoints[sharedBestStat].score,
        `most ${parseUpperCamelCase(sharedBestStat)}`
      );
    }

    // lowest, shared
    for (const sharedBestStat of ["price", "taxPaid"]) {
      if (typeof h[sharedBestStat] !== "number") {
        throw new Error(
          `Cannot calculate score for House${JSON.stringify(
            h
          )} - missing ${sharedBestStat}`
        );
      }

      // TODO this doesnt seem right
      addToScore(
        statPoints[sharedBestStat].score -
          (h[sharedBestStat] * statPoints[sharedBestStat].score) /
            stats.max[sharedBestStat],
        statPoints[sharedBestStat].score,
        `least ${parseUpperCamelCase(sharedBestStat)}`
      );
    }

    addToScore(
      (h.yearBuilt * statPoints.yearBuilt.score) / stats.max.yearBuilt,
      statPoints.yearBuilt.score,
      "newest year built"
    );

    // TODO other self-stats
    // TODO other fact-based stats
    // TODO other distance stats
    // etc
    scoreExplanation.sort((a, b) => b.scorePart - a.scorePart);
    h.score = score;
  }
}

@Component({
  components: {
    HouseCategoryDetails
  }
})
export default class HouseList extends Vue {
  @Prop()
  private houses!: any[];
  tableModel: HouseTableModel[] = [];
  fields: any[] = tableModelFields;
  mounted() {
    this.buildHouseModel(this.houses);
  }
  buildHouseModel(newHouses: any[]) {
    if (!newHouses) {
      this.tableModel = [];
      return;
    }
    const nextHouses = newHouses.map(mapHouse);
    scoreHouses(nextHouses);
    this.tableModel = nextHouses;
  }
  @Watch("houses")
  onHousesChanged(newHouses: any[]) {
    this.buildHouseModel(newHouses);
  }
  @Emit("house-removed")
  async houseRemoved(zpid: any) {
    return zpid;
  }
}
</script>

<style scoped lang="scss">
#houses {
  .for-sale-thumb {
    width: 120px;
  }
  .for-sale-status {
    background: #efefef;
    font-size: 10pt;
  }
}
</style>
