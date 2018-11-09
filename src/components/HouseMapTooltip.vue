<template>
  <div class="tooltip-container-wrapper" @click.stop.prevent="openDetails">
      <div class="tooltip-icon">
          <b-img-lazy
            rounded
            fluid
            fluid-grow
            class="d-block img-fluid w-100"
            :alt="house.zpid"
            :width="80"
            :src="thumbnailUrl"
          />
      </div>
      <div class="tooltip-stats">
          <!-- <div>{{house.streetAddress || house.street}}</div>
          <div>{{house.city}}</div>               -->
          <div class='price'>{{housePrice}}</div>
          <div>{{house.bedrooms}} bd, {{house.bathrooms}} ba</div>
          <div>{{house.livingArea}} sqft</div>
          <div class='house-status' v-if="house.status !== 'for sale'">{{house.status}}</div>
      </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { HouseModel, shortPrice } from "@/lib/house";
import eventBus from "@/lib/events";

@Component
export default class HouseMapTooltip extends Vue {
  @Prop(Object)
  house!: HouseModel;

  openDetails() {
    eventBus.$emit("house:modal:show", this.house);
  }
  get thumbnailUrl(): string {
    if (!this.house || (!this.house.thumbnailUrl && !this.house.imageLink)) {
      return "";
    }

    // html-escaped
    return (this.house.thumbnailUrl || this.house.imageLink).replace(
      /&amp;/g,
      "&"
    );
  }
  get housePrice() {
    if (!this.house || !this.house.price) return "";
    return shortPrice(this.house.price);
  }
}
</script>

<style scoped lang="scss">
.tooltip-container-wrapper {
  width: 200px;
  &:hover {
    cursor: pointer;
  }
  .tooltip-icon {
    min-height: 80px;
    width: 100px;
    display: inline-block;
  }
  .tooltip-stats {
    font-size: 10pt;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
    width: 100px;
    display: inline-block;
    .price {
      font-weight: bold;
    }
    .house-status {
      font-weight: bold;
    }
  }
}
</style>