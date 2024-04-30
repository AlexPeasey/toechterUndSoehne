// GLOBALS

const pathname = window.location.pathname;
const country = pathname.replace("/internate/", "");

// SEARCH BOX

const updateSearchLink = (searchValue, landValue) => {
  let searchButton = document.querySelector(".search-button");
  searchButton.href = `/internate/internats-suche?suche=${searchValue}&land=${landValue}`;
};

const updateLandValue = () => {
  const landSelect = document.querySelector(".internat-search-hero_form select");
  landSelect.value = country;
};

updateLandValue();

const inputElements = document.querySelectorAll(".internat-search-hero_form input, .internat-search-hero_form select");

inputElements.forEach((element) => {
  element.addEventListener("change", () => {
    updateSearchLink(inputElements[0].value, inputElements[1].value);
  });
});

const form = document.querySelector(".internat-search-hero_form");

form.addEventListener("keydown", function (event) {
  // Check if the key pressed was the Enter key
  if (event.key === "Enter") {
    // Prevent the form from submitting
    event.preventDefault();
    // Additional actions can be added here if needed
    return false;
  }
});

// COUNTRY NAMES

const dynamicTextElements = document.querySelectorAll(".land-value");

const countryDisplayName = (country) => {
  const landSelect = document.querySelectorAll(".internat-search-hero_form select option");
  for (let i = 0; i < landSelect.length; i++) {
    if (landSelect[i].value === country) {
      return landSelect[i].textContent;
    }
  }
};

dynamicTextElements.forEach((element) => {
  element.textContent = countryDisplayName(country);
});

// FILTERS

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  "cmsfilter",
  (listInstances) => {
    if (country === "england" || country === "schottland") {
      const inputElements = document.getElementsByClassName("internate_filter_region");
      for (let i = 0; i < inputElements.length; i++) {
        inputElements[i].value = country;
        const event = new Event("input", {
          bubbles: true,
        });
        inputElements[i].dispatchEvent(event);
      }
    } else {
      const inputElements = document.getElementsByClassName("internate_filter_country");
      for (let i = 0; i < inputElements.length; i++) {
        inputElements[i].value = country;
        const event = new Event("input", {
          bubbles: true,
        });
        inputElements[i].dispatchEvent(event);
      }
    }

    let landValue = "";
    const allCountries = document.getElementsByClassName("about-internate-internat_country-slug");
    for (let i = 0; i < allCountries.length; i++) {
      if (allCountries[i].innerText === country) {
        landValue = allCountries[i].parentElement.querySelector(".about-internate-internat_country-name").innerText;
        allCountries[i].parentElement.parentElement.parentElement.remove();
      }
    }
    // GET RID OF INTERNATE IM FOKUS IF NONE APPLY
    const checkRemoveIIF = () => {
      const internateImFokus = document.querySelector(".section_internate-im-fokus");
      const itemsParent = internateImFokus.querySelector(".about_internate-grid.w-dyn-items");
      if (!itemsParent.hasChildNodes()) {
        internateImFokus.remove();
      }
      const beraterinnenSection = document.querySelector(".section_beraterinnen")
      beraterinnenSection.style.backgroundColor = "#f8f3ef"
    };
    setTimeout(checkRemoveIIF, 2500);
  },
]);

$(document).ready(function () {
  $(".alle-laender-zeigen").appendTo($(".internate-nach-laendern_grid")).show();
});

// SPLIDE SLIDER

$(document).ready(function () {
  function categorySlider() {
    let splides = $(".categoryslider");
    for (let i = 0, splideLength = splides.length; i < splideLength; i++) {
      new Splide(splides[i], {
        // Desktop on down
        perPage: 5,
        perMove: 1,
        fixedWidth: "16rem",
        fixedHeight: "45rem",
        focus: 0, // 0 = left and 'center' = center
        type: "slide", // 'loop' or 'slide'
        gap: "1.25rem", // space between slides
        arrows: "slider", // 'slider' or false
        pagination: false, // 'slider' or false
        speed: 600, // transition speed in miliseconds
        dragAngleThreshold: 60, // default is 30
        autoWidth: false, // for cards with differing widths
        rewind: false, // go back to beginning when reach end
        rewindSpeed: 400,
        waitForTransition: false,
        updateOnMove: true,
        trimSpace: false, // true removes empty space from end of list
        breakpoints: {
          991: {
            destroy: true,
          },
        },
      }).mount();
    }
  }

  const combineItems = async (activities, sports) => {
    sports.each((index, element) => {
      activities.append($(element));
    });
    // Trigger categorySlider() after combineItems has completed
    categorySlider();
  };

  combineItems($(".activities"), $(".sport")); // Call combineItems()
});
