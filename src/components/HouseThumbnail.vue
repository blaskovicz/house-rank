<template>  
  <div @click.stop.prevent="openDetails" class='house-thumbnail-wrapper-inner'>
    <div class="for-sale-status">{{house.status}}</div>
    <div class='house-thumbnail-small'>
      <b-carousel @sliding-start="lazyLoadNextImg" class="for-sale-thumb" controls indicators :interval="thumbnailCarouselInterval">
        <b-carousel-slide :key="photo.url" v-for="photo in house.raw.zillow.property.smallPhotos">
          <b-img-lazy rounded fluid fluid-grow slot="img" class="d-block img-fluid w-100" :alt="photo.caption" :width="photo.width" :height="photo.height" :src="photo.url" />
        </b-carousel-slide>            
      </b-carousel>
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
  .for-sale-thumb {
    width: 120px;
  }
  .for-sale-status {
    font-size: 10pt;
  }
}
</style>
