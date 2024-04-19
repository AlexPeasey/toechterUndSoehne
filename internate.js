const attributes = {
  "lernschwaechen": { type: 'attribute', name: 'Lernschwächen' },
  "liberal": { type: 'attribute', name: 'Liberale Ausrichtung' },
  "eliteinternate": { type: 'attribute', name: 'Eliteinternate' },
  "international-baccalaureate": { type: 'attribute', name: 'International Baccalaureate' },
  "schuluniform": { type: 'attribute', name: 'Uniform' },
  "erlebnispaedagogik": { type: 'attribute', name: 'Outdoor Education' },
  "round-square": { type: 'attribute', name: 'Round Square' },
  "ski": { type: 'attribute', name: 'Ski' },
  "wirtschaft": { type: 'attribute', name: 'Wirtschaft' },
  "kirchlich": { type: 'attribute', name: 'Kirchlicher Hintergrund' },
  "mint": { type: 'attribute', name: 'MINT/STEM/NatWi' },
  "segeln": { type: 'attribute', name: 'Segeln' },
  "musik": { type: 'attribute', name: 'Musik' },
  "reitinternate": { type: 'attribute', name: 'Reiten' },
  "tennis": { type: 'attribute', name: 'Tennis' },
  "schlossinternate": { type: 'attribute', name: 'Schloss' },
  "kunst": { type: 'attribute', name: 'Kunst' },
  "rudern": { type: 'attribute', name: 'Rudern' },
  "eishockey": { type: 'attribute', name: 'Eishockey' },
  "fussballinternate": { type: 'attribute', name: 'Fußball' },
  "hockey": { type: 'attribute', name: 'Hockey' },
  "tanz": { type: 'attribute', name: 'Tanz' },
  "bauernhof": { type: 'attribute', name: 'Farm/Bauernhof/Tiere' },
  "modedesign": { type: 'attribute', name: 'Textiles/Fashion/Design' },
  "theater": { type: 'attribute', name: 'Theater' },
  "schwimmen": { type: 'attribute', name: 'Schwimmen' },
  "realschulinternate": { type: 'attribute', name: 'Realschule' },
  "sixth-form-colleges": { type: 'attribute', name: 'Sixth-Form-College' },
  "informatik": { type: 'attribute', name: 'IT/Robotik/Coding' },
  "basketball": { type: 'attribute', name: 'Basketball' },
  "golfinternate": { type: 'attribute', name: 'Golf' },
  "advanced-placement": { type: 'attribute', name: 'AP Placement' },
  "highschool": { type: 'attribute', name: 'American High School' },
  "summercamp": { type: 'attribute', name: 'Summer Camp' },
  "igcse": { type: 'attribute', name: 'IGCSE' },
  "grundschulinternate": { type: 'attribute', name: 'Grundschule' },
  "a-level": { type: 'attribute', name: 'A-Level' },
  "fachabitur": { type: 'attribute', name: 'Fachabitur' },
  "internatsgymnasium": { type: 'attribute', name: 'Abitur' },
  "fachoberschule": { type: 'attribute', name: 'Fachoberschule' },
  "middle-years-programme": { type: 'attribute', name: 'MYP' },
  "baccalaureat": { type: 'attribute', name: 'Baccalauréat Français' },
  "matura": { type: 'attribute', name: 'Matura' },
  "hauptschule": { type: 'attribute', name: 'Hauptschule' },
  "aufbaugymnasium": { type: 'attribute', name: 'Aufbaugymnasium' },
  "jungeninternate": { type: 'attribute', name: 'Jungeninternate' },
  "maedcheninternate": { type: 'attribute', name: 'Mädcheninternate' },
};

