const activities = {
    americanFootball: { type: 'sport', name: 'American Football' },
    angeln: { type: 'activity', name: 'Angeln' },
    badminton: { type: 'sport', name: 'Badminton' },
    baseball: { type: 'sport', name: 'Baseball' },
    basketball: { type: 'sport', name: 'Basketball' },
    bogenschiessen: { type: 'sport', name: 'Bogenschießen' },
    bowling: { type: 'sport', name: 'Bowling' },
    bowls: { type: 'sport', name: 'Bowls' },
    boxen: { type: 'sport', name: 'Boxen' },
    cricket: { type: 'sport', name: 'Cricket' },
    crosslauf: { type: 'sport', name: 'Crosslauf' },
    eishockey: { type: 'sport', name: 'Eishockey' },
    fechten: { type: 'sport', name: 'Fechten' },
    fitness: { type: 'activity', name: 'Fitness' },
    fives: { type: 'sport', name: 'Fives' },
    fliegen: { type: 'activity', name: 'Fliegen' },
    fussball: { type: 'sport', name: 'Fußball' },
    golf: { type: 'sport', name: 'Golf' },
    gymnastikTurnen: { type: 'sport', name: 'Gymnastik/Turnen' },
    hockey: { type: 'sport', name: 'Hockey' },
    kajak: { type: 'sport', name: 'Kajak' },
    kampfsport: { type: 'sport', name: 'Kampfsport' },
    kanu: { type: 'sport', name: 'Kanu' },
    klettern: { type: 'activity', name: 'Klettern' },
    lacrosse: { type: 'sport', name: 'Lacrosse' },
    leichtathletik: { type: 'sport', name: 'Leichtathletik' },
    netzball: { type: 'sport', name: 'Netzball' },
    paddle: { type: 'sport', name: 'Paddle' },
    polo: { type: 'sport', name: 'Polo' },
    radeln: { type: 'sport', name: 'Radeln' },
    reiten: { type: 'sport', name: 'Reiten' },
    rudern: { type: 'sport', name: 'Rudern' },
    rugby: { type: 'sport', name: 'Rugby' },
    schiessen: { type: 'sport', name: 'Schiessen' },
    schlittschuhlaufen: { type: 'sport', name: 'Schlittschuhlaufen' },
    schwimmen: { type: 'sport', name: 'Schwimmen' },
    segeln: { type: 'sport', name: 'Segeln' },
    ski: { type: 'sport', name: 'Ski' },
    softball: { type: 'sport', name: 'Softball' },
    squash: { type: 'sport', name: 'Squash' },
    surfen: { type: 'sport', name: 'Surfen' },
    tanzenBallett: { type: 'activity', name: 'Tanzen/Ballett' },
    tauchen: { type: 'sport', name: 'Tauchen' },
    tennis: { type: 'sport', name: 'Tennis' },
    tischtennis: { type: 'sport', name: 'Tischtennis' },
    turmspringen: { type: 'sport', name: 'Turmspringen' },
    volleyball: { type: 'sport', name: 'Volleyball' },
    yogaPilates: { type: 'activity', name: 'Yoga/Pilates' },
    architektur: { type: 'activity', name: 'Architektur' },
    ballett: { type: 'activity', name: 'Ballett' },
    bigBand: { type: 'activity', name: 'Big Band' },
    goldschmiedekunst: { type: 'activity', name: 'Goldschmiedekunst' },
    schach: { type: 'activity', name: 'Schach' },
    chor: { type: 'activity', name: 'Chor' },
    debattieren: { type: 'activity', name: 'Debattieren' },
    dukeOfEdinburgh: { type: 'activity', name: 'Duke of Edinburgh' },
    modedesign: { type: 'activity', name: 'Modedesign' },
    feuerwehrThw: { type: 'activity', name: 'Feuerwehr/THW' },
    bildendeKunst: { type: 'activity', name: 'Bildende Kunst' },
    gartenarbeit: { type: 'activity', name: 'Gartenarbeit' },
    schmuck: { type: 'activity', name: 'Schmuck' },
    modelUnitedNations: { type: 'activity', name: 'Model United Nations' },
    musical: { type: 'activity', name: 'Musical' },
    orchester: { type: 'activity', name: 'Orchester' },
    lernenImFreien: { type: 'activity', name: 'Lernen im Freien' },
    fotografie: { type: 'activity', name: 'Fotografie' },
    topfern: { type: 'activity', name: 'Töpfern' },
    programmierenCodieren: { type: 'activity', name: 'Programmieren/Codieren' },
    robotikDesignTechnologie: { type: 'activity', name: 'Robotik/Design/Technologie' },
    roundSquare: { type: 'activity', name: 'Round Square' },
    theater: { type: 'activity', name: 'Theater' },
    schreinerei: { type: 'activity', name: 'Schreinerei' },
    hochbegabt: { type: 'education', name: 'Hochbegabt' },
    lrs: { type: 'education', name: 'LRS' },
    adhs: { type: 'education', name: 'ADHS' },
    dyskalkulie: { type: 'education', name: 'Dyskalkulie' },
    coEdu: { type: 'education', name: 'Co-Edu' },
    girl: { type: 'education', name: 'Girl' },
    boy: { type: 'education', name: 'Boy' }
  };

