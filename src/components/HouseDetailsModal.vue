<template>
    <b-modal no-fade v-model="visible" size='lg' @hidden="close" @shown="lazyLoadNextImg" @show="lazyLoadNextImg" v-if="extendedHouse">
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
                        {{housePrice}}
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
        <b-card no-body>
          <b-tabs pills card>
              <b-tab title="Description" active>
                  <div class='house-description'>
                      <p>{{houseDescription}}</p>
                      </div>
                      <div class='house-facts'>
                      <house-category-details :house="extendedHouse"></house-category-details>
                  </div>
              </b-tab>
              <b-tab title="Price History">
                <div class='overflow-wrapper'>
                  <b-table :fields="priceHistoryFields" :items="pricing.priceHistory">
                      <template slot="priceChangeRate" slot-scope="data">
                          <rate-change-formatter :rate="data.value"></rate-change-formatter>
                      </template>                    
                  </b-table>                               
                </div>
              </b-tab>
              <b-tab title="Tax History">
                <div class='overflow-wrapper'>
                  <b-table :fields="taxHistoryFields" :items="pricing.taxHistory">
                      <template slot="taxIncreaseRate" slot-scope="data">
                        <rate-change-formatter :rate="data.value"></rate-change-formatter>
                      </template>
                      <template slot="valueIncreaseRate" slot-scope="data">
                          <rate-change-formatter :rate="data.value"></rate-change-formatter>
                      </template>                                        
                  </b-table>
                </div>
              </b-tab>
              <b-tab title="Comparables">
                <b-card-group columns>
                  <house-comparison-card :house-a="extendedHouse" :house-b="comp" v-for="comp in comps" :key="comp.zpid">                    
                  </house-comparison-card>
                </b-card-group>
              </b-tab>
              <b-tab title="Nearby">
                <b-card title="Sales">
                  <b-card-group columns>
                    <house-comparison-card :house-a="extendedHouse" :house-b="saleHome" v-for="saleHome in nearbySales" :key="saleHome.zpid">                    
                    </house-comparison-card>
                  </b-card-group>
                </b-card>
                <b-card title="Homes">
                  <b-card-group columns>
                    <house-comparison-card :house-a="extendedHouse" :house-b="home" v-for="home in nearbyHomes" :key="home.zpid">                    
                    </house-comparison-card>
                  </b-card-group>
                </b-card>                
              </b-tab>                                  
          </b-tabs>
        </b-card>
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
import HouseComparisonCard from "./HouseComparisonCard.vue";
import {
  HouseModel,
  mapHouse,
  percentage,
  fullPrice,
  priceAppraised,
  priceAssessed,
  acreage,
  dateYearMonth,
  dateYear,
  dateYearMonthDay
} from "@/lib/house";
import { parseUpperCamelCase, parseSnakeCase } from "@/lib/string";
import RateChangeFormatter from "@/formatters/RateChange.vue";
import eventBus from "@/lib/events";
import Api, { commonZillowHouseDataGraphqlUnwrapped } from "@/lib/api";
@Component({
  components: {
    RateChangeFormatter,
    HouseCategoryDetails,
    HouseComparisonCard
  }
})
export default class HouseDetailsModal extends Vue {
  taxHistoryFields = [
    {
      key: "time",
      label: "Year",
      sortable: true,
      formatter: dateYear
    },
    {
      key: "taxPaid",
      label: "Property Taxes",
      sortable: true,
      formatter: fullPrice
    },
    {
      key: "taxIncreaseRate",
      label: "Change",
      sortable: true,
      formatter: percentage
    },
    {
      key: "value",
      label: "Tax Assessment",
      sortable: true,
      formatter: fullPrice
    },
    {
      key: "valueIncreaseRate",
      label: "Change",
      sortable: true,
      formatter: percentage
    }
  ];
  priceHistoryFields = [
    {
      key: "time",
      label: "Date",
      sortable: true,
      formatter: dateYearMonthDay
    },
    { key: "event", sortable: false },
    { key: "price", sortable: true, formatter: fullPrice },
    {
      key: "priceChangeRate",
      label: "Change",
      sortable: true,
      formatter: percentage
    },
    { key: "source", sortable: false }
  ];

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
  get pricing(): any {
    if (!this.extendedHouse) return;
    const ehr = this.extendedHouse.raw;
    return (ehr.zillow || ehr).pricing;
  }
  get comps(): any[] {
    if (!this.extendedHouse) return [];
    const ehr = this.extendedHouse.raw;
    return (ehr.zillow || ehr).property.comps;
  }
  get nearbyHomes(): any[] {
    if (!this.extendedHouse) return [];
    const ehr = this.extendedHouse.raw;
    return (ehr.zillow || ehr).property.nearbyHomes;
  }
  get nearbySales(): any[] {
    if (!this.extendedHouse) return [];
    const ehr = this.extendedHouse.raw;
    return (ehr.zillow || ehr).property.nearbySales;
  }
  get hugePhotos(): any[] {
    if (!this.extendedHouse) return [];
    const ehr = this.extendedHouse.raw;
    return (ehr.zillow || ehr).property.hugePhotos;
  }
  get housePrice(): string {
    if (!this.extendedHouse) return "";
    return fullPrice(this.extendedHouse.price);
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
  margin-top: 20px;
  max-height: 10em;
  overflow-y: auto;
  margin-bottom: 20px;
}
.overflow-wrapper {
  overflow-x: auto;
}
.overflow-wrapper-y {
  overflow-y: auto;
  max-height: 30em;
}
</style>