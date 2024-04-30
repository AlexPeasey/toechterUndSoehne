window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  "cmsfilter",
  (listInstances) => {
    const pathname = window.location.pathname;
    const country = pathname.replace("/internate/", "");

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
    const dynamicTextElements = document.querySelectorAll(".land-value");

    dynamicTextElements.forEach((element) => {
      element.textContent = landValue;
    });
    if (country === "england" || country === "schottland") {
      dynamicTextElements.forEach((element) => {
        element.textContent = country;
      });
    }
  },
]);

$(document).ready(function () {
  $(".alle-laender-zeigen").appendTo($(".internate-nach-laendern_grid")).show();
});

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