const places = {
    "deutschland": {
      type: 'country',
      name: 'Deutschland'
    },
    "grossbritannien": {
      type: 'country',
      name: 'Großbritannien'
    },
    "frankreich": {
      type: 'country',
      name: 'Frankreich'
    },
    "italien": {
      type: 'country',
      name: 'Italien'
    },
    "kanada": {
      type: 'country',
      name: 'Kanada'
    },
    "schweiz": {
      type: 'country',
      name: 'Schweiz'
    },
    "usa": {
      type: 'country',
      name: 'USA'
    },
    "spanien": {
      type: 'country',
      name: 'Spanien'
    },
    "oesterreich": {
      type: 'country',
      name: 'Österreich'
    },
    "niederlande": {
      type: 'country',
      name: 'Niederlande'
    },
    "australien": {
      type: 'country',
      name: 'Australien'
    },
    "baden-wuerttemberg": {
      type: 'region',
      country: 'Deutschland',
      name: 'Baden-Württemberg'
    },
    "bayern": {
      type: 'region',
      country: 'Deutschland',
      name: 'Bayern'
    },
    "berlin": {
      type: 'region',
      country: 'Deutschland',
      name: 'Berlin'
    },
    "brandenburg": {
      type: 'region',
      country: 'Deutschland',
      name: 'Brandenburg'
    },
    "bremen": {
      type: 'region',
      country: 'Deutschland',
      name: 'Bremen'
    },
    "hamburg": {
      type: 'region',
      country: 'Deutschland',
      name: 'Hamburg'
    },
    "hessen": {
      type: 'region',
      country: 'Deutschland',
      name: 'Hessen'
    },
    "mecklenburg-vorpommern": {
      type: 'region',
      country: 'Deutschland',
      name: 'Mecklenburg-Vorpommern'
    },
    "niedersachsen": {
      type: 'region',
      country: 'Deutschland',
      name: 'Niedersachsen'
    },
    "nordrhein-westfalen": {
      type: 'region',
      country: 'Deutschland',
      name: 'Nordrhein-Westfalen'
    },
    "rheinland-pfalz": {
      type: 'region',
      country: 'Deutschland',
      name: 'Rheinland-Pfalz'
    },
    "saarland": {
      type: 'region',
      country: 'Deutschland',
      name: 'Saarland'
    },
    "sachsen": {
      type: 'region',
      country: 'Deutschland',
      name: 'Sachsen'
    },
    "sachsen-anhalt": {
      type: 'region',
      country: 'Deutschland',
      name: 'Sachsen-Anhalt'
    },
    "schleswig-holstein": {
      type: 'region',
      country: 'Deutschland',
      name: 'Schleswig-Holstein'
    },
    "thueringen": {
      type: 'region',
      country: 'Deutschland',
      name: 'Thüringen'
    }
  };
  const combinedData = { ...attributes, ...places };
  
  const pathname = window.location.pathname
  const attributeStrings = pathname.slice(pathname.indexOf('/internate/') + "/internate/".length).split("/")


  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
      'cmsfilter',
      (listInstances) => {
        function processSlugs(...attributeSlugs) {
          const [attributes] = attributeSlugs
      
          attributes.forEach(slug => {
              if (!slug) return; // Skip if slug is undefined or null
              // Convert slug to camelCase and find corresponding item
              const item = combinedData[slug];
      
              // Check if item exists in the combinedData
              if (item) {

                // Generalize element ID construction and value assignment
                  let filterType;

                  switch (item.type) {
                    case 'country':
                      filterType = 'internate_filter_country'
                      break;
                    case 'region':
                      filterType = 'internate_filter_region'
                      break;
                    case 'attribute':
                      filterType = 'internate_filter_attribute'
                      break;
                  }
                  
                  const inputElement = document.getElementById(filterType);
                  
                  if (inputElement) { // Check if element exists
                      inputElement.value = slug;
                      const event = new Event('input', { bubbles: true });
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
      }
  ]);
  
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    'cmsfilter',
    (filterInstances) => {
      // console.log('cmsfilter Successfully loaded!');
      const [filterInstance] = filterInstances;
      
      // Define a debounce function to postpone execution
      let timeoutId;
      const debounceInsertSections = () => {
        if (timeoutId) {
          clearTimeout(timeoutId); // Cancel the previous timeout
        }
        timeoutId = setTimeout(() => {
          insertSections();
        }, 50); // Set a delay of 800 milliseconds (adjust as needed)
      };
      
      filterInstance.listInstance.on('renderitems', (renderedItems) => {
        debounceInsertSections(); // Call the debounced function
      });
    },
  ]);
  
  // INTERNAL LINKS
  
  const internalLinksSection = document.querySelector(".section_internal-links .padding-global .padding-section-medium .container-large")
  
  const addInternalLinkSection = (attributeList, pageAttribute, secondPageAttribute) => {
      
        // HEADING
        
      const internalLinkHeading = document.createElement("h2")
      const combinedData = { ...attributes, ...places };
      if (attributeList === places) {
        switch (combinedData[pageAttribute].type) {
          case 'country':
            internalLinkHeading.innerText = `Andere Länder mit Internaten, die ${combinedData[secondPageAttribute].name} anbieten`
            break;
          case 'region':
            internalLinkHeading.innerText = `Internate nach Bundesland`
        }
        
      } else if (attributeList === attributes) {
            switch (combinedData[secondPageAttribute].type) {
            case 'sport':
                internalLinkHeading.innerText = `Andere von Internaten in ${combinedData[pageAttribute].name} angebotene Sportarten`
                break;
            case 'activity':
                internalLinkHeading.innerText = `Andere von Internaten in ${combinedData[pageAttribute].name} angebotene Aktivitäten`
                break;
            }
      }
      internalLinksSection.append(internalLinkHeading)
  
      // SPACER
  
      const spacer = document.createElement("div")
      spacer.classList.add("spacer-medium")
      internalLinksSection.append(spacer)
  
      // LINKS CONTAINER
  
      const linksContainer = document.createElement("div")
      linksContainer.classList.add("internal-links_flex-container")
      internalLinksSection.append(linksContainer)
  
      // LINKS
  
      class Link {
          constructor(href, text, target = '_self') {
              this.element = document.createElement('a');
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
          attributeData.push({ slug, type: attributeList[slug].type, name: attributeList[slug].name });
          }
      }
      if (attributeList === places) {
        switch (places[pageAttribute].type) {
          case "country":
            const countriesObject = Object.keys(places).reduce((acc, key) => {
              if (places[key].type === 'country') {
                  acc[key] = places[key];
              }
              return acc;
            }, {});
            let countries = [] 
            for (let country in countriesObject) {
              if (countriesObject.hasOwnProperty(country)) {
                countries.push({ country, type: countriesObject[country].type, name: countriesObject[country].name });
                }
            }
            countries.forEach((country) => {
              const link = new Link(`https://internate-org-253554.webflow.io/internate/${country.country}/${secondPageAttribute}`, `${country.name}`);
              link.element.classList.add("internal-link")
              link.appendTo(linksContainer);
            })
            break;
          case "region":
            const regionsObject = Object.keys(places).reduce((acc, key) => {
              if (places[key].type === 'region') {
                  acc[key] = places[key];
              }
              return acc;
            }, {});
            let regions = [] 
            for (let region in regionsObject) {
              if (regionsObject.hasOwnProperty(region)) {
                regions.push({ region, type: regionsObject[region].type, name: regionsObject[region].name });
                }
            }
            regions.forEach((region) => {
              const link = new Link(`https://internate-org-253554.webflow.io/internate/deutschland/${region.region}`, `${region.name}`);
              link.element.classList.add("internal-link")
              link.appendTo(linksContainer);
            })
            break;
       }
  }
  if (attributeList === attributes) {
    if(combinedData[secondPageAttribute].type === "sport") {
      attributeData.forEach((attribute) => {
        if (attribute.type === "sport") {
          const link = new Link(`https://internate-org-253554.webflow.io/internate/${pageAttribute}/${attribute.slug}`, `${attribute.name}`);
          link.element.classList.add("internal-link")
          link.appendTo(linksContainer);
        }
      })
    }
    if(combinedData[secondPageAttribute].type === "activity") {
        attributeData.forEach((attribute) => {
          if (attribute.type === "activity") {
            const link = new Link(`https://internate-org-253554.webflow.io/internate/${pageAttribute}/${attribute.slug}`, `${attribute.name}`);
            link.element.classList.add("internal-link")
            link.appendTo(linksContainer);
          }
        })
      }
  }
  
      // SPACER
  
      const largeSpacer = document.createElement("div")
      largeSpacer.classList.add("spacer-huge")
      internalLinksSection.append(largeSpacer)
  
  }
switch (attributeStrings.length) {
  case 1:
    addInternalLinkSection(attributes, attributeStrings[0], attributeStrings[1])
    break;
  case 2:
    addInternalLinkSection(places, attributeStrings[0], attributeStrings[1])
    addInternalLinkSection(attributes, attributeStrings[0], attributeStrings[1])
    break;
  case 3:
    addInternalLinkSection(places, attributeStrings[0], attributeStrings[2])
    addInternalLinkSection(attributes, attributeStrings[0], attributeStrings[2])
    addInternalLinkSection(places, attributeStrings[1], null)
}
  

  
  const sitemapUrl = 'https://internate-org-253554.webflow.io/sitemap.xml';
  getUrlsFromSitemap(sitemapUrl).then(sitemapUrls => {
  filterLinksBySitemap(sitemapUrls, '.section_internal-links');
  });
  
  async function getUrlsFromSitemap(sitemapUrl) {
      try {
          const response = await fetch(sitemapUrl);
          const xmlText = await response.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
          const urls = xmlDoc.querySelectorAll("url loc");
          const internateUrls = [];
  
          urls.forEach(urlElement => {
              const url = urlElement.textContent.trim(); // Trim the URL
              if (url.includes('/internate/')) {
                  internateUrls.push(url);
              }
          });
  
          return internateUrls;
      } catch (error) {
          console.error('Error fetching or parsing sitemap:', error);
          return [];
      }
  }
  
  async function filterLinksBySitemap(sitemapUrls, containerSelector) {
      // Select all anchor tags within the container
      const container = document.querySelector(containerSelector);
      if (!container) {
          console.error('Container not found');
          return;
      }
  
      const links = container.querySelectorAll('a.internal-link');
      
      // Iterate over each link and remove it if its href is not in the sitemapUrls
      links.forEach(link => {
          const href = link.getAttribute('href');
          if (!sitemapUrls.includes(href)) {
              link.remove();
          }
      });
  }
  
  const insertSections = () => {
  
  const internatItems = document.querySelectorAll(".internat-liste_grid .w-dyn-item")
  const beraterinnenSection = document.querySelector(".section_beraterinnen")
  const nachLaendernSection = document.querySelector(".section_internate-nach-laendern")
  const beratungSection = document.querySelector(".section_beratung")
  const secondDescription = document.querySelector(".section_page-second-description")
  
  if (internatItems.length > 3) { // Ensure the length is greater than 4 to access the index 4
    internatItems[4].after(beraterinnenSection);
    beraterinnenSection.style.marginTop = "2.5rem"
    beraterinnenSection.style.marginBottom = "2.5rem"
  
  }
  if (internatItems.length > 8) { // Ensure the length is greater than 4 to access the index 4
    internatItems[9].after(nachLaendernSection)
    nachLaendernSection.style.marginTop = "2.5rem"
    nachLaendernSection.style.marginBottom = "2.5rem"
  } else {
    internatItems[internatItems.length -1].after(nachLaendernSection)
    nachLaendernSection.style.marginTop = "2.5rem"
    nachLaendernSection.style.marginBottom = "2.5rem"
  }
  if (internatItems.length > 13) { // Ensure the length is greater than 4 to access the index 4
    internatItems[14].after(beratungSection)
    beratungSection.style.marginTop = "2.5rem"
    beratungSection.style.marginBottom = "2.5rem"
  }  else {
    secondDescription.after(beratungSection)
    beratungSection.style.marginTop = "2.5rem"
    beratungSection.style.marginBottom = "2.5rem"
  }
  
   if (internatItems.length < 5) {
    nachLaendernSection.classList.remove("background-color-flower", "text-color-red")
  }
  }