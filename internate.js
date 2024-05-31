const attributes = {
  lernschwaechen: { type: "attribute", name: "Lernschwächen", category: "Schwerpunkt" },
  liberal: { type: "attribute", name: "Liberale Ausrichtung", category: "Schwerpunkt" },
  eliteinternate: { type: "attribute", name: "Eliteinternate", category: "Schwerpunkt" },
  "international-baccalaureate": { type: "attribute", name: "International Baccalaureate", category: "Schwerpunkt" },
  abitur: { type: "attribute", name: "Abitur", category: "Schwerpunkt" },
  schuluniform: { type: "attribute", name: "Uniform", category: "Schwerpunkt" },
  erlebnispaedagogik: { type: "attribute", name: "Outdoor Education", category: "Schwerpunkt" },
  "round-square": { type: "attribute", name: "Round Square", category: "Schwerpunkt" },
  ski: { type: "attribute", name: "Ski", category: "Sport" },
  wirtschaft: { type: "attribute", name: "Wirtschaft", category: "Schwerpunkt" },
  kirchlich: { type: "attribute", name: "Kirchlicher Hintergrund", category: "Schwerpunkt" },
  mint: { type: "attribute", name: "MINT/STEM/NatWi", category: "Schwerpunkt" },
  segeln: { type: "attribute", name: "Segeln", category: "Sport" },
  musik: { type: "attribute", name: "Musik", category: "Schwerpunkt" },
  reitinternate: { type: "attribute", name: "Reiten", category: "Sport" },
  tennis: { type: "attribute", name: "Tennis", category: "Sport" },
  schlossinternate: { type: "attribute", name: "Schloss", category: "Schwerpunkt" },
  kunst: { type: "attribute", name: "Kunst", category: "Schwerpunkt" },
  rudern: { type: "attribute", name: "Rudern", category: "Sport" },
  eishockey: { type: "attribute", name: "Eishockey", category: "Sport" },
  sportinternat: { type: "attribute", name: "Sport", category: "Sport" },
  fussballinternate: { type: "attribute", name: "Fußball", category: "Sport" },
  hockey: { type: "attribute", name: "Hockey", category: "Sport" },
  tanz: { type: "attribute", name: "Tanz", category: "Schwerpunkt" },
  bauernhof: { type: "attribute", name: "Farm/Bauernhof/Tiere", category: "Schwerpunkt" },
  modedesign: { type: "attribute", name: "Textiles/Fashion/Design", category: "Schwerpunkt" },
  theater: { type: "attribute", name: "Theater", category: "Schwerpunkt" },
  schwimmen: { type: "attribute", name: "Schwimmen", category: "Sport" },
  realschulinternate: { type: "attribute", name: "Realschule", category: "Schwerpunkt" },
  "sixth-form-colleges": { type: "attribute", name: "Sixth-Form-College", category: "Schwerpunkt" },
  informatik: { type: "attribute", name: "IT/Robotik/Coding", category: "Schwerpunkt" },
  basketball: { type: "attribute", name: "Basketball", category: "Sport" },
  golfinternate: { type: "attribute", name: "Golf", category: "Sport" },
  "advanced-placement": { type: "attribute", name: "AP Placement", category: "Schwerpunkt" },
  highschool: { type: "attribute", name: "American High School", category: "Schwerpunkt" },
  summercamp: { type: "attribute", name: "Summer Camp", category: "Schwerpunkt" },
  igcse: { type: "attribute", name: "IGCSE", category: "Schwerpunkt" },
  grundschulinternate: { type: "attribute", name: "Grundschule", category: "Schwerpunkt" },
  "a-level": { type: "attribute", name: "A-Level", category: "Schwerpunkt" },
  fachabitur: { type: "attribute", name: "Fachabitur", category: "Schwerpunkt" },
  internatsgymnasium: { type: "attribute", name: "Abitur", category: "Schwerpunkt" },
  fachoberschule: { type: "attribute", name: "Fachoberschule", category: "Schwerpunkt" },
  "middle-years-programme": { type: "attribute", name: "MYP", category: "Schwerpunkt" },
  baccalaureat: { type: "attribute", name: "Baccalauréat Français", category: "Schwerpunkt" },
  matura: { type: "attribute", name: "Matura", category: "Schwerpunkt" },
  hauptschule: { type: "attribute", name: "Hauptschule", category: "Schwerpunkt" },
  aufbaugymnasium: { type: "attribute", name: "Aufbaugymnasium", category: "Schwerpunkt" },
  jungeninternate: { type: "attribute", name: "Jungeninternate", category: "Schwerpunkt" },
  maedcheninternate: { type: "attribute", name: "Mädcheninternate", category: "Schwerpunkt" },
  adhs: { type: "attribute", name: "ADHS", category: "Schwerpunkt" },
  dyskalkulie: { type: "attribute", name: "Dyskalkulie", category: "Schwerpunkt" },
  hochbegabung: { type: "attribute", name: "Hochbegabung", category: "Schwerpunkt" },
  lrs: { type: "attribute", name: "LRS", category: "Schwerpunkt" },
};

