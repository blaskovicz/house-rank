<template>
  <div>
    <div id='search-controls'>
      <b-form @submit="searchHouses" inline>
        <label class="mr-sm-2" for="house-road">House Number and Road</label>
        <b-form-input required class="mr-sm-2" v-model="road" id="house-road" type="text" placeholder="5 Washington Square S"></b-form-input>

        <label class="mr-sm-2" for="house-city">City with State or Zipcode</label>
        <b-form-input required class="mr-sm-2" v-model="city" id="house-city" type="text" placeholder="New York, NY or 10001"></b-form-input>
        
        <b-button @click="searchHouses" size='sm' variant='primary'>Search</b-button>
        <b-button id='cancel-button' v-if="showClear" @click="cancelSearch" size='sm' variant="default">Clear</b-button>
      </b-form>   
    </div>
    <div id='results' v-show='results.length > 0'>
      <b-table striped hover fixed :items="results" :fields="fields">
        <house-thumbnail slot="image" slot-scope="data" :house="data.item"></house-thumbnail>                                     
        <template slot="options" slot-scope="data">
          <b-button @click="selectHouse(data.item.zillowId)" size='sm' variant='primary'>Add to List</b-button>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import HouseThumbnail from "./HouseThumbnail.vue";
import Api, { commonZillowHouseDataGraphql } from "@/lib/api";
import { mapHouse, HouseModel, fullPrice } from "@/lib/house";

@Component({
  components: {
    HouseThumbnail
  }
})
export default class HouseSearch extends Vue {
  city: string = "";
  road: string = "";
  results: HouseModel[] = [];
  fields: any[] = [
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
    { key: "daysListed", sortable: true },
    { key: "daysListed", sortable: true }, // TODO actual listing days based on listing history add/remove
    // { key: "zestimate", sortable: true },
    { key: "options", label: "", sortable: false }
  ];

  @Emit("house-selected")
  async selectHouse(zpid: any) {
    return zpid;
  }
  get showClear(): boolean {
    return this.results.length > 0 || this.city !== "" || this.road !== "";
  }
  cancelSearch() {
    this.city = "";
    this.road = "";
    this.results = [];
  }
  @Emit()
  responseError(e: any) {
    return e;
  }
  async searchHouses() {
    try {
      const resData = await Api.graphqlRequest(
        `query ZillowAddressSearch($address: String!, $citystatezip: String!) {
      zillowAddressSearch(address: $address, citystatezip: $citystatezip) {
        city
        zpid
        latitude
        longitude
        state
        street
        zipcode
        ${commonZillowHouseDataGraphql}
      }
    }`,
        { address: this.road, citystatezip: this.city }
      );
      this.results = resData.zillowAddressSearch.map(mapHouse);
    } catch (e) {
      this.responseError(e);
    }
  }
}
</script>

<style scoped lang="scss">
#results {
  overflow-y: auto;
  max-height: 20em;
  margin-bottom: 2em;
}
#search-controls {
  margin-top: 2em;
  margin-bottom: 2em;
}
#cancel-button {
  margin-left: 5px;
}
</style>
