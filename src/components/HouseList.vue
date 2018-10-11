<template>
  <div id="houses">
    <b-table responsive striped hover small :items="tableModel" :fields="fields">
      <template slot="image" slot-scope="data">
        <a target="_blank" rel="noopener noreferer" :href="`https://www.zillow.com/homedetails/${data.item.zillowId}_zpid`">
          <div class="for-sale-status">{{data.item.status}}</div>
          <img class="for-sale-thumb" :alt="data.item.thumbnailCaption" :src="data.item.thumbnailUrl" >
        </a>
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
      <template slot="zestimate" slot-scope="data">
        ${{data.item.zestimate}}
      </template>  
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
  zestimate: number;
  priceAppraised: number;
  priceAssessed: number;
  acreage: number;
  livingArea: number;
  raw: any;
}

function mapHouse(house: any): HouseTableModel {
  const zp = house.zillow.property;
  const htm: HouseTableModel = {
    raw: house,
    price: zp.price,
    yearBuilt: zp.yearBuilt,
    acreage: +(zp.lotSize / 43560).toFixed(1),
    daysListed: zp.daysOnZillow,
    bedrooms: zp.bedrooms,
    bathrooms: zp.bathrooms,
    city: zp.city,
    state: zp.state,
    streetAddress: zp.streetAddress,
    thumbnailUrl: zp.photos[0].url,
    thubmnailCaption: zp.photos[0].caption,
    zillowId: house.zpid,
    status: parseUpperCamelCase(zp.keystoneHomeStatus),
    livingArea: zp.livingArea,
    priceAssessed: +(+zp.taxAssessedValue).toFixed(0),
    priceAppraised: +((zp.taxAssessedValue / 7) * 10).toFixed(0),
    zestimate: zp.zestimate,
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
  { key: "daysListed", sortable: true },
  { key: "daysListed", sortable: true }, // TODO actual listing days based on listing history add/remove
  { key: "zestimate", sortable: true },
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
  return newWord;
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
    this.tableModel = newHouses.map(mapHouse);
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
