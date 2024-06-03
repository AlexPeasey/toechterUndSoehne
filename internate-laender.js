// GLOBALS
const pathname = window.location.pathname;
const country = pathname.replace("/internate/", "");

// SEARCH BOX
const updateSearchLink = (searchValue, landValue) => {
  let searchButton = document.querySelector(".search-button");
  searchButton.href = `/internate/internatssuche?suche=${searchValue}&land=${landValue}`;
};

const updateLandValue = () => {
  const landSelect = document.querySelector(".internat-search-hero_form select");
  if (country !== "schweiz-oesterreich" && country !== "spanien-italien") {
    landSelect.value = country;
  }
};

updateLandValue();

const inputElements = document.querySelectorAll(".internat-search-hero_form input, .internat-search-hero_form select");

const debounce = (func, delay) => {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
};

inputElements.forEach((element) => {
  element.addEventListener(
    "change",
    debounce(() => {
      updateSearchLink(inputElements[0].value, inputElements[1].value);
    }, 300)
  );
});

const form = document.querySelector(".internat-search-hero_form");

form.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    return false;
  }
});

// COUNTRY NAMES
const dynamicTextElements = document.querySelectorAll(".land-value");

const countryDisplayName = (country) => {
  const landSelect = document.querySelector(".internat-search-hero_form select");
  const option = Array.from(landSelect.options).find((opt) => opt.value.toLowerCase() === country.toLowerCase());
  return option ? option.textContent : "";
};

dynamicTextElements.forEach((element) => {
  element.textContent = countryDisplayName(country);
});

// FILTERS
window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  "cmsfilter",
  (listInstances) => {
    const updateFilterValues = (className) => {
      const inputElements = document.getElementsByClassName(className);
      for (let i = 0; i < inputElements.length; i++) {
        inputElements[i].value = country;
        const event = new Event("input", {
          bubbles: true,
        });
        inputElements[i].dispatchEvent(event);
      }
    };

    if (["england", "schottland", "nordirland", "wales"].includes(country)) {
      updateFilterValues("internate_filter_region");
      updateSearchLink("", country);
    } else if (["schweiz-oesterreich", "spanien-italien"].includes(country)) {
      updateFilterValues("internate_filter_country-shared");
    } else {
      updateFilterValues("internate_filter_country");
    }

    let landValue = "";
    const allCountries = document.getElementsByClassName("about-internate-internat_country-slug");
    for (let i = 0; i < allCountries.length; i++) {
      if (allCountries[i].innerText === country) {
        landValue = allCountries[i].parentElement.querySelector(".about-internate-internat_country-name").innerText;
        allCountries[i].parentElement.parentElement.parentElement.remove();
      }
    }

    const checkRemoveIIF = () => {
      const internateImFokus = document.querySelector(".section_internate-im-fokus");
      const itemsParent = internateImFokus?.querySelector(".about_internate-grid.w-dyn-items");
      if (itemsParent && !itemsParent.hasChildNodes()) {
        internateImFokus.remove();
      }
      const beraterinnenSection = document.querySelector(".section_beraterinnen");
      if (beraterinnenSection) beraterinnenSection.style.backgroundColor = "#f8f3ef";
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
    $(".categoryslider").each(function () {
      new Splide(this, {
        perPage: 5,
        perMove: 1,
        fixedWidth: "16rem",
        fixedHeight: "45rem",
        focus: 0,
        type: "slide",
        gap: "1.25rem",
        arrows: "slider",
        pagination: false,
        speed: 600,
        dragAngleThreshold: 60,
        autoWidth: false,
        rewind: false,
        rewindSpeed: 400,
        waitForTransition: false,
        updateOnMove: true,
        trimSpace: false,
        breakpoints: {
          991: {
            destroy: true,
          },
        },
      }).mount();
    });
  }

  const combineItems = async (activities, sports) => {
    sports.each((index, element) => {
      activities.append($(element));
    });
    categorySlider();
  };

  combineItems($(".activities"), $(".sport"));
});