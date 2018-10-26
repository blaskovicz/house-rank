<template>
  <div id="houses">
    <b-table :foot-clone="true" responsive bordered striped hover small :items="tableModel" :fields="fields">
      <house-thumbnail allow-hide slot="image" slot-scope="data" :house="data.item"></house-thumbnail>
      <template slot="score" slot-scope="data">
        <div :id="'score-' + data.item.zillowId">{{data.item.score.toFixed(2)}}</div>
        <b-popover title='About this Score' :target="'score-' + data.item.zillowId" triggers="hover focus">
          <table class='score-table'>
            <tr v-for="ex in data.item.scoreExplanation" :key="ex.scorePart+' '+ex.reason">
              <td><div class='score-part'><b>{{ex.scorePart.toFixed(2)}}/{{ex.scoreMax}}</b>:</div></td>
              <td><div class='score-reason'>{{ex.reason}}</div></td>
            </tr>
          </table>
        </b-popover>
      </template>   
      <template slot="options" slot-scope="row">     
        <b-button @click="houseRemoved(row.item.zillowId)" size='sm' variant='primary'>Remove</b-button>
      </template>  
    </b-table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";
import HouseThumbnail from "./HouseThumbnail.vue";
import { HouseModel, mapHouse, fullPrice } from "@/lib/house";
import { scoreHouses } from "@/lib/house/score";

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
  { key: "price", sortable: true, formatter: fullPrice },
  {
    key: "priceAppraised",
    label: "Appraised",
    sortable: true,
    formatter: fullPrice
  },
  {
    key: "priceAssessed",
    label: "Assessed",
    sortable: true,
    formatter: fullPrice
  },
  { key: "taxPaid", label: "Taxes", sortable: true, formatter: fullPrice },
  { key: "daysListed", sortable: true }, // TODO actual listing days based on listing history add/remove
  // { key: "zestimate", sortable: true },
  { key: "options", label: "", sortable: false }
];

@Component({
  components: {
    HouseThumbnail
  }
})
export default class HouseList extends Vue {
  @Prop(Array)
  private houses!: any[];
  tableModel: HouseModel[] = [];
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
  .score-table {
    table-layout: fixed;
  }
}
</style>
