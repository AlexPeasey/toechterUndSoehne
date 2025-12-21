// Detect if we're on the English version
const isEnglish = window.location.pathname.startsWith("/en/");
const basePath = isEnglish ? "/en" : "";

// Bilingual attributes data
const attributes = {
  lernschwaechen: {
    type: "attribute",
    name: isEnglish ? "Learning Difficulties" : "Lernschwächen",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  liberal: {
    type: "attribute",
    name: isEnglish ? "Liberal Orientation" : "Liberale Ausrichtung",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  eliteinternate: {
    type: "attribute",
    name: isEnglish ? "Elite Boarding Schools" : "Eliteinternate",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  "international-baccalaureate": {
    type: "attribute",
    name: "International Baccalaureate",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  abitur: {
    type: "attribute",
    name: "Abitur",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  schuluniform: {
    type: "attribute",
    name: isEnglish ? "Uniform" : "Uniform",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  erlebnispaedagogik: {
    type: "attribute",
    name: "Outdoor Education",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  "round-square": {
    type: "attribute",
    name: "Round Square",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  ski: {
    type: "attribute",
    name: isEnglish ? "Skiing" : "Ski",
    category: isEnglish ? "Sports" : "Sport",
  },
  wirtschaft: {
    type: "attribute",
    name: isEnglish ? "Business/Economics" : "Wirtschaft",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  kirchlich: {
    type: "attribute",
    name: isEnglish ? "Religious Background" : "Kirchlicher Hintergrund",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  mint: {
    type: "attribute",
    name: isEnglish ? "STEM/Science" : "MINT/STEM/NatWi",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  segeln: {
    type: "attribute",
    name: isEnglish ? "Sailing" : "Segeln",
    category: isEnglish ? "Sports" : "Sport",
  },
  musik: {
    type: "attribute",
    name: isEnglish ? "Music" : "Musik",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  reitinternate: {
    type: "attribute",
    name: isEnglish ? "Horse Riding" : "Reiten",
    category: isEnglish ? "Sports" : "Sport",
  },
  tennis: {
    type: "attribute",
    name: "Tennis",
    category: isEnglish ? "Sports" : "Sport",
  },
  schlossinternate: {
    type: "attribute",
    name: isEnglish ? "Castle Schools" : "Schloss",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  kunst: {
    type: "attribute",
    name: isEnglish ? "Arts" : "Kunst",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  rudern: {
    type: "attribute",
    name: isEnglish ? "Rowing" : "Rudern",
    category: isEnglish ? "Sports" : "Sport",
  },
  eishockey: {
    type: "attribute",
    name: isEnglish ? "Ice Hockey" : "Eishockey",
    category: isEnglish ? "Sports" : "Sport",
  },
  sportinternat: {
    type: "attribute",
    name: isEnglish ? "Sports" : "Sport",
    category: isEnglish ? "Sports" : "Sport",
  },
  fussballinternate: {
    type: "attribute",
    name: isEnglish ? "Football/Soccer" : "Fußball",
    category: isEnglish ? "Sports" : "Sport",
  },
  hockey: {
    type: "attribute",
    name: "Hockey",
    category: isEnglish ? "Sports" : "Sport",
  },
  tanz: {
    type: "attribute",
    name: isEnglish ? "Dance" : "Tanz",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  bauernhof: {
    type: "attribute",
    name: isEnglish ? "Farm/Animals" : "Farm/Bauernhof/Tiere",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  modedesign: {
    type: "attribute",
    name: isEnglish ? "Fashion/Design" : "Textiles/Fashion/Design",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  theater: {
    type: "attribute",
    name: isEnglish ? "Theatre" : "Theater",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  schwimmen: {
    type: "attribute",
    name: isEnglish ? "Swimming" : "Schwimmen",
    category: isEnglish ? "Sports" : "Sport",
  },
  realschulinternate: {
    type: "attribute",
    name: "Realschule",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  "sixth-form-colleges": {
    type: "attribute",
    name: "Sixth-Form-College",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  informatik: {
    type: "attribute",
    name: isEnglish ? "IT/Robotics/Coding" : "IT/Robotik/Coding",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  basketball: {
    type: "attribute",
    name: "Basketball",
    category: isEnglish ? "Sports" : "Sport",
  },
  golfinternate: {
    type: "attribute",
    name: "Golf",
    category: isEnglish ? "Sports" : "Sport",
  },
  "advanced-placement": {
    type: "attribute",
    name: "AP Placement",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  highschool: {
    type: "attribute",
    name: "American High School",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  summercamp: {
    type: "attribute",
    name: "Summer Camp",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  igcse: {
    type: "attribute",
    name: "IGCSE",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  grundschulinternate: {
    type: "attribute",
    name: isEnglish ? "Primary School" : "Grundschule",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  "a-level": {
    type: "attribute",
    name: "A-Level",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  fachabitur: {
    type: "attribute",
    name: "Fachabitur",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  internatsgymnasium: {
    type: "attribute",
    name: "Abitur",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  fachoberschule: {
    type: "attribute",
    name: "Fachoberschule",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  "middle-years-programme": {
    type: "attribute",
    name: "MYP",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  baccalaureat: {
    type: "attribute",
    name: "Baccalauréat Français",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  matura: {
    type: "attribute",
    name: "Matura",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  hauptschule: {
    type: "attribute",
    name: "Hauptschule",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  aufbaugymnasium: {
    type: "attribute",
    name: "Aufbaugymnasium",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  jungeninternate: {
    type: "attribute",
    name: isEnglish ? "Boys' Boarding Schools" : "Jungeninternate",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  maedcheninternate: {
    type: "attribute",
    name: isEnglish ? "Girls' Boarding Schools" : "Mädcheninternate",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  dyskalkulie: {
    type: "attribute",
    name: isEnglish ? "Dyscalculia" : "Dyskalkulie",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  hochbegabung: {
    type: "attribute",
    name: isEnglish ? "Gifted Education" : "Hochbegabung",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
  lrs: {
    type: "attribute",
    name: isEnglish ? "Dyslexia Support" : "LRS",
    category: isEnglish ? "Focus" : "Schwerpunkt",
  },
};

// Bilingual places data
const places = {
  deutschland: {
    type: "country",
    name: isEnglish ? "Germany" : "Deutschland",
  },
  grossbritannien: {
    type: "country",
    name: isEnglish ? "Great Britain" : "Großbritannien",
  },
  frankreich: {
    type: "country",
    name: isEnglish ? "France" : "Frankreich",
  },
  italien: {
    type: "country",
    name: isEnglish ? "Italy" : "Italien",
  },
  kanada: {
    type: "country",
    name: isEnglish ? "Canada" : "Kanada",
  },
  schweiz: {
    type: "country",
    name: isEnglish ? "Switzerland" : "Schweiz",
  },
  usa: {
    type: "country",
    name: "USA",
  },
  spanien: {
    type: "country",
    name: isEnglish ? "Spain" : "Spanien",
  },
  oesterreich: {
    type: "country",
    name: isEnglish ? "Austria" : "Österreich",
  },
  "schweiz-oesterreich": {
    type: "sharedcountry",
    name: isEnglish ? "Switzerland / Austria" : "Schweiz / Österreich",
  },
  "spanien-italien": {
    type: "sharedcountry",
    name: isEnglish ? "Spain / Italy" : "Spanien / Italien",
  },
  niederlande: {
    type: "country",
    name: isEnglish ? "Netherlands" : "Niederlande",
  },
  australien: {
    type: "country",
    name: isEnglish ? "Australia" : "Australien",
  },
  "baden-wuerttemberg": {
    type: "region",
    country: "Deutschland",
    name: "Baden-Württemberg",
  },
  bayern: {
    type: "region",
    country: "Deutschland",
    name: isEnglish ? "Bavaria" : "Bayern",
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
    name: isEnglish ? "Hesse" : "Hessen",
  },
  "mecklenburg-vorpommern": {
    type: "region",
    country: "Deutschland",
    name: "Mecklenburg-Vorpommern",
  },
  niedersachsen: {
    type: "region",
    country: "Deutschland",
    name: isEnglish ? "Lower Saxony" : "Niedersachsen",
  },
  "nordrhein-westfalen": {
    type: "region",
    country: "Deutschland",
    name: isEnglish ? "North Rhine-Westphalia" : "Nordrhein-Westfalen",
  },
  "rheinland-pfalz": {
    type: "region",
    country: "Deutschland",
    name: isEnglish ? "Rhineland-Palatinate" : "Rheinland-Pfalz",
  },
  saarland: {
    type: "region",
    country: "Deutschland",
    name: "Saarland",
  },
  sachsen: {
    type: "region",
    country: "Deutschland",
    name: isEnglish ? "Saxony" : "Sachsen",
  },
  "sachsen-anhalt": {
    type: "region",
    country: "Deutschland",
    name: isEnglish ? "Saxony-Anhalt" : "Sachsen-Anhalt",
  },
  "schleswig-holstein": {
    type: "region",
    country: "Deutschland",
    name: "Schleswig-Holstein",
  },
  thueringen: {
    type: "region",
    country: "Deutschland",
    name: isEnglish ? "Thuringia" : "Thüringen",
  },
  england: {
    type: "country",
    country: "GB",
    name: isEnglish ? "England" : "England",
  },
  schottland: {
    type: "country",
    country: "GB",
    name: isEnglish ? "Scotland" : "Schottland",
  },
  nordirland: {
    type: "country",
    country: "GB",
    name: isEnglish ? "Northern Ireland" : "Nordirland",
  },
  wales: {
    type: "country",
    country: "GB",
    name: "Wales",
  },
};

const combinedData = { ...attributes, ...places };

// Extract pathname and remove language prefix if present
const pathname = window.location.pathname.replace(/^\/en/, "");
const attributeStrings = pathname.slice(pathname.indexOf("/internate/") + "/internate/".length).split("/");

// configuring special names
for (let string = 0; string < attributeStrings.length; string++) {
  if (attributeStrings[string] === "ib") {
    attributeStrings[string] = "international-baccalaureate";
  }
}

// INTERNAL LINKS
const internalLinksSection = document.querySelector(
  ".section_internal-links .padding-global .padding-section-medium .container-large"
);

const addInternalLinkSection = (attributeList, pageAttribute, secondPageAttribute) => {
  const fragment = document.createDocumentFragment();

  // PARENT DIV
  const internalLinkDiv = document.createElement("div");
  internalLinkDiv.classList.add("internal-links-container");
  fragment.appendChild(internalLinkDiv);

  // HEADING
  const internalLinkHeading = document.createElement("h2");

  if (secondPageAttribute) {
    if (attributeList === places) {
      switch (combinedData[pageAttribute].type) {
        case "country":
          internalLinkHeading.innerText = isEnglish
            ? `Other countries with boarding schools offering ${combinedData[secondPageAttribute].name}`
            : `Andere Länder mit Internaten, die ${combinedData[secondPageAttribute].name} anbieten`;
          break;
        case "region":
          internalLinkHeading.innerText = isEnglish ? `Boarding schools by state` : `Internate nach Bundesland`;
      }
    } else if (attributeList === attributes) {
      switch (combinedData[secondPageAttribute].category) {
        case "Sport":
        case "Sports":
          internalLinkHeading.innerText = isEnglish
            ? `Other sports offered by boarding schools in ${combinedData[pageAttribute].name}`
            : `Andere von Internaten in ${combinedData[pageAttribute].name} angebotene Sportarten`;
          break;
        case "Schwerpunkt":
        case "Focus":
          internalLinkHeading.innerText = isEnglish
            ? `Other focuses in ${combinedData[pageAttribute].name}`
            : `Andere Schwerpunkte in ${combinedData[pageAttribute].name}`;
          break;
      }
    }
    internalLinkDiv.append(internalLinkHeading);
  } else if (!secondPageAttribute) {
    switch (attributes[pageAttribute].category) {
      case "Sport":
      case "Sports":
        internalLinkHeading.innerText = isEnglish
          ? `Other sports offered by boarding schools`
          : `Andere von Internaten angebotene Sportarten`;
        break;
      case "Schwerpunkt":
      case "Focus":
        internalLinkHeading.innerText = isEnglish
          ? `Boarding schools with other focuses`
          : `Internate mit anderen Schwerpunkten`;
        break;
    }
    internalLinkDiv.appendChild(internalLinkHeading);
  }

  // SPACER
  const spacer = document.createElement("div");
  spacer.classList.add("spacer-medium");
  internalLinkDiv.appendChild(spacer);

  // LINKS CONTAINER
  const linksContainer = document.createElement("div");
  linksContainer.classList.add("internal-links_flex-container");
  internalLinkDiv.appendChild(linksContainer);

  // LINKS
  class Link {
    constructor(href, text, target = "_self") {
      this.element = document.createElement("a");
      this.element.href = href;
      this.element.textContent = text;
      this.element.target = target;
    }

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
          if (country.country === pageAttribute) return;
          const link = new Link(`${basePath}/internate/${country.country}/${secondPageAttribute}`, `${country.name}`);
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
          const link = new Link(`${basePath}/internate/deutschland/${region.region}`, `${region.name}`);
          link.element.classList.add("internal-link");
          link.appendTo(linksContainer);
        });
        break;
    }
  }

  if (attributeList === attributes) {
    if (secondPageAttribute) {
      const categoryToMatch = isEnglish
        ? combinedData[secondPageAttribute].category === "Sports"
          ? "Sports"
          : "Focus"
        : combinedData[secondPageAttribute].category === "Sport"
        ? "Sport"
        : "Schwerpunkt";

      attributeData.forEach((attribute) => {
        if (combinedData[secondPageAttribute].name === attribute.name) return;
        if (attribute.category === categoryToMatch) {
          const link = new Link(`${basePath}/internate/${pageAttribute}/${attribute.slug}`, `${attribute.name}`);
          link.element.classList.add("internal-link");
          link.appendTo(linksContainer);
        }
      });
    } else if (!secondPageAttribute) {
      const filteredAttributes = Object.entries(attributeList).filter(
        ([key, value]) => value.category === attributeList[pageAttribute].category
      );
      filteredAttributes.forEach(([key, value], index) => {
        const link = new Link(`${basePath}/internate/${key}`, `${value.name}`);
        link.element.classList.add("internal-link");
        link.appendTo(linksContainer);
      });
    }
  }

  // SPACER
  const largeSpacer = document.createElement("div");
  largeSpacer.classList.add("spacer-huge");
  internalLinkDiv.appendChild(largeSpacer);

  internalLinksSection.appendChild(fragment);
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
  internalLinkHeading.innerText = isEnglish
    ? `Boarding schools by country with focus on ${attributes[attributeKey].name}`
    : `Internate nach Ländern mit Schwerpunkt ${attributes[attributeKey].name}`;
  internalLinkDiv.append(internalLinkHeading);

  const spacer = document.createElement("div");
  spacer.classList.add("spacer-medium");
  internalLinkDiv.append(spacer);

  const linksContainer = document.createElement("div");
  linksContainer.classList.add("internal-links_flex-container");
  internalLinkDiv.append(linksContainer);

  Object.entries(places).forEach(([key, value]) => {
    if (value.type === "country") {
      const link = new Link(`${basePath}/internate/${key}/${attributeKey}`, `${value.name}`);
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

const sitemapUrl = "/sitemap.xml";

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

    const urls = Array.from(xmlDoc.querySelectorAll("url loc")).map((urlElement) => urlElement.textContent.trim());

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
    const linksToRemove = Array.from(links).filter((link) => {
      const href = link.getAttribute("href");
      // Check if URL exists in sitemap (accounting for both language versions)
      return !sitemapUrls.some((url) => {
        const cleanHref = href.replace(/^\/en/, "");
        return url.includes(cleanHref) || url.includes(href);
      });
    });

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

// Translate link text for English pages
document.addEventListener("DOMContentLoaded", () => {
  if (isEnglish) {
    document.querySelectorAll(".internate-liste_link-text").forEach((element) => {
      if (element.textContent.trim() === "entdecke dieses Internat") {
        element.textContent = "Discover this boarding school";
      }
    });
  }
});
