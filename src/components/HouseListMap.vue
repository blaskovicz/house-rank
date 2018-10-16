<template>
  <div>
    <l-map :zoom=11 ref="map" style="height: 300px">
      <l-tile-layer :url="url" />
      <l-marker @click="updateNextImage" v-for="house in mapModel" :lat-lng="house.marker" :key="house.house.zpid">
        <l-popup width="500px">
          <b-row>
            <b-col>
              <div>{{house.house.streetAddress}}</div>
              <div>{{house.house.city}}, {{house.house.state}}</div>
              <div>${{house.house.price}}</div>                 
            </b-col>
            <b-col>
              <house-thumbnail :house="house.house" />
            </b-col>
          </b-row>
        </l-popup>
        <l-tooltip>
          <div>{{house.house.streetAddress}}</div>
          <div>{{house.house.city}}, {{house.house.state}}</div>
          <div>${{house.house.price}}</div>
          <div>({{house.house.status}})</div>
        </l-tooltip>
      </l-marker>
    </l-map>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import L from "leaflet";
import { mapHouse, HouseModel } from "@/lib/house";
const { LMap, LPopup, LTileLayer, LMarker, LTooltip } = require("vue2-leaflet");
import HouseThumbnail from "./HouseThumbnail.vue";
import eventBus from "@/lib/events";

@Component({
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LTooltip,
    LPopup,
    HouseThumbnail
  }
})
export default class HouseListMap extends Vue {
  @Prop(Array)
  private houses!: any[];
  private mapModel: { marker: L.LatLng; house: HouseModel }[] = [];
  private url: string = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";

  mounted() {
    this.buildHouseModel(this.houses);
  }
  updateNextImage() {
    // all because b-lazy-img...
    eventBus.$emit("b:carousel:img:next");
  }
  @Watch("houses")
  onHousesChanged(newHouses: any[]) {
    this.buildHouseModel(newHouses);
  }
  buildHouseModel(newHouses: any[]) {
    if (!newHouses) {
      this.mapModel = [];
      return;
    }
    const bounds: [number, number][] = [];
    this.mapModel = newHouses.map(h => {
      const house = mapHouse(h);
      const { latitude, longitude } = h.zillow.property;
      const marker = L.latLng(latitude, longitude);
      bounds.push([latitude, longitude]);
      return {
        house,
        marker
      };
    });
    if (bounds.length === 0) return;
    this.$nextTick(() => {
      ((this.$refs.map as any).mapObject as L.Map).fitBounds(bounds);
    });
  }
}
</script>