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
  const countries = {
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
    }
  };
  
  const pathname = window.location.pathname
  const attributeStrings = pathname.slice(pathname.indexOf('/internate/') + "/internate/".length).split("/")
  
  function toCamelCase(str) {
      return str.replace(/-./g, match => match.charAt(1).toUpperCase());
  }
  
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
      'cmsfilter',
      (listInstances) => {
          function processSlugs(slug1, slug2) {
              const combinedData = { ...activities, ...countries };
  
              // Convert slugs to camelCase
              const camelSlug1 = toCamelCase(slug1);
              const camelSlug2 = toCamelCase(slug2);
  
              const item1 = combinedData[camelSlug1];
              const item2 = combinedData[camelSlug2];
  
              if (item1 && item2) {
                  // Both items found, perform operations here
                  console.log(`Found: ${item1.name} (${item1.type}), ${item2.name} (${item2.type})`);
                  if (item1.type === 'country') {
                      const inputElement = document.getElementById("internate_filter_country");
                      inputElement.value = item1.name;
                      const event = new Event('input', { bubbles: true });                           
                      inputElement.dispatchEvent(event);
                      // Add logic specific to the country here
                  }
                  if (item2.type === 'country') {
                      const inputElement = document.getElementById("internate_filter_country");
                      inputElement.value = item2.name;
                      const event = new Event('input', { bubbles: true });                           
                      inputElement.dispatchEvent(event);
                  }
                                  if (item1.type === 'sport') {
                      const inputElement = document.getElementById("internate_filter_sport");
                      inputElement.value = item1.name;
                      const event = new Event('input', { bubbles: true });                           
                      inputElement.dispatchEvent(event);
                      // Add logic specific to the country here
                  }
                  if (item2.type === 'sport') {
                      const inputElement = document.getElementById("internate_filter_sport");
                      inputElement.value = item2.name;
                      const event = new Event('input', { bubbles: true });                           
                      inputElement.dispatchEvent(event);
                  }
              } else {
                  console.log('One or both slugs not found.');
              }
          }
  
          // Assuming attributeStrings is defined and accessible here
          processSlugs(attributeStrings[0], attributeStrings[1]);
      }
  ]);
  
  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    'cmsfilter',
    (filterInstances) => {
      console.log('cmsfilter Successfully loaded!');
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
        console.log(renderedItems);
        debounceInsertSections(); // Call the debounced function
      });
    },
  ]);
  
  
  const internalLinksSection = document.querySelector(".section_internal-links .padding-global .padding-section-medium .container-large")
  
  const addInternalLinkSection = (attribute, otherAttribute) => {
  
      // HEADING
  
      const internalLinkHeading = document.createElement("h2")
      if (attribute === countries) {
      internalLinkHeading.innerText = "Andere Länder mit Internaten, die Reiten anbieten"
      } else if (attribute === activities) {
      internalLinkHeading.innerText = "Andere von Internate in Deutschland angebotene Sportarten"
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
      
      // Set different countries
      
      let attributeData = [];
      for (let slug in attribute) {
      if (attribute.hasOwnProperty(slug)) {
          attributeData.push({ slug, name: attribute[slug].name });
          }
      }
      if (attribute === countries) {
      attributeData.forEach((attribute) => {
          const link = new Link(`https://internate-org-253554.webflow.io/internate/${attribute.slug}/${otherAttribute}`, `${attribute.name}`);
          link.element.classList.add("internal-link")
          link.appendTo(linksContainer);
      })
  }
  if (attribute === activities) {
      attributeData.forEach((attribute) => {
          const link = new Link(`https://internate-org-253554.webflow.io/internate/${otherAttribute}/${attribute.slug}`, `${attribute.name}`);
          link.element.classList.add("internal-link")
          link.appendTo(linksContainer);
      })
  }
  
      // SPACER
  
      const largeSpacer = document.createElement("div")
      largeSpacer.classList.add("spacer-huge")
      internalLinksSection.append(largeSpacer)
  
  }
   
  addInternalLinkSection(countries, attributeStrings[1])
  addInternalLinkSection(activities, attributeStrings[0])
  
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
  
  // insertSections();
  