<template>
    <l-tooltip>
        <div class="tooltip-container-wrapper">
            <div class="tooltip-icon">
                <b-img-lazy rounded fluid fluid-grow class="d-block img-fluid w-100" :alt="house.zpid" :width="80" :src="house.thumbnailUrl || house.imageLink" />
            </div>
            <div class="tooltip-stats">
                <!-- <div>{{house.streetAddress || house.street}}</div>
                <div>{{house.city}}</div>               -->
                <div>${{house.price}}</div>
                <div>{{house.bedrooms}}bd, {{house.bathrooms}}ba</div>
                <div>{{house.livingArea}}sqft</div>
                <div class='house-status' v-if="house.status !== 'for sale'">{{house.status}}</div>
            </div>
        </div>
    </l-tooltip>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { HouseModel } from "@/lib/house";
const { LTooltip } = require("vue2-leaflet");

@Component({
  components: {
    LTooltip
  }
})
export default class HouseMapTooltip extends Vue {
  @Prop(Object)
  house!: HouseModel;
}
</script>

<style scoped lang="scss">
.tooltip-container-wrapper {
  width: 200px;
  .tooltip-icon {
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
    .house-status {
      font-weight: bold;
    }
  }
}
</style>