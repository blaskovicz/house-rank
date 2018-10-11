<template>
    <div v-if="house">
        <div v-for="(category, i) in house.zillow.property.homeFacts.categoryDetails" :key="category.categoryGroupName+i">
        <b-card :title="category.categoryGroupName">
            <div v-for="(factCategory, j) in category.categories" :key="factCategory.categoryName+j">
            <b-row class="mb-2" v-for="(fact,k) in factCategory.categoryFacts" :key="fact.factLabel+k">
                <b-col sm="3" class="text-sm-right">
                <b>{{fact.factLabel}}</b>
                </b-col>
                <b-col class="text-sm-left">{{ fact.factValue }}</b-col>
            </b-row>
            </div>
        </b-card>
        </div> 
        <b-button size="sm" @click="close">Hide Details</b-button>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";

@Component
export default class HouseCategoryDetails extends Vue {
  @Prop()
  private house!: any;
  @Emit()
  close() {}
}
</script>