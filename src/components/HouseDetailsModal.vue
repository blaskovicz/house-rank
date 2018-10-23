<template>
    <b-modal v-model="visible" size='lg' @hidden="close" @shown="lazyLoadNextImg" @show="lazyLoadNextImg" v-if="extendedHouse">
        <div slot="modal-title">
            <b-row>
                <b-col>
                    <h5>
                        {{extendedHouse.streetAddress}}<br>
                        {{extendedHouse.city}}, {{extendedHouse.state}}
                    </h5>
                </b-col>
                <b-col>
                    <h5>
                        {{extendedHouse.bedrooms}} bed{{extendedHouse.bedrooms !== 1 ? 's':''}} •
                        {{extendedHouse.bathrooms}} bath{{extendedHouse.bathrooms !== 1 ? 's':''}} •
                        {{extendedHouse.livingArea}} sqft
                    </h5>
                </b-col>
                <b-col>
                    <h5>
                        {{houseStatus}}<br>
                        ${{extendedHouse.price}}
                    </h5>
                </b-col>
                <b-col>
                    <b-btn v-if="selectOptionAlt" size="sm" class="select-option-button-house-details float-right" @click="houseSelectedAlt">
                        {{selectOptionAlt}}
                    </b-btn>                  
                    <b-btn v-if="selectOption" size="sm" class="select-option-button-house-details float-right" @click="houseSelected">
                        {{selectOption}}
                    </b-btn>
                </b-col>
            </b-row>
        </div>
        <div class='house-thumbnail-large'>        
            <b-carousel  @sliding-start="lazyLoadNextImg" controls indicators :interval="thumbnailCarouselInterval">
                <b-carousel-slide :key="photo.url" v-for="photo in hugePhotos">
                    <b-img-lazy rounded fluid fluid-grow slot="img" class="d-block img-fluid w-100" :alt="photo.caption" :width="photo.width" :height="photo.height" :src="photo.url" />
                </b-carousel-slide>
            </b-carousel>     
        </div>
        <div class='house-description'>
            <p>{{houseDescription}}</p>
            </div>
            <div class='house-facts'>
            <house-category-details :house="extendedHouse"></house-category-details>
        </div>
        <div>
            <a target="_blank" rel="noopener noreferer" :href="`https://www.zillow.com/homedetails/${extendedHouse.zpid}_zpid`">
                <img src="https://www.zillow.com/widgets/GetVersionedResource.htm?path=/static/logos/Zillowlogo_200x50.gif" width="200" height="50" alt="View on Zillow">
            </a>
        </div>
        <div slot="modal-footer" class="w-100">
            <b-btn v-if="selectOptionAlt" size="sm" class="select-option-button-house-details float-right" @click="houseSelectedAlt">
                {{selectOptionAlt}}
            </b-btn>          
            <b-btn v-if="selectOption" size="sm" class="select-option-button-house-details float-right" @click="houseSelected">
                {{selectOption}}
            </b-btn>
            <b-btn size="sm" class="float-right" @click="close">
                Close
            </b-btn>
        </div>
    </b-modal>  
</template>

<script lang="ts">
import { Watch, Component, Prop, Vue, Emit } from "vue-property-decorator";
import HouseCategoryDetails from "./HouseCategoryDetails.vue";
import { HouseModel, mapHouse } from "@/lib/house";
import { parseUpperCamelCase } from "@/lib/string";
import eventBus from "@/lib/events";
import Api, { commonZillowHouseDataGraphqlUnwrapped } from "@/lib/api";
@Component({
  components: {
    HouseCategoryDetails
  }
})
export default class HouseDetailsModal extends Vue {
  @Prop(Object)
  house!: HouseModel;
  @Prop(String)
  selectOption!: String;
  @Prop(String)
  selectOptionAlt!: String;

  extendedHouse: HouseModel | null = null;
  thumbnailCarouselInterval: number = 0;
  visible = true;

  mounted() {
    this.onHouseChanged(this.house);
  }

  @Emit()
  houseSelected(house: HouseModel) {
    const h = this.extendedHouse;
    this.$nextTick(() => this.close());
    return h;
  }

  @Emit()
  houseSelectedAlt(house: HouseModel) {
    const h = this.extendedHouse;
    this.$nextTick(() => this.close());
    return h;
  }

  updated() {
    this.$nextTick(() => this.lazyLoadNextImg());
  }

  @Watch("house")
  async onHouseChanged(newHouse: HouseModel) {
    // if we get a new house, determine if we need to load its deep data
    if (
      !newHouse ||
      newHouse.raw ||
      (this.extendedHouse &&
        this.extendedHouse.zpid &&
        this.extendedHouse.zpid === newHouse.zpid)
    ) {
      this.extendedHouse = newHouse;
      return;
    }
    try {
      const resData = await Api.graphqlRequest(
        `query ZillowProperty($zpid: String!) {
      zillowProperty(zpid: $zpid) {
        ${commonZillowHouseDataGraphqlUnwrapped}
      }
    }`,
        { zpid: newHouse.zpid }
      );
      this.extendedHouse = mapHouse(resData.zillowProperty);
    } catch (e) {
      this.responseError(e);
    }
    this.lazyLoadNextImg();
  }

  // TODO move to eventBus
  @Emit()
  responseError(e: any) {
    return e;
  }

  @Emit()
  close() {
    this.extendedHouse = null;
  }

  lazyLoadNextImg() {
    eventBus.$emit("b:carousel:img:next");
  }
  get hugePhotos(): any[] {
    if (!this.extendedHouse) return [];
    const ehr = this.extendedHouse.raw;
    return (ehr.zillow || ehr).property.hugePhotos;
  }
  get houseStatus(): string {
    if (!this.extendedHouse) return "";
    return parseUpperCamelCase(this.extendedHouse.status);
  }
  get houseDescription(): string {
    if (!this.extendedHouse) return "";
    const ehr = this.extendedHouse.raw;
    return (ehr.zillow || ehr).property.description;
  }
}
</script>
<style scoped lang="scss">
.select-option-button-house-details {
  margin-left: 5px;
  margin-right: 5px;
}
.house-description {
  text-align: left;
  margin-top: 10px;
  max-height: 10em;
  overflow-y: auto;
}
</style>