<template>
  <div>
    <div id='search-controls'>
      <b-row>
        <b-col sm="3"><label for="house-road">House Number and Road</label></b-col>
        <b-col sm="9">
          <b-form-input v-model="road" id="house-road" type="text" placeholder="1 main street"></b-form-input>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="3"><label for="house-city">City+State or Zipcode</label></b-col>
        <b-col sm="9">
          <b-form-input v-model="city" id="house-city" type="text" placeholder="New York, NY or 10001"></b-form-input>
        </b-col>
      </b-row>   
      <b-row>
        <b-col sm="9">
            <b-button @click="searchHouses" size='sm' variant='primary'>Search</b-button>
        </b-col>
      </b-row>   
    </div>
    <div id='results' v-show='results.length > 0'>
      <b-table striped hover :items="results" :fields="fields">
        <template slot="zpid" slot-scope="data">
          <a target="_blank" rel="noopener noreferer" :href="`https://www.zillow.com/homedetails/${data.item.zpid}_zpid`">{{data.item.zpid}}</a>
        </template>
        <template slot="options" slot-scope="data">
            <b-button @click="selectHouse(data.item.zpid)" size='sm' variant='primary'>[add]</b-button>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import Api from "@/lib/Api";

@Component
export default class HouseSearch extends Vue {
  city: string = "";
  road: string = "";
  results: any[] = [];
  fields: any[] = [
    { key: "zpid", label: "Zillow ID", sortable: true },
    { key: "address", sortable: true },
    { key: "zestimate", sortable: true },
    { key: "options", label: "Options", sortable: false }
  ];

  @Emit("house-selected")
  async selectHouse(zpid: any) {
    return zpid;
  }
  async searchHouses() {
    try {
      const resBody = await Api.request("/api/v1/zillow/properties", {
        qs: {
          address: this.road,
          citystatezip: this.city
        }
      });

      this.results = resBody.map((p: any) => ({
        zpid: p.zpid[0],
        zestimate: `${p.zestimate[0].amount[0]._} ${
          p.zestimate[0].amount[0].$.currency
        }`,
        address: `${p.address[0].street[0]} ${p.address[0].city[0]}, ${
          p.address[0].state[0]
        } ${p.address[0].zipcode[0]}`
      }));
    } catch (e) {
      console.warn(e);
    }
  }
}
</script>

<style scoped lang="scss">
#results {
  overflow-y: auto;
  max-height: 20em;
}
</style>