const places = {
  deutschland: {
    type: "country",
    name: "Deutschland",
  },
  grossbritannien: {
    type: "country",
    name: "Großbritannien",
  },
  frankreich: {
    type: "country",
    name: "Frankreich",
  },
  italien: {
    type: "country",
    name: "Italien",
  },
  kanada: {
    type: "country",
    name: "Kanada",
  },
  schweiz: {
    type: "country",
    name: "Schweiz",
  },
  usa: {
    type: "country",
    name: "USA",
  },
  spanien: {
    type: "country",
    name: "Spanien",
  },
  oesterreich: {
    type: "country",
    name: "Österreich",
  },
  "schweiz-oesterreich": {
    type: "sharedcountry",
    name: "Schweiz / Österreich",
  },
  "spanien-italien": {
    type: "sharedcountry",
    name: "Spanien / Italien",
  },
  niederlande: {
    type: "country",
    name: "Niederlande",
  },
  australien: {
    type: "country",
    name: "Australien",
  },
  "baden-wuerttemberg": {
    type: "region",
    country: "Deutschland",
    name: "Baden-Württemberg",
  },
  bayern: {
    type: "region",
    country: "Deutschland",
    name: "Bayern",
  },
  berlin: {
    type: "region",
    country: "Deutschland",
    name: "Berlin",
  },
  brandenburg: {
    type: "region",
    country: "Deutschland",
    name: "Brandenburg",
  },
  bremen: {
    type: "region",
    country: "Deutschland",
    name: "Bremen",
  },
  hamburg: {
    type: "region",
    country: "Deutschland",
    name: "Hamburg",
  },
  hessen: {
    type: "region",
    country: "Deutschland",
    name: "Hessen",
  },
  "mecklenburg-vorpommern": {
    type: "region",
    country: "Deutschland",
    name: "Mecklenburg-Vorpommern",
  },
  niedersachsen: {
    type: "region",
    country: "Deutschland",
    name: "Niedersachsen",
  },
  "nordrhein-westfalen": {
    type: "region",
    country: "Deutschland",
    name: "Nordrhein-Westfalen",
  },
  "rheinland-pfalz": {
    type: "region",
    country: "Deutschland",
    name: "Rheinland-Pfalz",
  },
  saarland: {
    type: "region",
    country: "Deutschland",
    name: "Saarland",
  },
  sachsen: {
    type: "region",
    country: "Deutschland",
    name: "Sachsen",
  },
  "sachsen-anhalt": {
    type: "region",
    country: "Deutschland",
    name: "Sachsen-Anhalt",
  },
  "schleswig-holstein": {
    type: "region",
    country: "Deutschland",
    name: "Schleswig-Holstein",
  },
  thueringen: {
    type: "region",
    country: "Deutschland",
    name: "Thüringen",
  },
  england: {
    type: "country",
    country: "GB",
    name: "England",
  },
  schottland: {
    type: "country",
    country: "GB",
    name: "Schottland",
  },
  nordirland: {
    type: "country",
    country: "GB",
    name: "Nordirland",
  },
  wales: {
    type: "country",
    country: "GB",
    name: "Wales",
  },
};
const combinedData = { ...attributes, ...places };

const pathname = window.location.pathname;
const attributeStrings = pathname.slice(pathname.indexOf("/internate/") + "/internate/".length).split("/");

// configuring special names

for (let string = 0; string < attributeStrings.length; string++) {
  if (attributeStrings[string] === "ib") {
    attributeStrings[string] = "international-baccalaureate";
  }
}

// set filter

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  "cmsload",
  (listInstances) => {
    window.fsAttributes.cmsfilter.init();
  },
]);

