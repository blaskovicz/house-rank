<template>
  <div>
    <div id='search-controls'>
      <b-form @submit="searchHouses" inline>
        <label class="mr-sm-2" for="house-road">House Number and Road</label>
        <b-form-input required class="mr-sm-2" v-model="road" id="house-road" type="text" placeholder="1 main street"></b-form-input>

        <label class="mr-sm-2" for="house-city">City+State or Zipcode</label>
        <b-form-input required class="mr-sm-2" v-model="city" id="house-city" type="text" placeholder="New York, NY or 10001"></b-form-input>
        
        <b-button @click="searchHouses" size='sm' variant='primary'>Search</b-button>
        <b-button id='cancel-button' @click="cancelSearch" size='sm' variant="default">Cancel</b-button>
      </b-form>   
    </div>
    <div id='results' v-show='results.length > 0'>
      <b-table striped hover :items="results" :fields="fields">
        <template slot="zestimate" slot-scope="data">
          ${{data.item.zestimate}}
        </template>
        <template slot="zpid" slot-scope="data">
          <a target="_blank" rel="noopener noreferer" :href="`https://www.zillow.com/homedetails/${data.item.zpid}_zpid`">
            {{data.item.zpid}}
          </a>
        </template>
        <template slot="options" slot-scope="data">
          <b-button @click="selectHouse(data.item.zpid)" size='sm' variant='primary'>Add to List</b-button>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";
import Api from "@/lib/api";

@Component
export default class HouseSearch extends Vue {
  city: string = "";
  road: string = "";
  results: any[] = [];
  fields: any[] = [
    { key: "zpid", label: "Zillow ID", sortable: true },
    { key: "address", sortable: true },
    { key: "city", sortable: true },
    { key: "state", sortable: true },
    { key: "zestimate", sortable: true },
    { key: "options", label: "Options", sortable: false }
  ];

  @Emit("house-selected")
  async selectHouse(zpid: any) {
    return zpid;
  }
  cancelSearch() {
    this.results = [];
  }
  @Emit()
  responseError(e: any) {
    return e;
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
        zestimate: p.zestimate[0].amount[0]._,
        address: p.address[0].street[0],
        city: p.address[0].city[0],
        state: p.address[0].state[0]
      }));
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
