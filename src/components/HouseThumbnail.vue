<template>
  <div class='house-thumbnail-wrapper-outer' >
    <b-modal ref="modal" size='lg' v-model="detailsOpen" @ok="closeDetails" @shown="fixScrolling">
      <div slot="modal-title">
        <b-row>
          <b-col><h5>{{house.streetAddress}}<br>{{house.city}}, {{house.state}}</h5></b-col>
          <b-col><h5>{{house.bedrooms}} bed{{house.bedrooms !== 1 ? 's':''}} • {{house.bathrooms}} bath{{house.bathrooms !== 1 ? 's':''}} • {{house.livingArea}} sqft</h5></b-col>
          <b-col><h5>{{houseStatus}}<br>${{house.price}}</h5></b-col>
        </b-row>
      </div>
      <div class='house-thumbnail-large'>        
        <b-carousel v-model="imageNumber" controls indicators :interval="thumbnailCarouselInterval">
          <b-carousel-slide :key="photo.url" v-for="photo in house.raw.zillow.property.hugePhotos" :caption="photo.caption" :img-width="photo.width" :img-height="photo.height" :img-src="photo.url"></b-carousel-slide>
        </b-carousel>     
      </div>
      <div class='house-description'>
        <p>{{house.raw.zillow.property.description}}</p>
      </div>
      <div class='house-facts'>
        <house-category-details :house="house"></house-category-details>
      </div>
      <div>
        <a target="_blank" rel="noopener noreferer" :href="`https://www.zillow.com/homedetails/${house.zpid}_zpid`">
          <img src="https://www.zillow.com/widgets/GetVersionedResource.htm?path=/static/logos/Zillowlogo_200x50.gif" width="200" height="50" alt="View on Zillow">
        </a>
      </div>
      <div slot="modal-footer" class="w-100">    
        <b-btn size="sm" class="float-right" @click="closeDetails">
          Close
        </b-btn>
      </div>
    </b-modal>    
    <div class='house-thumbnail-wrapper-inner'>
      <div @click.stop.prevent="openDetails">
        <div class="for-sale-status">{{house.status}}</div>
        <div class='house-thumbnail-small'>
          <b-carousel v-model="imageNumber" class="for-sale-thumb" controls indicators :interval="thumbnailCarouselInterval">
            <b-carousel-slide :key="photo.url" v-for="photo in house.raw.zillow.property.smallPhotos" :caption="photo.caption" :img-width="photo.width" :img-height="photo.height" :img-src="photo.url"></b-carousel-slide>
          </b-carousel>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import HouseCategoryDetails from "./HouseCategoryDetails.vue";
import { HouseModel } from "@/lib/house";
import { parseUpperCamelCase } from "@/lib/string";
@Component({
  components: {
    HouseCategoryDetails
  }
})
export default class HouseThumbnail extends Vue {
  @Prop(Object)
  house!: HouseModel;
  detailsOpen: boolean = false;
  thumbnailCarouselInterval: number = 0;
  imageNumber: number = 0;
  fixScrolling() {
    const modal = (this.$refs.modal as any).$el as HTMLElement;
    setTimeout(() => {
      (modal!.firstChild!.firstChild!.firstChild! as HTMLDivElement).focus();
    });
  }
  get houseStatus() {
    return parseUpperCamelCase(this.house.status);
  }
  openDetails() {
    this.detailsOpen = true;
  }
  closeDetails() {
    this.detailsOpen = false;
  }
}
</script>

<style scoped lang="scss">
.house-thumbnail-wrapper-inner {
  background: #efefef;
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
.house-thumbnail-wrapper-outer {
  .house-description {
    text-align: left;
    margin-top: 10px;
  }
}
</style>
