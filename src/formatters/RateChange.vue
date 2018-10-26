<template>
    <span :class="rateClass">
        <slot></slot>
    </span>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
@Component
export default class RateChangeFormatter extends Vue {
  @Prop(String)
  rate!: string;
  get rateClass() {
    if (!this.rate || this.rate === "--") return "";
    if (this.rate[0] === "-") return "negative";
    if (this.rate[0] === "+") return "positive";
  }
}
</script>

<style lang="scss" scoped>
.positive {
  color: rgb(3, 192, 74);
}
.negative {
  color: rgb(252, 56, 74);
}
.none {
}
</style>
