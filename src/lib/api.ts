export const commonZillowHouseDataGraphql = `
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
    latitude
    longitude
    smallPhotos {
      width
      height
      url
      caption
    }
    hugePhotos {
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

export default new class Api {
  state: { principal: any } = {
    principal: null
  };
  get gapi() {
    return (window as any).gapi;
  }
  set principal(value) {
    this.state.principal = value;
  }
  get principal() {
    return this.state.principal;
  }
  private assertPrincipal() {
    if (this.principal) return;
    throw new Error("Assertion failure: principal missing");
  }
  public onSignIn(user: any) {
    this.principal = user;
    this.assertPrincipal();
    console.log(this.principal.getBasicProfile().getName(), "signed in");
  }
  public async signOut() {
    this.assertPrincipal();
    await this.gapi.auth2.getAuthInstance().signOut();
    this.principal = null;
  }
  public renderSignIn(elementId: string) {
    (window as any).gapi.signin2.render(elementId, {
      onsuccess: this.onSignIn.bind(this)
    });
  }
  public async request(
    apiUrl: string,
    options?: {
      qs?: { [key: string]: any };
      method?: string;
      headers?: { [key: string]: string };
      body?: any;
    }
  ): Promise<any> {
    if (!apiUrl) throw new Error("Assertion failure: apiUrl missing");
    let apiPrefix = "";
    if (process.env.VUE_APP_API_PREFIX && apiUrl.startsWith("/")) {
      apiPrefix = process.env.VUE_APP_API_PREFIX;
    }

    let query = "";
    let method = "GET";
    let body;
    const headers = {
      Authorization: `Bearer ${this.principal.getAuthResponse().id_token}`
    };

    if (options) {
      if (options.qs) {
        query = Object.keys(options.qs)
          .map(
            k =>
              `${encodeURIComponent(k)}=${encodeURIComponent(
                options.qs![k] || ""
              )}`
          )
          .join("&");
      }
      if (options.method) {
        method = options.method;
      }
      if (options.body) {
        if (typeof options.body !== "string") {
          throw new Error("Assertion failure: options.body must be string");
        }
        body = options.body;
      }
      if (options.headers) {
        Object.assign(headers, options.headers);
      }
    }

    const res = await fetch(`${apiPrefix}${apiUrl}?${query}`, {
      method,
      body,
      headers
    });

    const resBody = await res.clone().text();
    if (res.status !== 200) {
      let jsonResBody: any;
      try {
        jsonResBody = JSON.parse(resBody);
      } catch {
        throw resBody;
      }
      throw jsonResBody;
    }
    return JSON.parse(resBody);
  }
  public async graphqlRequest(
    query: string,
    variables?: { [key: string]: any }
  ): Promise<any> {
    const body: { query: any; variables?: any } = {
      query
    };
    if (variables) {
      body.variables = variables;
    }

    const res = await this.request("/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    });

    // this should already happen since errors will return a non-2xx response, and, thus, throw.
    if (res.errors) {
      throw res;
    }
    return res.data;
  }
}();