const places = {
    deutschland: {
      type: 'country',
      name: 'Deutschland'
    },
    grossbritannien: {
      type: 'country',
      name: 'Großbritannien'
    },
    frankreich: {
      type: 'country',
      name: 'Frankreich'
    },
    italien: {
      type: 'country',
      name: 'Italien'
    },
    kanada: {
      type: 'country',
      name: 'Kanada'
    },
    schweiz: {
      type: 'country',
      name: 'Schweiz'
    },
    usa: {
      type: 'country',
      name: 'USA'
    },
    australien: {
      type: 'country',
      name: 'Australien'
    },
    badenWuerttemberg: {
      type: 'region',
      country: 'Deutschland',
      name: 'Baden-Württemberg'
    },
    bayern: {
      type: 'region',
      country: 'Deutschland',
      name: 'Bayern'
    },
    berlin: {
      type: 'region',
      country: 'Deutschland',
      name: 'Berlin'
    },
    brandenburg: {
      type: 'region',
      country: 'Deutschland',
      name: 'Brandenburg'
    },
    bremen: {
      type: 'region',
      country: 'Deutschland',
      name: 'Bremen'
    },
    hamburg: {
      type: 'region',
      country: 'Deutschland',
      name: 'Hamburg'
    },
    hessen: {
      type: 'region',
      country: 'Deutschland',
      name: 'Hessen'
    },
    mecklenburgVorpommern: {
      type: 'region',
      country: 'Deutschland',
      name: 'Mecklenburg-Vorpommern'
    },
    niedersachsen: {
      type: 'region',
      country: 'Deutschland',
      name: 'Niedersachsen'
    },
    nordrheinWestfalen: {
      type: 'region',
      country: 'Deutschland',
      name: 'Nordrhein-Westfalen'
    },
    rheinlandPfalz: {
      type: 'region',
      country: 'Deutschland',
      name: 'Rheinland-Pfalz'
    },
    saarland: {
      type: 'region',
      country: 'Deutschland',
      name: 'Saarland'
    },
    sachsen: {
      type: 'region',
      country: 'Deutschland',
      name: 'Sachsen'
    },
    sachsenAnhalt: {
      type: 'region',
      country: 'Deutschland',
      name: 'Sachsen-Anhalt'
    },
    schleswigHolstein: {
      type: 'region',
      country: 'Deutschland',
      name: 'Schleswig-Holstein'
    },
    thueringen: {
      type: 'region',
      country: 'Deutschland',
      name: 'Thüringen'
    }
  };
  
  
  const pathname = window.location.pathname
  const attributeStrings = pathname.slice(pathname.indexOf('/internate/') + "/internate/".length).split("/")

  
  function toCamelCase(str) {
      return str.replace(/-./g, match => match.charAt(1).toUpperCase());
  }

  function camelToDash(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
  
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
      'cmsfilter',
      (listInstances) => {
        function processSlugs(...attributeSlugs) {
          const combinedData = { ...activities, ...places };
      
          const [attributes] = attributeSlugs
      
          attributes.forEach(slug => {
              if (!slug) return; // Skip if slug is undefined or null
              // Convert slug to camelCase and find corresponding item
              const camelSlug = toCamelCase(String(slug));
              const item = combinedData[camelSlug];
      
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
                    default:
                      filterType = 'internate_filter_sport'
                  }
                  
                  const inputElement = document.getElementById(filterType);
                  
                  if (inputElement) { // Check if element exists
                      inputElement.value = item.name;
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
        }, 500); // Set a delay of 500 milliseconds (adjust as needed)
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
      if (attributeList === places) {
        switch (places[pageAttribute].type) {
          case 'country':
            internalLinkHeading.innerText = `Andere Länder mit Internaten, die ${activities[secondPageAttribute].name} anbieten`
            break;
          case 'region':
            internalLinkHeading.innerText = `Internate nach Bundesland`
        }
        
      } else if (attributeList === activities) {
            switch (activities[secondPageAttribute].type) {
            case 'sport':
                internalLinkHeading.innerText = `Andere von Internaten in ${places[pageAttribute].name} angebotene Sportarten`
                break;
            case 'activity':
                internalLinkHeading.innerText = `Andere von Internaten in ${places[pageAttribute].name} angebotene Aktivitäten`
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
              const link = new Link(`https://internate-org-253554.webflow.io/internate/${camelToDash(country.country)}/${camelToDash(secondPageAttribute)}`, `${country.name}`);
              link.element.classList.add("internal-link")
              link.appendTo(linksContainer);
              console.log("link created for ", country)
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
              const link = new Link(`https://internate-org-253554.webflow.io/internate/deutschland/${camelToDash(region.region)}`, `${region.name}`);
              link.element.classList.add("internal-link")
              link.appendTo(linksContainer);
              console.log("link created for ", region)
            })
            break;
       }
  }
  if (attributeList === activities) {
    if(activities[secondPageAttribute].type === "sport") {
      attributeData.forEach((attribute) => {
        if (attribute.type === "sport") {
          const link = new Link(`https://internate-org-253554.webflow.io/internate/${camelToDash(pageAttribute)}/${camelToDash(attribute.slug)}`, `${attribute.name}`);
          link.element.classList.add("internal-link")
          link.appendTo(linksContainer);
        }
      })
    }
    if(activities[secondPageAttribute].type === "activity") {
        attributeData.forEach((attribute) => {
          if (attribute.type === "activity") {
            const link = new Link(`https://internate-org-253554.webflow.io/internate/${camelToDash(pageAttribute)}/${camelToDash(attribute.slug)}`, `${attribute.name}`);
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
    addInternalLinkSection(activities, attributeStrings[0], attributeStrings[1])
    break;
  case 2:
    addInternalLinkSection(places, attributeStrings[0], attributeStrings[1])
    addInternalLinkSection(activities, attributeStrings[0], attributeStrings[1])
    break;
  case 3:
    addInternalLinkSection(places, attributeStrings[0], attributeStrings[2])
    addInternalLinkSection(activities, attributeStrings[0], attributeStrings[2])
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
  
  const internatItems = $(".internat-liste_grid .w-dyn-item")
  const beraterinnenSection = $(".section_beraterinnen")[0]
  const nachLaendernSection = $(".section_internate-nach-laendern")[0]
  const beratungSection = $(".section_beratung")[0]
  const secondDescription = $(".section_page-second-description")[0]
  
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