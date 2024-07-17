// GLOBALS
const pathname = window.location.pathname;
const country = pathname.replace("/internate/", "");

// REMOVE Internate im Fokus IF EMPTY
const checkRemoveIIF = () => {
  const internateImFokus = document.querySelector(".section_internate-im-fokus");
  const emptyList = internateImFokus?.querySelector(".w-dyn-empty");
  if (emptyList) {
    internateImFokus.remove();
    const beraterinnenSection = document.querySelector(".section_beraterinnen");
    if (beraterinnenSection) beraterinnenSection.style.backgroundColor = "#f8f3ef";
  }
};

checkRemoveIIF();

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

if (["england", "schottland", "nordirland", "wales"].includes(country)) {
  updateSearchLink("", country);
}

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