window.fsAttributes.push([
  "cmsfilter",
  (listInstances) => {
    function processSlugs(...attributeSlugs) {
      const [attributes] = attributeSlugs;

      attributes.forEach((slug) => {
        if (!slug) return; // Skip if slug is undefined or null
        // Convert slug to camelCase and find corresponding item
        const item = combinedData[slug];

        // Check if item exists in the combinedData
        if (item) {
          // Generalize element ID construction and value assignment
          let filterType;

          switch (item.type) {
            case "country":
              filterType = "internate_filter_country";
              break;
            case "sharedcountry":
              filterType = "internate_filter_sharedcountry";
              break;
            case "region":
              filterType = "internate_filter_region";
              break;
            case "attribute":
              filterType = "internate_filter_attribute";
              break;
          }

          const inputElement = document.getElementById(filterType);

          if (inputElement) {
            // Check if element exists
            inputElement.value = slug;
            const event = new Event("input", { bubbles: true });
            inputElement.dispatchEvent(event);
          }

          // Here, you can add any additional logic specific to the item type
          // For example, you might have special handling for certain places or sports
        } else {
          console.log(`Slug not found: ${slug}`);
        }
      });
    }
    // Assuming attributeStrings is defined and accessible here
    processSlugs(attributeStrings);
  },
]);

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  "cmsfilter",
  (filterInstances) => {
    // console.log('cmsfilter Successfully loaded!');
    const [filterInstance] = filterInstances;

    filterInstance.listInstance.on("renderitems", (renderedItems) => {
      const internateItems = document.querySelectorAll(".internat-liste_item");
      if (internateItems) {
        for (let i = 0; i < internateItems.length; i++) {
          const country = internateItems[i].querySelector(".internatssuche_country");
          const region = internateItems[i].querySelector(".internatssuche_region");
          if (country.textContent === "Großbritannien") {
            country.style.display = "none";
            region.style.display = "block";
          }
        }
      }
    });
  },
]);

// INTERNAL LINKS

const internalLinksSection = document.querySelector(
  ".section_internal-links .padding-global .padding-section-medium .container-large"
);

