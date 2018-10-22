<template>
  <div>
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
import { mapHouse, HouseModel } from "@/lib/house";
const { LMap, LTileLayer, LMarker } = require("vue2-leaflet");
import LocationApi, { Location } from "@/lib/location";
import eventBus from "@/lib/events";
import debounce from "debounce";
import Api from "@/lib/api";
import HouseMapTooltip from "./HouseMapTooltip.vue";
import { parseSnakeCase } from "@/lib/string";

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
  private visibleHouses: any[] = [];
  private mapModel: { marker: L.LatLng; house: HouseModel }[] = [];
  private url: string = "https://{s}.tile.osm.org/{z}/{x}/{y}.png";

  created() {
    this.browseVisibleHouses = debounce(
      this.browseVisibleHouses.bind(this),
      1000
    );
    this.buildHouseModel(this.houses);
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

  buildMarkerIcon(house: HouseModel, classes: string = ""): L.Icon<any> {
    return L.divIcon({
      className: `${classes} ${house.status.replace(/ /g, "-")}`
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
        `query ZillowMapSearch($bottomLeft: LatLongInput!, $topRight: LatLongInput!, $zoom: Int!) {
              zillowMapSearch(bottomLeft: $bottomLeft, topRight: $topRight, zoom: $zoom) {
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
        }
      );

      // remove houses we already have in our list
      const listZpids = new Set(this.mapModel.map(h => h.house.zpid));
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
      const icon = this.buildMarkerIcon(house, "owned");
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
    border-width: 2px;
  }
  &.owned {
    background: #2e0799;
  }
  &:not(.owned) {
    .for-sale {
      background: green;
    }
  }
}
</style>

