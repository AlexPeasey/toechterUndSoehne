document.addEventListener("DOMContentLoaded", () => {
  // Move rich text inside summer schools item
  document.querySelectorAll(".summer-schools-item.w-dyn-item").forEach((item) => {
    const description = item.querySelector(".summer-schools_description");
    const link = item.querySelector(".summer-schools_school-link");
    if (description && link) {
      link.appendChild(description);
    }
  });

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

  const removeAgeFilter = () => {
    document.querySelector(".age-select").selectedIndex = 0;
    resetItemsVisibility()
  }

  // Event listener for the select field
  document.querySelector(".age-select").addEventListener("change", (event) => {
    var selectedAge = event.target.value;
    // Check if something was selected
    if (selectedAge) {
      // Call the function and pass the selected value
      filterAge(selectedAge);
    } else {
      removeAgeFilter();
    }
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
    var selectedAge = document.querySelector(".age-select").value;
    if (selectedAge) {
      filterAge(selectedAge);
    }
  });

  const schwerpunktHelper = document.querySelector(".schwerpunkt-helper");
  schwerpunktDropdown.addEventListener("input", () => {
    schwerpunktHelper.value = schwerpunktDropdown.value;
    schwerpunktHelper.dispatchEvent(new Event("input", { bubbles: true }));
  });
});
