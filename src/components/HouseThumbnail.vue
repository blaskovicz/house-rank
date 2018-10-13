<template>
    <div class='house-thumbnail-wrapper'>
        <a target="_blank" rel="noopener noreferer" :href="`https://www.zillow.com/homedetails/${zillowId}_zpid`">
            <div class="for-sale-status">{{status}}</div>
            <img class="for-sale-thumb" :alt="caption" :src="url" >
        </a>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";
@Component
export default class HouseThumbnail extends Vue {
  @Prop(String)
  zillowId!: string;

  @Prop(String)
  caption!: string;

  @Prop(String)
  url!: string;

  @Prop(String)
  status!: string;
}
</script>

<style scoped lang="scss">
.house-thumbnail-wrapper {
  background: #efefef;
}
.for-sale-thumb {
  width: 120px;
}
.for-sale-status {
  font-size: 10pt;
}
</style>
