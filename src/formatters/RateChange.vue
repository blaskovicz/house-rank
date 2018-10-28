<template>
    <span :class="rateClass">
        <slot></slot>{{rateDelta}}
    </span>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
@Component
export default class RateChangeFormatter extends Vue {
  @Prop(Boolean)
  inverse!: boolean;
  @Prop(String)
  rate!: string;
  get rateDelta(): string {
    if (!!this.$slots.default) {
      return ` (${this.rate})`;
    }
    return this.rate;
  }
  get rateClass(): string {
    if (!this.rate || this.rate === "--") return "";
    if (this.rate[0] === "-") {
      if (this.inverse) {
        return "positive";
      }
      return "negative";
    }
    if (this.rate[0] === "+") {
      if (this.inverse) {
        return "negative";
      }
      return "positive";
    }
    return "";
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
