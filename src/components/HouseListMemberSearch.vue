<template>
  <div>
    <div id='search-controls'>
      <b-form @submit="selectMember" inline>
        <label class="mr-sm-2" for="house-road">Member Email</label>
        <b-form-input class="mr-sm-2" required v-model="email" type="text" placeholder="someone@gmail.com"></b-form-input>
        <b-button @click="selectMember" size='sm' variant='primary'>Add Member to List</b-button>
      </b-form>
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

<style scoped lang="scss">
#search-controls {
  margin-top: 2em;
  margin-bottom: 2em;
}
</style>
