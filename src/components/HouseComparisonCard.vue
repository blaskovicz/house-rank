<template>
    <b-card
        img-top
        img-fluid
        class="house-card"
        :title="title"
        :sub-title="subTitle"
        :img-src="thumbnail">
        <div class='card-text'>
            <div>
                {{status}}
            </div>
            <div>
                <rate-change-formatter :rate="priceDelta" inverse>
                    {{priceString}}
                </rate-change-formatter>
            </div>            
            <div>
                <rate-change-formatter :rate="livingAreaDelta">
                    {{livingArea}} sqft
                </rate-change-formatter>
            </div>
            <div>
                <rate-change-formatter :rate="bedroomDelta">
                    {{bedrooms}} bd
                </rate-change-formatter>
            </div>
            <div>
                <rate-change-formatter :rate="bathroomDelta">
                    {{bathrooms}} ba
                </rate-change-formatter>
            </div>                        
            <div>
                <rate-change-formatter :rate="lotSizeDelta">
                    {{lotSize}} acres
                </rate-change-formatter>
            </div>
            <div>
                <rate-change-formatter :rate="yearBuiltDelta">
                    built {{yearBuilt}}
                </rate-change-formatter>
            </div>                         
        </div>
    </b-card>    
</template>

<script lang="ts">
import { Watch, Component, Prop, Vue, Emit } from "vue-property-decorator";
import RateChangeFormatter from "@/formatters/RateChange.vue";
import {
  HouseModel,
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
function deltify(delta: number | string): string {
  if (typeof delta === "string") {
    if (delta[0] !== "-") {
      return `+${delta}`;
    }
  } else {
    if (delta === 0) return "--";
    return deltify(delta.toLocaleString());
  }
  return `${delta}`;
}
@Component({
  components: {
    RateChangeFormatter
  }
})
export default class HouseComparisonCard extends Vue {
  @Prop(Object)
  houseA!: HouseModel;
  @Prop(Object)
  houseB!: any;
  get thumbnail() {
    return this.houseB.smallPhotos[0].url;
  }
  get title(): string {
    return this.houseB.address.streetAddress;
  }
  get subTitle(): string {
    return `${this.houseB.address.city}, ${this.houseB.address.state}`;
  }
  get livingArea(): number {
    return this.houseB.livingArea;
  }
  get status(): string {
    let status = parseSnakeCase(this.houseB.homeStatus);
    if (status === "for sale" || status === "pending") {
      status += ` for ${this.houseB.daysOnZillow} day${
        this.houseB.daysOnZillow !== 1 ? "s" : ""
      }`;
    } else if (status.includes("sold") || status.includes("pending")) {
      status += ` ${dateYearMonth(this.houseB.dateSold)}`;
    }
    return status;
  }
  get priceString(): string {
    return fullPrice(this.price);
  }
  get price(): number {
    if (this.status.includes("for sale")) {
      return this.houseB.price;
    }
    return this.houseB.lastSoldPrice || 0;
  }
  get yearBuilt(): number {
    return this.houseB.yearBuilt;
  }
  get bedrooms(): number {
    return this.houseB.bedrooms;
  }
  // more is better
  get bedroomDelta(): string {
    return deltify(this.bedrooms - this.houseA.bedrooms);
  }
  get bathrooms(): number {
    return this.houseB.bathrooms;
  }
  // more is better
  get bathroomDelta(): string {
    return deltify(this.bathrooms - this.houseA.bathrooms);
  }
  get lotSize(): number {
    return acreage(this.houseB.lotSize);
  }
  // more is better
  get lotSizeDelta(): string {
    return deltify(this.lotSize - this.houseA.acreage);
  }
  // newer is better
  get yearBuiltDelta(): string {
    return deltify(this.yearBuilt - this.houseA.yearBuilt);
  }
  // less is better
  get priceDelta(): string {
    return deltify(
      this.price - (this.houseA.price || this.houseA.lastSoldPrice || 0)
    );
  }
  // more is better
  get livingAreaDelta(): string {
    return deltify(this.livingArea - this.houseA.livingArea);
  }
}
</script>


<style lang="scss" scoped>
.house-card {
  .card-image {
    max-width: 200px;
  }
  .card-title {
    font-size: 1.3rem;
  }
  .card-subtitle {
    font-size: 0.9rem;
  }
}
</style>

