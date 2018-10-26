<template>  
  <div @click.stop.prevent="openDetails" class='house-thumbnail-wrapper-inner'>
    <div class="for-sale-status">{{house.status}}</div>
    <div class='house-thumbnail-small'>
        <b-img-lazy
          rounded fluid fluid-grow
          class="d-block img-fluid w-100"
          :alt="photo.caption"
          :width="photo.width"
          :height="photo.height"
          :src="photo.url"
        />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { HouseModel } from "@/lib/house";
import eventBus from "@/lib/events";
@Component
export default class HouseThumbnail extends Vue {
  @Prop(Object)
  house!: HouseModel;
  thumbnailCarouselInterval: number = 0;
  get photo() {
    if (!this.house) return;
    return this.house.raw.zillow.property.smallPhotos[0];
  }
  mounted() {
    this.lazyLoadNextImg();
  }
  updated() {
    this.lazyLoadNextImg();
  }
  lazyLoadNextImg() {
    eventBus.$emit("b:carousel:img:next");
  }
  openDetails() {
    eventBus.$emit("house:modal:show", this.house);
  }
}
</script>

<style scoped lang="scss">
.house-thumbnail-wrapper-inner {
  &:hover {
    cursor: pointer;
  }
  .house-thumbnail-small {
    width: 80px;
  }
  .for-sale-status {
    font-size: 10pt;
  }
}
</style>
