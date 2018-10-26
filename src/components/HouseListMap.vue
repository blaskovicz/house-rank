<template>
  <div>
    <b-btn v-b-modal.filterControls>Map Filters...</b-btn>
    <b-modal no-fade id="filterControls" title="Map Filters" @hide="resetFiltersToSaved" @ok="saveFilters">
      <b-form v-if="formFilters && formFilters._version">
        <b-row>
          <b-col sm="4"><label for="price-min">Min Price</label></b-col>
          <b-col sm="8">
            <b-input-group size="sm" prepend="$">
              <b-form-input v-model="formFilters.price.min" size="sm" id="price-min" type="number"></b-form-input>
            </b-input-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="4"><label for="price-max">Max Price</label></b-col>
          <b-col sm="8">
            <b-input-group size="sm" prepend="$">
              <b-form-input v-model="formFilters.price.max" size="sm" id="price-max" type="number"></b-form-input>
            </b-input-group>
          </b-col>
        </b-row>

        <b-row>
          <b-col sm="4"><label for="bedrooms-min">Min Bedrooms</label></b-col>
          <b-col sm="8">
            <b-form-input v-model="formFilters.bedrooms.min" size="sm" id="bedrooms-min" type="number"></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="4"><label for="bedrooms-max">Max Bedrooms</label></b-col>
          <b-col sm="8">
            <b-form-input v-model="formFilters.bedrooms.max" size="sm" id="bedrooms-max" type="number"></b-form-input>
          </b-col>
        </b-row>  

        <b-row>
          <b-col sm="4"><label for="bathrooms-min">Min Bathrooms</label></b-col>
          <b-col sm="8">
            <b-form-input v-model="formFilters.bathrooms.min" size="sm" id="bathrooms-min" type="number"></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="4"><label for="bathrooms-max">Max Bathrooms</label></b-col>
          <b-col sm="8">
            <b-form-input v-model="formFilters.bathrooms.max" size="sm" id="bathrooms-max" type="number"></b-form-input>
          </b-col>
        </b-row>  

        <b-row>
          <b-col sm="4"><label for="lot-min">Min Lot (sqft)</label></b-col>
          <b-col sm="8">
            <b-form-input v-model="formFilters.lotSize.min" size="sm" id="lot-min" type="number"></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="4"><label for="lot-max">Max Lot (sqft)</label></b-col>
          <b-col sm="8">
            <b-form-input v-model="formFilters.lotSize.max" size="sm" id="lot-max" type="number"></b-form-input>
          </b-col>
        </b-row>

        <b-row>
          <b-col sm="4"><label for="year-min">Min Year Built</label></b-col>
          <b-col sm="8">
            <b-form-input v-model="formFilters.yearBuilt.min" size="sm" id="year-min" type="number"></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="4"><label for="year-max">Max Year Built</label></b-col>
          <b-col sm="8">
            <b-form-input v-model="formFilters.yearBuilt.max" size="sm" id="year-max" type="number"></b-form-input>
          </b-col>
        </b-row>

        <b-form-group><b-form-checkbox v-model="formFilters.includeForSale">
          Show For-Sale Properties
        </b-form-checkbox></b-form-group>
        <b-form-group><b-form-checkbox v-model="formFilters.includePending">
          Show Pending Properties
        </b-form-checkbox></b-form-group>
        <b-form-group><b-form-checkbox v-model="formFilters.includeRecentlySold">
          Show Recently-Sold Properties
        </b-form-checkbox></b-form-group>
        <b-form-group><b-form-checkbox v-model="formFilters.includePreForeclosure">
          Show Pre-Foreclosure Properties
        </b-form-checkbox></b-form-group>
        <b-form-group><b-form-checkbox v-model="formFilters.includeForeclosure">
          Show Foreclosed Properties
        </b-form-checkbox></b-form-group>      
      </b-form>
      <b-btn class='filter-reset' @click="resetFiltersToDefault">Reset to Defaults</b-btn>
      <div slot="modal-cancel">
         Cancel Changes
       </div>
       <div slot="modal-ok">
         Save Changes
       </div>
    </b-modal>

    <l-map :zoom="zoom" :center="center" @update:bounds="boundsUpate" @update:center="centerUpdate" @update:zoom="zoomUpdate" ref="map" style="height: 500px">
      <l-tile-layer :url="url" />

      <!-- our list houses -->
      <l-marker :icon="house.icon" v-for="house in mapModel" :lat-lng="house.marker" :key="house.house.zpid" @mouseover="updateNextImage" @click="openDetails(house.house)">
        <house-map-tooltip :house="house.house"></house-map-tooltip>      
      </l-marker>

      <!-- browsing houses -->
      <l-marker :icon="house.icon" v-for="house in visibleHouses" :lat-lng="house.marker" :key="house.house.zpid" @mouseover="updateNextImage" @click="openDetails(house.house)">
        <house-map-tooltip :house="house.house"></house-map-tooltip>
      </l-marker>      
    </l-map>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import L from "leaflet";