const addInternalLinkSection = (attributeList, pageAttribute, secondPageAttribute) => {
  // PARENT DIV

  const internalLinkDiv = document.createElement("div");
  internalLinkDiv.classList.add("internal-links-container");
  internalLinksSection.append(internalLinkDiv);

  // HEADING

  const internalLinkHeading = document.createElement("h2");
  const combinedData = { ...attributes, ...places };

  if (secondPageAttribute) {
    if (attributeList === places) {
      switch (combinedData[pageAttribute].type) {
        case "country":
          internalLinkHeading.innerText = `Andere Länder mit Internaten, die ${combinedData[secondPageAttribute].name} anbieten`;
          break;
        case "region":
          internalLinkHeading.innerText = `Internate nach Bundesland`;
      }
    } else if (attributeList === attributes) {
      switch (combinedData[secondPageAttribute].category) {
        case "Sport":
          internalLinkHeading.innerText = `Andere von Internaten in ${combinedData[pageAttribute].name} angebotene Sportarten`;
          break;
        case "Schwerpunkt":
          internalLinkHeading.innerText = `Andere Schwerpunkte in ${combinedData[pageAttribute].name}`;
          break;
      }
    }
    internalLinkDiv.append(internalLinkHeading);
  } else if (!secondPageAttribute) {
    switch (attributes[pageAttribute].category) {
      case "Sport":
        internalLinkHeading.innerText = `Andere von Internaten angebotene Sportarten`;
        break;
      case "Schwerpunkt":
        internalLinkHeading.innerText = `Internate mit anderen Schwerpunkten`;
        break;
    }
    internalLinkDiv.append(internalLinkHeading);
  }

  // SPACER

  const spacer = document.createElement("div");
  spacer.classList.add("spacer-medium");
  internalLinkDiv.append(spacer);

  // LINKS CONTAINER

  const linksContainer = document.createElement("div");
  linksContainer.classList.add("internal-links_flex-container");
  internalLinkDiv.append(linksContainer);

  // LINKS

  class Link {
    constructor(href, text, target = "_self") {
      this.element = document.createElement("a");
      this.element.href = href;
      this.element.textContent = text;
      this.element.target = target;
    }

    // Method to append the element to a parent
    appendTo(parent) {
      if (parent instanceof HTMLElement) {
        parent.appendChild(this.element);
      }
    }
  }

  // Set different places

  let attributeData = [];
  for (let slug in attributeList) {
    if (attributeList.hasOwnProperty(slug)) {
      attributeData.push({
        slug,
        type: attributeList[slug].type,
        name: attributeList[slug].name,
        category: attributeList[slug].category,
      });
    }
  }
  if (attributeList === places) {
    switch (places[pageAttribute].type) {
      case "country":
        const countriesObject = Object.keys(places).reduce((acc, key) => {
          if (places[key].type === "country") {
            acc[key] = places[key];
          }
          return acc;
        }, {});
        let countries = [];
        for (let country in countriesObject) {
          if (countriesObject.hasOwnProperty(country)) {
            countries.push({ country, type: countriesObject[country].type, name: countriesObject[country].name });
          }
        }
        countries.forEach((country) => {
          // making sure current page is not added to internal links
          if (country.country === pageAttribute) return;
          // Add link to list
          const link = new Link(
            `https://internate-org-253554.webflow.io/internate/${country.country}/${secondPageAttribute}`,
            `${country.name}`
          );
          link.element.classList.add("internal-link");
          link.appendTo(linksContainer);
        });
        break;
      case "region":
        const regionsObject = Object.keys(places).reduce((acc, key) => {
          if (places[key].type === "region") {
            acc[key] = places[key];
          }
          return acc;
        }, {});
        let regions = [];
        for (let region in regionsObject) {
          if (regionsObject.hasOwnProperty(region)) {
            regions.push({ region, type: regionsObject[region].type, name: regionsObject[region].name });
          }
        }
        regions.forEach((region) => {
          const link = new Link(
            `https://internate-org-253554.webflow.io/internate/deutschland/${region.region}`,
            `${region.name}`
          );
          link.element.classList.add("internal-link");
          link.appendTo(linksContainer);
        });
        break;
    }
  }
  if (attributeList === attributes) {
    if (secondPageAttribute) {
      if (combinedData[secondPageAttribute].category === "Sport") {
        attributeData.forEach((attribute) => {
          // making sure current page is not added to internal links
          if (combinedData[secondPageAttribute].name === attribute.name) return;
          // Add link to list
          if (attribute.category === "Sport") {
            const link = new Link(
              `https://internate-org-253554.webflow.io/internate/${pageAttribute}/${attribute.slug}`,
              `${attribute.name}`
            );
            link.element.classList.add("internal-link");
            link.appendTo(linksContainer);
          }
        });
      }
      if (combinedData[secondPageAttribute].category === "Schwerpunkt") {
        attributeData.forEach((attribute) => {
          // making sure current page is not added to internal links
          if (combinedData[secondPageAttribute].name === attribute.name) return;
          // Add link to list
          if (attribute.category === "Schwerpunkt") {
            const link = new Link(
              `https://internate-org-253554.webflow.io/internate/${pageAttribute}/${attribute.slug}`,
              `${attribute.name}`
            );
            link.element.classList.add("internal-link");
            link.appendTo(linksContainer);
          }
        });
      }
    } else if (!secondPageAttribute) {
      const filteredAttributes = Object.entries(attributeList).filter(
        ([key, value]) => value.category === attributeList[pageAttribute].category
      );
      filteredAttributes.forEach(([key, value], index) => {
        const link = new Link(`https://internate-org-253554.webflow.io/internate/${key}`, `${value.name}`);
        link.element.classList.add("internal-link");
        link.appendTo(linksContainer);
      });
    }
  }

  // SPACER

  const largeSpacer = document.createElement("div");
  largeSpacer.classList.add("spacer-huge");
  internalLinkDiv.append(largeSpacer);
};

// ADD INTERNAL LINKS FOR COUNTRIES

