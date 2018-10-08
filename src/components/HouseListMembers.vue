<template>
  <div id="members">
    <b-table responsive striped hover small :items="members" :fields="fields">
      <template slot="options" slot-scope="row">      
        <b-button @click="memberRemoved(row.item.id)" size='sm' variant='primary'>[remove]</b-button>
      </template>     
    </b-table>    
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component
export default class HouseListMembers extends Vue {
  @Prop() private members!: any[];
  fields: any[] = [
    { key: "email", sortable: true },
    { key: "options", label: "Options", sortable: false }
  ];

  @Emit("member-removed")
  async memberRemoved(userId: any) {
    return userId;
  }
}
</script>

<style scoped lang="scss">
#members {
  overflow-y: auto;
  max-height: 20em;
  .thumbnail {
    width: 120px;
  }
}
</style>