import { mapHouse, HouseModel, shortPrice } from "@/lib/house";
const { LMap, LTileLayer, LMarker } = require("vue2-leaflet");
import LocationApi, { Location } from "@/lib/location";
import eventBus from "@/lib/events";
import debounce from "debounce";
import Api from "@/lib/api";
import HouseMapTooltip from "./HouseMapTooltip.vue";
import { parseSnakeCase } from "@/lib/string";
import escapeHtml from "escape-html";

const defaultFormFilters = {
  _version: 1,
  price: {
    min: 0,
    max: ""
  },
  bedrooms: {
    min: 0,
    max: ""
  },
  bathrooms: {
    min: 0,
    max: ""
  },
  lotSize: {
    min: 0,
    max: ""
  },
  livingArea: {
    min: 0,
    max: ""
  },
  yearBuilt: {
    min: 0,
    max: ""
  },
  includePending: true,
  includeForSale: true,
  includeRecentlySold: false,
  includePreForeclosure: false,
  includeForeclosure: false
};

@Component({
  components: {
    LMap,
    LTileLayer,
    LMarker,
    HouseMapTooltip
  }
})
export default class HouseListMap extends Vue {
  private locationState = LocationApi.state;
  private zoom: number = 12;
  private center: L.LatLng = L.latLng(47.41322, -1.219482);

  @Prop(Array)
  private houses!: any[];

  @Prop(Array)
  private housesIgnored!: any[];

  private visibleHouses: any[] = [];
  private mapModel: { marker: L.LatLng; house: HouseModel }[] = [];
  private url: string = "https://{s}.tile.osm.org/{z}/{x}/{y}.png";
  private formFilters = {};
  resetFiltersToSaved() {
    let filters: any;
    if (window.localStorage) {
      try {
        const lfilters = JSON.parse(
          window.localStorage.getItem("house-list-filters") || "{}"
        );
        if (
          lfilters._version &&
          lfilters._version === defaultFormFilters._version
        ) {
          filters = lfilters; // compatible
        }
      } catch (e) {
        console.warn("could not load local filters", e);
      }
    }
    if (!filters) {
      console.log("using default filters");
      filters = JSON.parse(JSON.stringify(defaultFormFilters));
    }
    this.formFilters = filters;
    this.buildHouseModel(this.houses);
  }
  saveFilters() {
    if (!window.localStorage) {
      console.warn("localStorage unavailable to save filters");
      return;
    }
    try {
      window.localStorage.setItem(
        "house-list-filters",
        JSON.stringify(this.formFilters)
      );
    } catch (e) {
      console.warn("could not save local filters", e);
    }
  }
  resetFiltersToDefault() {
    this.formFilters = JSON.parse(JSON.stringify(defaultFormFilters));
    if (!window.localStorage) {
      return;
    }
    try {
      window.localStorage.removeItem("house-list-filters");
    } catch (e) {
      console.warn("could not delete local filters", e);
    }
  }

  // fix up expected payload types
  get localMapFilter(): any {
    const clone = JSON.parse(JSON.stringify(this.formFilters));
    for (const [key, value] of Object.entries(clone)) {
      if (!value || typeof value !== "object") {
        continue;
      }
      if ((value as any).min !== "") {
        (value as any).min = +(value as any).min;
      } else {
        (value as any).min = null;
      }
      if ((value as any).max !== "") {
        (value as any).max = +(value as any).max;
      } else {
        (value as any).max = null;
      }
      clone[key] = value;
    }
    return clone;
  }

  created() {
    this.browseVisibleHouses = debounce(
      this.browseVisibleHouses.bind(this),
      1000
    );
    this.resetFiltersToSaved();
  }

  mounted() {
    eventBus.$once("location:available", this.updateLocation);
  }
  beforeDestroy() {
    eventBus.$off("location:available", this.updateLocation);
  }

  updateLocation(location: Location) {
    this.center = L.latLng(location.latitude, location.longitude);
    this.browseVisibleHouses();
  }

  boundsUpate(bounds: L.LatLngBounds) {
    this.browseVisibleHouses();
  }

