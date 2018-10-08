export default new class HouseRankApi {
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

    const res = await fetch(`${apiUrl}?${query}`, {
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
