<template>
    <b-card
      @click.stop.prevent='view'
        img-top
        overlay
        img-fluid
        class="house-card"
        :title="title"
        :sub-title="subTitle"
        :img-src="thumbnail">
        <div v-if='addable' v-b-tooltip="'Add To List'" class='add' @click.stop.prevent='add'>+</div>
        <div v-if='removable' v-b-tooltip="'Remove From List'" class='remove' @click.stop.prevent='remove'>x</div>
        <div class='card-text'>
          <div v-if='hasScore' :id="`score-${house.zpid}`" class='hoverable'>
            score {{score}}
          </div>
          <b-popover v-if='hasScore' title='About this Score' :target="`score-${house.zpid}`" triggers="hover focus">
            <table class='score-table'>
              <tr v-for="ex in scoreExplanation" :key="`${ex.scorePart} ${ex.reason}`">
                <td>
                  <div class='score-part'>
                    <b>{{ex.scorePart.toFixed(2)}}/{{ex.scoreMax}}</b>:
                  </div>
                </td>
                <td>
                  <div class='score-reason'>{{ex.reason}}</div>
                </td>
              </tr>
            </table>
          </b-popover>
          <div :id="`price-${house.zpid}`" class='hoverable'>
              {{priceStringShort}} / {{taxStringShort}}
          </div>
          <b-popover title='Breakdown' :target="`price-${house.zpid}`" triggers="hover focus">
            <table class='score-table'>
              <tr>
                <td>
                  <div class='score-part'>
                    <b>Price</b>:
                  </div>
                </td>
                <td>
                  <div class='score-reason'>{{priceStringFull}}</div>
                </td>
              </tr>              
              <tr>
                <td>
                  <div class='score-part'>
                    <b>Taxes</b>:
                  </div>
                </td>
                <td>
                  <div class='score-reason'>{{taxStringFull}} / yr</div>
                </td>
              </tr>              
              <tr>
                <td>
                  <div class='score-part'>
                    <b>Appraised</b>:
                  </div>
                </td>
                <td>
                  <div class='score-reason'>{{priceAppraised}}</div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class='score-part'>
                    <b>Assessed</b>:
                  </div>
                </td>
                <td>
                  <div class='score-reason'>{{priceAssessed}}</div>
                </td>
              </tr>                                        
            </table>
          </b-popover>          
          <div>
              {{livingArea}} sqft
          </div>
          <div>
              {{bedrooms}} bd /
              {{bathrooms}} ba
          </div>                        
          <div>
              {{lotSize}} acres
          </div>
          <div>
              built {{yearBuilt}}
          </div>
          <div>
              {{status}}
          </div>
        </div>
    </b-card>    
</template>

<script lang="ts">
import { Watch, Component, Prop, Vue, Emit } from "vue-property-decorator";
import {
  HouseModel,
  percentage,
  fullPrice,
  priceAppraised,
  priceAssessed,
  acreage,
  dateYearMonth,
  dateYear,
  dateYearMonthDay,
  shortPrice
} from "@/lib/house";
import { parseUpperCamelCase, parseSnakeCase } from "@/lib/string";
import eventBus from "@/lib/events";

@Component({
  components: {}
})
export default class HouseComparisonCard extends Vue {
  @Prop(Object)
  house!: HouseModel;

  @Prop(Boolean)
  removable!: boolean;

  @Prop(Boolean)
  addable!: boolean;

  get hasScore(): boolean {
    return !!this.house.score;
  }
  get scoreExplanation() {
    return this.house.scoreExplanation;
  }
  get score(): string {
    return this.house.score.toFixed(2);
  }
  get thumbnail() {
    return this.house.raw.zillow.property.smallPhotos[0].url;
  }
  get title(): string {
    return this.house.streetAddress;
  }
  get subTitle(): string {
    return `${this.house.city}, ${this.house.state}`;
  }
  get livingArea(): number {
    return this.house.livingArea;
  }
  get status(): string {
    let status = parseSnakeCase(this.house.status);
    if (status === "for sale" || status === "pending") {
      status += ` for ${this.house.daysListed} day${
        this.house.daysListed !== 1 ? "s" : ""
      }`;
    } else if (status.includes("sold") || status.includes("pending")) {
      status += ` ${dateYearMonth(this.house.dateSold)}`;
    }
    return status;
  }
  get priceStringShort(): string {
    return shortPrice(this.price);
  }
  get priceStringFull(): string {
    return shortPrice(this.price);
  }
  get taxStringShort(): string {
    return shortPrice(this.house.taxPaid);
  }
  get taxStringFull(): string {
    return fullPrice(this.house.taxPaid);
  }
  get price(): number {
    if (this.status.includes("for sale") || this.status.includes("pending")) {
      return this.house.price;
    }
    return this.house.lastSoldPrice || 0;
  }
  get taxPaid(): string {
    return fullPrice(this.house.taxPaid);
  }
  get priceAssessed(): string {
    return fullPrice(this.house.priceAssessed);
  }
  get priceAppraised(): string {
    return fullPrice(this.house.priceAppraised);
  }
  get yearBuilt(): number {
    return this.house.yearBuilt;
  }
  get bedrooms(): number {
    return this.house.bedrooms;
  }
  get bathrooms(): number {
    return this.house.bathrooms;
  }
  get lotSize(): number {
    return this.house.acreage;
  }
  @Emit()
  remove() {}
  @Emit()
  add() {}
  view() {
    eventBus.$emit("house:modal:show", this.house);
  }
}
</script>


<style lang="scss" scoped>
$white-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff,
  -1px 1px 0 #fff, 1px 1px 0 #fff;
$black-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000,
  -1px 1px 0 #000, 1px 1px 0 #000;
.house-card {
  min-height: 10rem;
  width: 15rem;
  // min-width: 15rem;
  // max-width: 20rem;
  color: #fff;
  font-weight: 700;
  &:hover {
    cursor: pointer;
    border: 1px solid #fff;
  }
  .remove,
  .add {
    font-size: 20pt;
    // TODO: couldn't figure out slot?
    float: right;
    position: absolute;
    top: 0;
    right: 0;
    margin: 10px;
    &:hover {
      color: #000;
      text-shadow: $white-shadow;
    }
  }
  img {
    -webkit-filter: contrast(60%); /* Safari 6.0 - 9.0 */
    filter: contrast(60%);
  }
  .card-title {
    color: #000;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 5px !important;
    text-shadow: $white-shadow;
  }
  .card-subtitle {
    color: #000 !important;
    font-size: 0.9rem;
    font-weight: 700 !important;
    margin-bottom: 0 !important;
    text-shadow: $white-shadow;
  }
  .card-image-overlay {
    color: white;
    background: red;
  }
  .card-body {
    overflow: hidden;
    padding: 10px;
    line-height: 12pt;
    text-shadow: $black-shadow;
    .hoverable:hover {
      text-decoration: underline;
      // cursor: help;
    }
  }
  .score-table {
    table-layout: fixed;
  }
}
</style>