  buildMarkerIcon(house: HouseModel, owned?: boolean): L.Icon<any> {
    // some houses based on status don't have price
    return L.divIcon({
      html:
        house.price && (owned || this.zoom >= 13)
          ? `<div class="map-price-icon">${shortPrice(house.price)}</div>`
          : "",
      className: `${owned ? "owned" : ""} ${house.status.replace(/ /g, "-")}`
    });
  }
  zoomUpdate(zoom: number) {
    this.zoom = zoom;
    this.browseVisibleHouses();
  }
  centerUpdate(center: L.LatLng) {
    this.center = center;
    this.browseVisibleHouses();
  }
  updateNextImage() {
    this.$nextTick(() => {
      // all because b-lazy-img...
      eventBus.$emit("b:carousel:img:next");
    });
  }
  openDetails(house: HouseModel) {
    eventBus.$emit("house:modal:show", house);
  }
  async browseVisibleHouses() {
    try {
      const bounds = this.map.getBounds();
      const resData = await Api.graphqlRequest(
        `query ZillowMapSearch(
          $bottomLeft: LatLongInput!,
          $topRight: LatLongInput!,
          $zoom: Int!,
          $livingArea: MinMaxInput!,
          $price: MinMaxInput!,
          $bathrooms: MinMaxInput!,
          $bedrooms: MinMaxInput!,
          $lotSize: MinMaxInput!,
          $yearBuilt: MinMaxInput!,
          $includePending: Boolean!,
          $includeForSale: Boolean!,
          $includeRecentlySold: Boolean!,
          $includePreForeclosure: Boolean!,
          $includeForeclosure: Boolean!
        ) {
              zillowMapSearch(
                bottomLeft: $bottomLeft,
                topRight: $topRight,
                zoom: $zoom,
                livingArea: $livingArea,
                price: $price,
                bathrooms: $bathrooms,
                bedrooms: $bedrooms,
                lotSize: $lotSize,
                yearBuilt: $yearBuilt,
                includePending: $includePending,
                includeForSale: $includeForSale,
                includeRecentlySold: $includeRecentlySold,      
                includePreForeclosure: $includePreForeclosure,
                includeForeclosure: $includeForeclosure                
              ) {
                zpid
                bedrooms
                bathrooms
                latitude
                longitude
                imageLink
                street
                streetAddress: street
                city
                state
                zipcode
                livingArea
                price
                homeStatus
              }
        }`,
        Object.assign(
          {
            topRight: {
              latitude: bounds.getNorthEast().lat,
              longitude: bounds.getNorthEast().lng
            },
            bottomLeft: {
              latitude: bounds.getSouthWest().lat,
              longitude: bounds.getSouthWest().lng
            },
            zoom: this.zoom
          },
          this.localMapFilter
        )
      );

      const listZpids = new Set([
        // remove houses we already have in our list
        ...this.mapModel.map(h => h.house.zpid),
        // along with those that are ignored
        ...(this.housesIgnored || []).map(h => h.zpid)
      ]);

      this.visibleHouses = (resData.zillowMapSearch || [])
        .filter((h: any) => !listZpids.has(h.zpid))
        .map((h: any) => {
          h.status = parseSnakeCase(h.homeStatus);
          return {
            marker: L.latLng(h.latitude, h.longitude),
            house: h,
            icon: this.buildMarkerIcon(h)
          };
        });
    } catch (e) {
      console.warn(e);
    }
  }

  @Watch("houses")
  onHousesChanged(newHouses: any[]) {
    this.buildHouseModel(newHouses);
  }

  @Watch("housesIgnored")
  onHousesIgnoredChanged() {
    this.browseVisibleHouses();
  }

  get map(): L.Map {
    return (this.$refs.map as any).mapObject as L.Map;
  }
  get location(): L.LatLng | undefined {
    const ls = this.locationState.location;
    if (!ls) {
      return;
    }
    return L.latLng(ls.latitude, ls.longitude);
  }
  buildHouseModel(newHouses: any[]) {
    if (!newHouses) {
      this.mapModel = [];
      this.browseVisibleHouses();
      return;
    }

    const bounds: [number, number][] = [];

    this.mapModel = newHouses.map(h => {
      const house = mapHouse(h);
      const icon = this.buildMarkerIcon(house, true);
      const { latitude, longitude } = h.zillow.property;
      const marker = L.latLng(latitude, longitude);
      bounds.push([latitude, longitude]);
      return {
        house,
        marker,
        icon
      };
    });

    this.$nextTick(() => {
      if (bounds.length !== 0) {
        this.map.fitBounds(bounds);
        // this.zoom = this.map.getZoom();
      } else if (this.location) {
        this.center = this.location;
      } else {
        console.warn("no bounds or location available");
      }
      this.browseVisibleHouses();
    });
  }
}
</script>

<style lang="scss">
.leaflet-marker-icon {
  border-radius: 15px;
  border: 1px solid #fff;
  background: #ec0808;
  width: 1em;
  height: 1em;
  &:hover {
    border-color: #000;
    opacity: 0.8;
    border-width: 1px;
  }
  &.owned {
    background: #2e0799;
  }
  &:not(.owned) {
    .for-sale {
      background: green;
    }
  }
  .map-price-icon {
    z-index: 1;
    font-weight: bold;
    background-color: #fdfdfd;
    display: block;
    width: 3.6em;
    box-shadow: 1px 1px #000;
    position: relative;
    top: 1em;
    left: -1.4em;
    border-radius: 5px;
  }
}
#filterControls {
  text-align: left;
  .filter-reset {
    float: right;
  }
}
</style>