const addInternalLinkSectionForCountries = (attributes, places, attributeKey) => {
  class Link {
    constructor(href, text, target = "_self") {
      this.element = document.createElement("a");
      this.element.href = href;
      this.element.textContent = text;
      this.element.target = target;
    }

    // Method to append the element to a parent
    appendTo(parent) {
      if (parent instanceof HTMLElement) {
        parent.appendChild(this.element);
      }
    }
  }
  const internalLinkDiv = document.createElement("div");
  internalLinkDiv.classList.add("internal-links-container");
  internalLinksSection.append(internalLinkDiv);

  const internalLinkHeading = document.createElement("h2");
  internalLinkHeading.innerText = `Internate nach Länder mit Schwerpunkt ${attributes[attributeKey].name}`;
  internalLinkDiv.append(internalLinkHeading);

  const spacer = document.createElement("div");
  spacer.classList.add("spacer-medium");
  internalLinkDiv.append(spacer);

  const linksContainer = document.createElement("div");
  linksContainer.classList.add("internal-links_flex-container");
  internalLinkDiv.append(linksContainer);

  Object.entries(places).forEach(([key, value]) => {
    if (value.type === "country") {
      const link = new Link(
        `https://internate-org-253554.webflow.io/internate/${key}/${attributeKey}`,
        `${value.name}`
      );
      link.element.classList.add("internal-link");
      link.appendTo(linksContainer);
    }
  });

  const largeSpacer = document.createElement("div");
  largeSpacer.classList.add("spacer-huge");
  internalLinkDiv.append(largeSpacer);
};

// ADD INTERNAL LINKS SECTIONS DEPENDING ON HOW MANY LEVELS

switch (attributeStrings.length) {
  case 1:
    addInternalLinkSection(attributes, attributeStrings[0], attributeStrings[1]);
    addInternalLinkSectionForCountries(attributes, places, attributeStrings[0]);
    break;
  case 2:
    addInternalLinkSection(places, attributeStrings[0], attributeStrings[1]);
    addInternalLinkSection(attributes, attributeStrings[0], attributeStrings[1]);
    break;
  case 3:
    addInternalLinkSection(places, attributeStrings[0], attributeStrings[2]);
    addInternalLinkSection(attributes, attributeStrings[0], attributeStrings[2]);
    addInternalLinkSection(places, attributeStrings[1], null);
}

const customContentHeading = document.querySelector(".page-intro-custom_heading");
if (customContentHeading.textContent === 'Überschrift "Above-the-fold"-Inhalt') {
  const customContentSection = document.getElementById("page-intro-custom");
  customContentSection.remove();
}

const customContentHeadingBtf = document.querySelector("#custom-content-btf");

if (customContentHeadingBtf.textContent === 'Überschrift "Below-the-fold"-Inhalt') {
  const customContentBtf = document.getElementById("desc-2");
  customContentBtf.remove();
}

const customHeroSubheading = document.getElementById("hero-subheading");

if (customHeroSubheading.textContent.toLowerCase() === "Text der Unterüberschrift".toLowerCase()) {
  customHeroSubheading.remove();
}

let heroTitle = document.getElementById("hero-title");

if (heroTitle.textContent.toLowerCase() === "Überschrift".toLowerCase()) {
  let metaTitle = document.title;
  metaTitle = metaTitle.replace(" | Internate.org", "");
  heroTitle.textContent = metaTitle;
}

const sitemapUrl = "https://internate-org-253554.webflow.io/sitemap.xml";

// Function to fetch and parse the sitemap XML
async function getUrlsFromSitemap(sitemapUrl) {
  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const urls = Array.from(xmlDoc.querySelectorAll("url loc")).map((urlElement) =>
      urlElement.textContent.trim()
    );

    // Filter URLs containing "/internate/"
    const internateUrls = urls.filter((url) => url.includes("/internate/"));

    return internateUrls;
  } catch (error) {
    console.error("Error fetching or parsing sitemap:", error);
    return [];
  }
}

// Function to filter links within a specified container based on the sitemap URLs
function filterLinksBySitemap(sitemapUrls, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Container not found:", containerSelector);
    return;
  }

  const internalLinksContainers = container.querySelectorAll(".internal-links-container");

  internalLinksContainers.forEach((linksContainer) => {
    const links = linksContainer.querySelectorAll("a.internal-link");

    const linksToRemove = Array.from(links).filter(
      (link) => !sitemapUrls.includes(link.getAttribute("href"))
    );

    // Remove invalid links
    linksToRemove.forEach((link) => link.remove());

    // Remove container if no links remain
    if (linksContainer.querySelectorAll("a.internal-link").length === 0) {
      linksContainer.remove();
    }
  });
}

// Fetch URLs from the sitemap and filter links by sitemap URLs
getUrlsFromSitemap(sitemapUrl).then((sitemapUrls) => {
  filterLinksBySitemap(sitemapUrls, ".section_internal-links");
});