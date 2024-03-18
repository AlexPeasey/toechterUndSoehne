$(document).ready(function () {

    // Move rich text inside summer schools item
    $(".summer-schools-item.w-dyn-item").each((index, item) => {
    $(item).find(".summer-schools_description").appendTo($(item).find(".summer-schools_school-link"));
    });
  
  
    // Initialize the datepicker
    $('[data-toggle="datepicker"]').datepicker({
        format: 'dd.mm.yyyy',
        autoHide: true,
        language: 'de-DE'
    });
  
    // Set input field to readonly on smaller screens
    if (window.innerWidth < 768) {
        $('[data-toggle="datepicker"]').attr('readonly', 'readonly');
    }
  
    // Parse date string in DD.MM.YYYY format
    function parseDate(dateString) {
        let parts = dateString.split(".");
        // Note: months are 0-based in JavaScript Date
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  
    // Function to filter items based on the date
    function filterItems(pickedDate) {
        let items = document.querySelectorAll('.summer-schools_list .w-dyn-item');
      
        items.forEach(item => {
            const startDate = new Date(parseDate(item.querySelector('.start-date').innerText));
            const endDate = new Date(parseDate(item.querySelector('.end-date').innerText));
            const shouldBeVisible = pickedDate >= startDate && pickedDate <= endDate;
        
            if (shouldBeVisible && item.classList.contains('fade-out')) {
                item.style.display = ''; // Make it visible in the flow
                requestAnimationFrame(() => {
                    item.classList.remove('fade-out'); // Start fade-in transition
                });
            } else if (!shouldBeVisible && !item.classList.contains('fade-out')) {
                item.classList.add('fade-out'); // Start fade-out transition
                setTimeout(() => {
                    item.style.display = 'none'; // Completely hide after transition
                }, 100); // match the duration of the CSS transition
            }
        });        
    }
    
       // Function to filter items based on age
    function filterAge(age) {
        let items = document.querySelectorAll('.summer-schools_list .w-dyn-item');
      
        items.forEach(item => {
            const ageFrom = Number(item.querySelector(".age-from").textContent)
            const ageTo = Number(item.querySelector(".age-to").textContent)
            const shouldBeVisible = age >= ageFrom && age <= ageTo
            if (shouldBeVisible && item.classList.contains('fade-out')) {
                item.style.display = ''; // Make it visible in the flow
                requestAnimationFrame(() => {
                    item.classList.remove('fade-out'); // Start fade-in transition
                });
            } else if (!shouldBeVisible && !item.classList.contains('fade-out')) {
                item.classList.add('fade-out'); // Start fade-out transition
                setTimeout(() => {
                    item.style.display = 'none'; // Completely hide after transition
                }, 100); // match the duration of the CSS transition
            }
        });        
    }
  
    function resetItemsVisibility() {
        let items = document.querySelectorAll('.summer-schools_list .w-dyn-item');
        items.forEach(item => {
            if (item.classList.contains('fade-out')) {
                item.style.display = '';
                requestAnimationFrame(() => {
                    item.classList.remove('fade-out');
                });
            } else {
                item.style.display = '';
            }
        });
    }
    
    const countItems = () => {
    let items = $(".summer-schools-item").not(".fade-out")
    $(".summer-schools_results-amount.filtered").text(items.length)
    }
  
    const UpdateAndShowDateTag = () => {
        const dateTag = $(".summer-schools_date-filter-tag")
        const dateText = $(".date-tag-text")
        const date = $(".summer-schools_input.w-input").val()
        console.log(date)
        dateText.text(`Datum: ${date}`)
        dateTag.show()
    }
      const UpdateAndShowAgeTag = (age) => {
      const ageTag = $(".summer-schools_age-filter-tag")
        const ageText = $(".age-tag-text")
        ageText.text(`Alter: ${age}`)
        ageTag.show()
    }
  
    const removeDateFilter = () => {
        const dateTag = $(".summer-schools_date-filter-tag")
        dateTag.hide()
        $('[data-toggle="datepicker"]').datepicker('reset');
        resetItemsVisibility();
    }
    
    
    const removeAgeFilter = () => {
        const ageTag = $(".summer-schools_age-filter-tag")
        ageTag.hide()
        $(".age-select option:eq(0)").prop('selected', true);
        resetItemsVisibility();
    }
    
    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
    'cmsfilter',
    (filterInstances) => {
      const [filterInstance] = filterInstances;
      filterInstance.listInstance.on('renderitems', (renderedItems) => {
        countItems();
      });
    },
  ]);
  
    const tagsContainer = $(".summer-schools_filter-tags")
  
  
    // Listen for the pick event from the datepicker
    $('[data-toggle="datepicker"]').on('pick.datepicker', function (e) {
        let pickedDate = e.date;
        filterItems(pickedDate);
        setTimeout(() => { 
          countItems();
            UpdateAndShowDateTag();
        }, 200);
    });
  
    // Listen for input events
    $('[data-toggle="datepicker"]').on('input', function () {
        let inputVal = $(this).val();
        // Regular expression to match date format DD.MM.YYYY
        let dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        
        if (dateRegex.test(inputVal)) {
            let parsedDate = parseDate(inputVal);
            // Trigger the filtering function if the date format is correct
            filterItems(parsedDate);
        }
    });
  
    //
    $('.summer-schools_date-filter-tag .close-tag').on('click', function () {
        removeDateFilter();
        setTimeout(() => { 
          countItems();
        }, 200);
    });
    
    // Remove date filter when all filters are cleared
    $(".summer-schools_clear-all-filters").on('click', function () {
        removeDateFilter();
        removeAgeFilter();
        setTimeout(() => { 
          countItems();
        }, 200);
    })
    
  
  
      // Event listener for the select field
      $('.age-select').change(function() {
        // Capture the selected value
        var selectedAge = $(this).val();
        console.log(selectedAge)
        // Check if something was selected
        if (selectedAge) {
          // Call the function and pass the selected value
          filterAge(selectedAge);
          UpdateAndShowAgeTag(selectedAge);
          setTimeout(() => { 
            countItems();
          }, 200);
        } else {
          removeAgeFilter()
        }
      });
    
  
    // reset age filter
    $('.summer-schools_age-filter-tag .close-tag').on('click', function () {
        removeAgeFilter();
        setTimeout(() => { 
          countItems();
        }, 200);
    });
  });