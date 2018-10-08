<template>
  <div>
    <!-- TODO <house-list-select /> -->
    <house-search @house-selected="addHouse" />
    <house-list v-if="houseList" @house-removed="removeHouse" :houses="houseList.houses" />
    <!-- TODO <house-ranking-rules /> -->
    <house-list-member-search @member-selected="addMember" />
    <house-list-members v-if="houseList" @member-removed="removeMember" :members="houseList.members" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import VueRouter, { Route } from "vue-router";
import HouseSearch from "./HouseSearch.vue";
import HouseList from "./HouseList.vue";
import HouseListMembers from "./HouseListMembers.vue";
import HouseListMemberSearch from "./HouseListMemberSearch.vue";

import Api from "../lib/Api";

const extendedHouseData = `
  id
  zpid
  zillow {
    pricing {
      zpid
      livingArea
      countyFIPS
      parcelId
      taxHistory {
        time
        taxPaid
        taxIncreaseRate
        value
        valueIncreaseRate
      }
      priceHistory {
        time
        price
        priceChangeRate
        event
        source
        sellerAgent {
          photo {
            url
          }
          profileUrl
          name
        }
        buyerAgent {
          photo {
            url
          }
          profileUrl
          name
        }
        postingIsRental
      }
    }
    property {
      id
      daysOnZillow
      dateSold
      lastSoldPrice
      isZillowOwned
      city
      propertyTypeDimension
      hdpTypeDimension
      listingTypeDimension
      featuredListingTypeDimension
      brokerIdDimension
      keystoneHomeStatus
      rentalApplicationsAcceptedType
      yearBuilt
      boroughId
      brokerId
      brokerageName
      providerListingID
      postingProductType
      rentalRefreshTime
      isFeatured
      rentalDateAvailable
      newConstructionType
      comingSoonOnMarketDate
      listingStatusChangeDate
      isPreforeclosureAuction
      taxAssessedValue
      taxAssessedYear
      priceChange
      isNonOwnerOccupied
      isRecentStatusChange
      forecast
      homeStatus
      homeType
      country
      description
      isUndisclosedAddress
      isInstantOfferEnabled
      rentZestimate
      restimateHighPercent
      restimateLowPercent
      restimateMinus30
      state
      regionString
      streetAddress
      abbreviatedAddress
      lotSize
      zestimate
      zestimateHighPercent
      zestimateLowPercent
      zestimateMinus30
      zipcode
      zpid
      price
      yearBuilt
      bedrooms
      bathrooms
      livingArea
      hoaFee
      propertyTaxRate
      photos: smallPhotos {
        width
        height
        url
        caption
      }
      homeFacts {
        categoryDetails {
          categoryGroupName
          categories {
            categoryFacts {
              factLabel
              factValue
            }
            categoryName
          }
        }
      }
    }  
  }
`;

@Component({
  components: {
    HouseSearch,
    HouseList,
    HouseListMembers,
    HouseListMemberSearch
  }
})
export default class HouseRankApp extends Vue {
  houseList: any = null;
  $router!: VueRouter;
  $route!: Route;
  listState: any = null;

  beforeRouteUpdate(to: Route, from: Route, next: Function) {
    next();
  }
  async created() {
    // query lists, set active
    try {
      const resData = await Api.graphqlRequest(`query {
  user {
    ownedHouseLists {
      id
      name
      houses {
        ${extendedHouseData}
      }
      members {
        id
        email
      }
    }
    memberHouseLists {
      id
      name
      houses {
        ${extendedHouseData}
      }
      members {
        id
        email
      }      
    }
  }
}`);

      const listId = +this.$route.params.listId;

      this.listState = resData.user;

      // incoming route param, locate list
      if (listId) {
        // ... in owned lists?
        this.houseList = this.listState.ownedHouseLists.find(
          (l: any) => l.id === listId
        );
        // ... in member lists?
        if (!this.houseList) {
          this.houseList = this.listState.memberHouseLists.find(
            (l: any) => l.id === listId
          );
        }
      }

      // no list!
      if (!this.houseList) {
        if (this.listState.ownedHouseLists.length > 0) {
          // ... take the first owned list
          this.houseList = this.listState.ownedHouseLists[0];
        } else if (this.listState.memberHouseLists.length > 0) {
          // ... otherwise the first member list
          this.houseList = this.listState.memberHouseLists[0];
        }
      }

      // make sure the route is correct
      if (this.houseList) {
        if (this.houseList.id !== listId) {
          // ... by adding the list id
          this.$router.push(`/${this.houseList.id}`);
        }
      } else {
        if (listId) {
          // ... or removing it
          this.$router.push(`/`);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }
  async removeMember(userId: number) {
    try {
      const resData = await Api.graphqlRequest(
        `mutation RemoveUserFromList($listId: Int!, $userId: Int!) {
      removeUserFromList(listId: $listId, id: $userId) {
        id
        email
      }
    }`,
        { userId, listId: this.houseList.id }
      );
      const toSplice = (this.houseList.members as any[]).findIndex(
        (m: any) => m.id === userId
      );
      this.houseList.members.splice(toSplice, 1);
      this.houseList = this.houseList;
    } catch (e) {
      console.warn(e);
    }
  }
  async addMember(email: string) {
    try {
      const resData = await Api.graphqlRequest(
        `mutation AddUserToList($listId: Int!, $email: String!) {
      addUserToList(listId: $listId, email: $email) {
        id
        email
      }
    }`,
        { email, listId: this.houseList.id }
      );
      this.houseList.members.push(resData.addUserToList);
      this.houseList = this.houseList;
    } catch (e) {
      console.warn(e);
    }
  }

  async removeHouse(zpid: string) {
    // remove house, update l      // add house, update list
    try {
      const resData = await Api.graphqlRequest(
        `mutation RemoveHouseFromList($listId: Int!, $zpid: String!) {
      removeHouseFromList(listId: $listId, zpid: $zpid) {
        id
        zpid
      }
    }`,
        { zpid, listId: this.houseList.id }
      );
      const toSplice = (this.houseList.houses as any[]).findIndex(
        (h: any) => h.id === resData.removeHouseFromList.id
      );
      this.houseList.houses.splice(toSplice, 1);
      this.houseList = this.houseList;
    } catch (e) {
      console.warn(e);
    }
  }
  async addHouse(zpid: string) {
    try {
      if (!this.houseList) {
        const resData = await Api.graphqlRequest(
          `mutation CreateHouseList($name: String!) {
    createHouseList(name: $name) {
      id
      name
      houses {
        ${extendedHouseData}
      }
      members {
        id
        email
      }      
    }
  }`,
          { name: "default" }
        );
        this.houseList = resData.createHouseList;
      }
      const hasHouse = (this.houseList.houses as any[]).find(
        (h: any) => h.zpid === zpid
      );
      if (hasHouse) return;

      // add house, update list
      const resData = await Api.graphqlRequest(
        `mutation AddHouseToList($listId: Int!, $zpid: String!) {
      addHouseToList(listId: $listId, zpid: $zpid) {
        ${extendedHouseData}
      }
    }`,
        { zpid, listId: this.houseList.id }
      );
      this.houseList.houses.push(resData.addHouseToList);
      this.houseList = this.houseList;
    } catch (e) {
      console.warn(e);
    }
  }
}
</script>

<style scoped lang="scss">
</style>