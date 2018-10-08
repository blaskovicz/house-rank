<template>
  <div id="houses">
    <b-table responsive striped hover small :items="houses" :fields="fields">
      <template slot="image" slot-scope="data">
        <a target="_blank" rel="noopener noreferer" :href="`https://www.zillow.com/homedetails/${data.item.zpid}_zpid`">
          {{data.item.zpid}}
          {{data.item.zillow.property.keystoneHomeStatus}}
          <img class="thumbnail" :alt="data.item.zillow.property.photos[0].caption" :src="data.item.zillow.property.photos[0].url" >
        </a>
      </template>
      <template slot="address" slot-scope="data">
        {{data.item.zillow.property.streetAddress}}
      </template>
      <template slot="city" slot-scope="data">
        {{data.item.zillow.property.city}}
      </template>
      <template slot="state" slot-scope="data">
        {{data.item.zillow.property.state}}
      </template>
      <template slot="bedrooms" slot-scope="data">
        {{data.item.zillow.property.bedrooms}}
      </template>
      <template slot="bathrooms" slot-scope="data">
        {{data.item.zillow.property.bathrooms}}
      </template>
      <template slot="acreage" slot-scope="data">
        {{data.item.zillow.property.lotSize / 43560}}
      </template>
     <template slot="built" slot-scope="data">
        {{data.item.zillow.property.yearBuilt}}
      </template>
     <template slot="livingArea" slot-scope="data">
        {{data.item.zillow.property.livingArea}}sqft
      </template>  
     <template slot="price" slot-scope="data">
        ${{data.item.zillow.property.price}}
      </template>
     <template slot="appraised" slot-scope="data">
        ${{(data.item.zillow.property.taxAssessedValue/7)*10}} (${{data.item.zillow.property.taxAssessedValue}})
      </template>   
     <template slot="daysListed" slot-scope="data">
        {{data.item.zillow.property.daysOnZillow}}
      </template>                                      

      <template slot="options" slot-scope="row">
        <b-button size="sm" @click.stop="row.toggleDetails" class="mr-2">
          {{ row.detailsShowing ? 'Hide' : 'Show'}} Details
        </b-button>        
        <b-button @click="houseRemoved(row.item.zpid)" size='sm' variant='primary'>[remove]</b-button>
      </template>
      <template slot="row-details" slot-scope="row">
        <div>
           <div v-for="(category, i) in row.item.zillow.property.homeFacts.categoryDetails" :key="category.categoryGroupName+i">
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
          <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button>
        </div>
      </template>      
    </b-table>    
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component
export default class HouseList extends Vue {
  @Prop() private houses!: any[];
  fields: any[] = [
    { key: "image", label: "", sortable: false },
    {
      key: "type",
      sortable: false,
      formatter: (value: any, key: any, item: any) => {
        // special info is burried deep within categories/sub-categories
        const c2 = item.zillow.property.homeFacts.categoryDetails.find(
          (c: any) => c.categoryGroupName === "Construction"
        );
        for (const c3 of c2.categories) {
          if (c3.categoryName !== "Type and Style") {
            continue;
          }
          return (c3.categoryFacts as any[])
            .filter((c4: any) => c4.factLabel === "Structure type")
            .map((c5: any) => c5.factValue)
            .join(", ");
        }
      }
    },
    { key: "address", sortable: false },
    { key: "city", sortable: false },
    { key: "state", sortable: false },
    { key: "id", sortable: true },
    { key: "bedrooms", sortable: false },
    { key: "bathrooms", sortable: false },
    { key: "acreage", sortable: false },
    { key: "built", sortable: false },
    { key: "livingArea", Label: "Living Area", sortable: false },
    { key: "price", sortable: false },
    { key: "appraised", sortable: false },
    { key: "daysListed", sortable: false }, // TODO actual listing days based on listing history add/remove
    // { key: "zestimate", sortable: false },
    { key: "options", label: "Options", sortable: false }
  ];

  @Emit("house-removed")
  async houseRemoved(zpid: any) {
    return zpid;
  }
}
</script>

<style scoped lang="scss">
#houses {
  overflow-y: auto;
  max-height: 20em;
  .thumbnail {
    width: 120px;
  }
}
</style>
