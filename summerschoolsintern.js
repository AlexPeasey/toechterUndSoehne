document.addEventListener("DOMContentLoaded", () => {
  // Move rich text inside summer schools item
  document.querySelectorAll(".summer-schools-item.w-dyn-item").forEach((item) => {
    const description = item.querySelector(".summer-schools_description");
    const link = item.querySelector(".summer-schools_school-link");
    if (description && link) {
      link.appendChild(description);
    }
  });

  // Initialize the datepicker
  const datepickers = document.querySelectorAll('[data-toggle="datepicker"]');
  datepickers.forEach((datepicker) => {
    new Datepicker(datepicker, {
      format: "dd.mm.yyyy",
      autoHide: true,
      language: "de-DE",
    });
  });

  // Set input field to readonly on smaller screens
  if (window.innerWidth < 768) {
    datepickers.forEach((datepicker) => {
      datepicker.setAttribute("readonly", "readonly");
    });
  }

  // Parse date string in DD.MM.YYYY format
  function parseDate(dateString) {
    let parts = dateString.split(".");
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }

  // Function to filter items based on the date
  function filterItems(pickedDate) {
    let items = document.querySelectorAll(".summer-schools-item.w-dyn-item");

    items.forEach((item) => {
      const startDate = parseDate(item.querySelector(".start-date").innerText);
      const endDate = parseDate(item.querySelector(".end-date").innerText);
      const shouldBeVisible = pickedDate >= startDate && pickedDate <= endDate;

      if (shouldBeVisible && item.classList.contains("fade-out")) {
        item.style.display = ""; // Make it visible in the flow
        requestAnimationFrame(() => {
          item.classList.remove("fade-out"); // Start fade-in transition
        });
      } else if (!shouldBeVisible && !item.classList.contains("fade-out")) {
        item.classList.add("fade-out"); // Start fade-out transition
        setTimeout(() => {
          item.style.display = "none"; // Completely hide after transition
        }, 100); // match the duration of the CSS transition
      }
    });
  }

  // Function to filter items based on age
  function filterAge(age) {
    let items = document.querySelectorAll(".summer-schools_list .w-dyn-item");

    items.forEach((item) => {
      const ageFromElement = item.querySelector(".age-from");
      const ageToElement = item.querySelector(".age-to");

      // Check if both elements exist before proceeding
      if (ageFromElement && ageToElement) {
        const ageFrom = Number(ageFromElement.textContent);
        const ageTo = Number(ageToElement.textContent);
        const shouldBeVisible = age >= ageFrom && age <= ageTo;

        if (shouldBeVisible && item.classList.contains("fade-out")) {
          item.style.display = ""; // Make it visible in the flow
          requestAnimationFrame(() => {
            item.classList.remove("fade-out"); // Start fade-in transition
          });
        } else if (!shouldBeVisible && !item.classList.contains("fade-out")) {
          item.classList.add("fade-out"); // Start fade-out transition
          setTimeout(() => {
            item.style.display = "none"; // Completely hide after transition
          }, 100); // match the duration of the CSS transition
        }
      }
    });
  }

  function resetItemsVisibility() {
    let items = document.querySelectorAll(".summer-schools_list .w-dyn-item");
    items.forEach((item) => {
      if (item.classList.contains("fade-out")) {
        item.style.display = "";
        requestAnimationFrame(() => {
          item.classList.remove("fade-out");
        });
      } else {
        item.style.display = "";
      }
    });
  }

  const countItems = () => {
    let items = document.querySelectorAll(".summer-schools-item:not(.fade-out)");
    document.querySelector(".summer-schools_results-amount.filtered").textContent = items.length;
  };

  const updateAndShowDateTag = () => {
    const dateTag = document.querySelector(".summer-schools_date-filter-tag");
    const dateText = document.querySelector(".date-tag-text");
    const date = document.querySelector(".summer-schools_input.w-input").value;
    dateText.textContent = `Datum: ${date}`;
    dateTag.style.display = "block";
  };

  const updateAndShowAgeTag = (age) => {
    const ageTag = document.querySelector(".summer-schools_age-filter-tag");
    const ageText = document.querySelector(".age-tag-text");
    ageText.textContent = `Alter: ${age}`;
    ageTag.style.display = "block";
  };

  const removeDateFilter = () => {
    const dateTag = document.querySelector(".summer-schools_date-filter-tag");
    dateTag.style.display = "none";
    datepickers.forEach((datepicker) => {
      datepicker.datepicker("reset");
    });
    resetItemsVisibility();
  };

  const removeAgeFilter = () => {
    const ageTag = document.querySelector(".summer-schools_age-filter-tag");
    ageTag.style.display = "none";
    document.querySelector(".age-select").selectedIndex = 0;
    resetItemsVisibility();
  };

  window.fsAttributes = window.fsAttributes || [];
  window.fsAttributes.push([
    "cmsfilter",
    (filterInstances) => {
      const [filterInstance] = filterInstances;
      filterInstance.listInstance.on("renderitems", (renderedItems) => {
        countItems();

        // Step 1: Gather all unique attributes from the items
        var uniqueAttributes = {}; // Using an object to store unique values

        document.querySelectorAll(".summer-schools-item").forEach((item) => {
          // Assuming 'fs-cmsfilter-field="Schwerpunkt"' is an attribute of a child element of '.summer-schools-item'
          item.querySelectorAll('[fs-cmsfilter-field="Schwerpunkt"]').forEach((child) => {
            var attributeValue = child.textContent.trim();
            uniqueAttributes[attributeValue] = true; // Store the attribute value as a key in the object
          });
        });

        // Step 2: Remove options from the select field that do not match the gathered attributes
        document.querySelectorAll(".schwerpunkt-select option").forEach((option) => {
          if (!uniqueAttributes[option.value]) {
            // If the option value is not a key in our uniqueAttributes object, remove it
            option.remove();
          }
        });
      });
    },
  ]);

  const tagsContainer = document.querySelector(".summer-schools_filter-tags");

  // Listen for the pick event from the datepicker
  datepickers.forEach((datepicker) => {
    datepicker.addEventListener("pick.datepicker", (e) => {
      let pickedDate = e.date;
      filterItems(pickedDate);
      setTimeout(() => {
        countItems();
        updateAndShowDateTag();
      }, 200);
    });

    // Listen for input events
    datepicker.addEventListener("input", () => {
      let inputVal = datepicker.value;
      // Regular expression to match date format DD.MM.YYYY
      let dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;

      if (dateRegex.test(inputVal)) {
        let parsedDate = parseDate(inputVal);
        // Trigger the filtering function if the date format is correct
        filterItems(parsedDate);
      }
    });
  });

  document.querySelector(".summer-schools_date-filter-tag .close-tag").addEventListener("click", () => {
    removeDateFilter();
    setTimeout(() => {
      countItems();
    }, 200);
  });

  // Remove date filter when all filters are cleared
  const clearFilters = document.querySelector(".summer-schools_clear-all-filters");
  if (clearFilters) {
    clearFilters.addEventListener("click", () => {
      removeDateFilter();
      removeAgeFilter();
      setTimeout(() => {
        countItems();
      }, 200);
    });
  }
  // Event listener for the select field
  document.querySelector(".age-select").addEventListener("change", (event) => {
    var selectedAge = event.target.value;
    // Check if something was selected
    if (selectedAge) {
      // Call the function and pass the selected value
      filterAge(selectedAge);
      updateAndShowAgeTag(selectedAge);
      setTimeout(() => {
        countItems();
      }, 200);
    } else {
      removeAgeFilter();
    }
  });

  // Reset age filter
  document.querySelector(".summer-schools_age-filter-tag .close-tag").addEventListener("click", () => {
    removeAgeFilter();
    setTimeout(() => {
      countItems();
    }, 200);
  });

  const schwerpunktDropdown = document.querySelector(".schwerpunkt-dropdown");
  schwerpunktDropdown[0].value = "";

  window.fsAttributes.push([
    "cmsfilter",
    (filterInstances) => {
      const [filterInstance] = filterInstances;
      filterInstance.listInstance.on("renderitems", (renderedItems) => {
        const items = document.querySelectorAll(".summer-schools-item:not(.fade-out)");
        const nixDabei = document.querySelector(".summer-schools_nix-dabei");
        const beraterinnenElement = document.querySelector("#beraterinnen-between");
        const schoolsList = document.querySelector(".summer-schools_list");
        const emptyState = document.querySelector(".summer-schools_empty-state");
        if (items.length < 6 && items.length) {
          emptyState.style.display = "none";
          schoolsList.style.removeProperty("display");
          nixDabei.style.display = "flex";
          beraterinnenElement.style.display = "block";
          items[items.length - 1].after(nixDabei);
          nixDabei.after(beraterinnenElement);
        }
        if (items.length > 5) {
          emptyState.style.display = "none";
          schoolsList.style.removeProperty("display");
          nixDabei.style.display = "flex";
          beraterinnenElement.style.display = "block";
          items[4].after(nixDabei);
          nixDabei.after(beraterinnenElement);
        }
        if (items.length === 0) {
          emptyState.style.display = "block";
          emptyState.style.opacity = "1";
          setTimeout(() => {
            schoolsList.style.display = "none";
          }, 0);
        }
      });
    },
  ]);

  const clearButtonForm = document.getElementById("clear-button-form");
  const clearButtonInline = document.getElementById("clear-button-inline");
  clearButtonInline.addEventListener("click", () => {
    clearButtonForm.dispatchEvent(new Event("click", { bubbles: true }));
  });

  const landSelect = document.querySelector(".land-select");
  const landInputHelper = document.querySelector(".land-input-helper");
  landSelect.addEventListener("input", () => {
    landInputHelper.value = landSelect.value;
    landInputHelper.dispatchEvent(new Event("input", { bubbles: true }));
  });

  const schwerpunktHelper = document.querySelector(".schwerpunkt-helper");
  schwerpunktDropdown.addEventListener("input", () => {
    schwerpunktHelper.value = schwerpunktDropdown.value;
    schwerpunktHelper.dispatchEvent(new Event("input", { bubbles: true }));
  });
});
