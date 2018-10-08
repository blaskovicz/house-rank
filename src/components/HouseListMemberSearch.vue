<template>
  <div>
    <div id='search-controls'>
      <b-row>
        <b-col sm="3"><label for="house-road">Member Email</label></b-col>
        <b-col sm="9">
          <b-form-input v-model="email" type="text" placeholder="someone@gmail.com"></b-form-input>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm='3'></b-col>
        <b-col sm='9'><b-button @click="selectMember" size='sm' variant='primary'>[add]</b-button></b-col>
      </b-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from "vue-property-decorator";

@Component
export default class HouseListMemberSearch extends Vue {
  email: string = "";

  @Emit("member-selected")
  selectMember() {
    return this.email;
  }
}
</script>
