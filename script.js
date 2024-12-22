//only run on https://www.porsche.nu/events or https://porscheclubsverige.webflow.io/events
if (window.location.pathname === "/events") {
  window.Wized = window.Wized || [];
  window.Wized.push(async (Wized) => {
    await Wized.requests.waitFor("get_events_list");
    eventPage();
  });
}

function eventPage() {
  // this script creates the following functionality
  // - filter events by group, event, start & end date.
  // - search events by title
  // - sort events by date (inverts the order of the items)
  // - load more events
  // - bookmark events (not fully implemented)

  // filter.apply()
  // filter.searchFilter()
  // util.sortItems()
  // util.loadMore()
  // util.bookmark()

  // change this to set the amount of items to load
  let loadAmount = 5;

  // attribute selectors, change these to match the items in the DOM
  const ATTR = {
    itemList: ".activities-list_layout",
    item: "[wized=events-event_list-item]",
    itemTitle: "[wized=events-event_list-title]",
    group: "[wized=events-event_list-group]",
    category: "[wized=events-event_list-category]",
    loadMore: "[wized=events-event_list-pagination_button]",
    sort: "[wized=events-event_list-sort_button]",
    sortText: "[wized=events-event_list-sort_text]",
    reset: "[wized=events-event_filter-reset_button]",
    bookmark: "[wized=events-event_list-bookmark_button]",
    totalItems: "[wized=events-event_list-items_found]",
    filterGroup: "[wized=events-event_filter-group]",
    filterEvent: "[wized=events-event_filter-type]",
    filterDateFrom: "[wized=events-event_filter-date_from]",
    filterDateTo: "[wized=events-event_filter-date_to]",
    filterSearch: "[wized=events-event_filter-search]",
  };

  // url object to check for query parameters
  const url = new URL(window.location);

  // active filters object
  // values are updated based on:
  // - url query parameters
  // - user input in the filter fields
  let activeFilters = {
    group: url.searchParams.get("group") || null,
    event: url.searchParams.get("event") || null,
    dateFrom: null,
    dateTo: null,
    search: null,
  };

  // Variable declarations
  var itemList = document.querySelector(ATTR.itemList);
  let DOMitems = [];
  let filteredItems = [];
  let totalItemsSpan = document.querySelector(ATTR.totalItems);
  let util = utility();
  let filter = filters();

  var filtering;
  var sorted = "true";

  init();

  function init() {
    setClickEvents();
    storeItems();
    filter.init();
    filter.apply();

    // sets the sort text to "Senaste först"
    document.querySelector(ATTR.sortText).textContent = "Senaste först";

    // sets up the click events
    function setClickEvents() {
      document.addEventListener("click", (e) => {
        const target = e.target;

        if (targetElement(target, ATTR.loadMore)) {
          util.loadMore();
        }
        if (targetElement(target, ATTR.sort)) {
          util.sortItems();
        }
        if (targetElement(target, ATTR.reset)) {
          util.resetFilter();
        }
        if (targetElement(target, ATTR.bookmark)) {
          util.bookmark(target, e);
        }
      });

      function targetElement(target, atribute) {
        //if the target or child element contains the "[example=attribute]", return true
        return target.matches(atribute) || target.closest(atribute);
      }
    }

    // copies the items from the DOM and stores them in an array
    function storeItems() {
      document.querySelectorAll(ATTR.item).forEach((item) => {
        let node = item.cloneNode(true);
        let group = node.querySelector(ATTR.group).textContent;
        let category = node.querySelector(ATTR.category).textContent;
        let id = node.getAttribute("data-id");
        node.setAttribute("data-group", group);
        node.setAttribute("data-category", category);
        node.setAttribute(
          "href",
          window.location.origin +
            window.location.pathname +
            "/event?event_id=" +
            id
        );
        DOMitems.push(node);
      });
    }
  }

  function filters() {
    // filters the items based on the activeFilters object
    function apply() {
      filtering = "true";
      let itemList = DOMitems;

      // filter by group
      if (activeFilters.group) {
        itemList = itemList.filter(
          (item) => item.getAttribute("data-group") === activeFilters.group
        );
      }

      // filter by event
      if (activeFilters.event) {
        itemList = itemList.filter(
          (item) => item.getAttribute("data-category") === activeFilters.event
        );
      }

      // filter by date
      if (activeFilters.dateFrom || activeFilters.dateTo) {
        itemList = itemList.filter((item) => {
          const itemDate = new Date(item.getAttribute("data-date"));
          if (
            activeFilters.dateFrom &&
            new Date(activeFilters.dateFrom) > itemDate
          ) {
            return false;
          }

          if (
            activeFilters.dateTo &&
            new Date(activeFilters.dateTo) < itemDate
          ) {
            return false;
          }

          return true;
        });
      }

      // filter by search
      if (activeFilters.search) {
        itemList = itemList.filter((item) => {
          let title = item
            .querySelector(ATTR.itemTitle)
            .textContent.toLowerCase();
          return title.includes(activeFilters.search.toLowerCase());
        });
      }

      // store the filtered items in the filteredItems array
      filteredItems = itemList;
      // update the list on the page
      updateList();
    }

    //sets event listeners & initialize filters from query params
    function init() {
      groupFilter();
      eventFilter();
      dateFilter();
      searchFilter();

      function groupFilter() {
        let filterSelectGroup = document.querySelector(ATTR.filterGroup);
        filterSelectGroup.value = url.searchParams.get("group") || "";

        //sends the user input to the activeFilters object
        filterSelectGroup.addEventListener("change", () => {
          let selectedValue = filterSelectGroup.value;

          if (selectedValue === "") {
            url.searchParams.delete("group");
            activeFilters.group = null;
          } else {
            url.searchParams.set("group", selectedValue);
            activeFilters.group = selectedValue;
          }

          window.history.pushState({}, "", url);
          filter.apply();
        });
      }

      function eventFilter() {
        let filterSelectEvent = document.querySelector(ATTR.filterEvent);
        filterSelectEvent.value = url.searchParams.get("event") || "- Alla -";

        //sends the user input to the activeFilters object
        filterSelectEvent.addEventListener("change", () => {
          let selectedValue = filterSelectEvent.value;

          if (selectedValue === "- Alla -") {
            url.searchParams.delete("event");
            activeFilters.event = null;
          } else {
            url.searchParams.set("event", selectedValue);
            activeFilters.event = selectedValue;
          }

          window.history.pushState({}, "", url);
          filter.apply();
        });
      }

      function dateFilter() {
        let dateFromInput = document.querySelector(ATTR.filterDateFrom);
        //sends the user input to the activeFilters object
        dateFromInput.addEventListener("input", () => {
          activeFilters.dateFrom = dateFromInput.value;
          filter.apply();
        });
        let dateToInput = document.querySelector(ATTR.filterDateTo);
        //sends the user input to the activeFilters object
        dateToInput.addEventListener("input", () => {
          activeFilters.dateTo = dateToInput.value;
          filter.apply();
        });
      }

      function searchFilter() {
        let searchInput = document.querySelector(ATTR.filterSearch);
        //sends the user input to the activeFilters object
        searchInput.addEventListener("input", () => {
          activeFilters.search = searchInput.value;
          filter.apply();
        });
      }
    }

    return {
      init,
      apply,
    };
  }

  function updateList() {
    util.clearGrid();
    let loop = 0;
    let data = [];

    if (filtering === "true") {
      data = filteredItems;
    } else {
      data = DOMitems;
    }

    if (sorted === "false") {
      data = data.slice().reverse();
    }

    data.forEach((item) => {
      item.style = "";
      item.removeAttribute("node-hidden");
      loop++;
      if (loop < loadAmount) {
        itemList.appendChild(item);
      } else {
        item.setAttribute("node-hidden", "true");
        item.style.display = "none";
        itemList.appendChild(item);
      }
    });
    totalItemsSpan.textContent = data.length;
    util.handleEmptyState(data);
  }

  function utility() {
    function bookmark(target, e) {
      e.stopPropagation();
      e.preventDefault();
      let current = target.closest(ATTR.bookmark);

      if (current.hasAttribute("selected")) {
        removeBookmark(current);
      } else {
        addBookmark(current);
      }

      function addBookmark(current) {
        current.querySelector(".selected").style.display = "block";
        current.querySelector(".button-icon").style.display = "none";
        current.setAttribute("selected", "true");
      }
      function removeBookmark(current) {
        current.querySelector(".selected").style.display = "none";
        current.querySelector(".button-icon").style.display = "block";
        current.removeAttribute("selected");
      }
    }

    function sortItems() {
      // sets the sorted variable and updates the list
      if (sorted === "true") {
        sorted = "false";
        updateList();

        document.querySelector(ATTR.sortText).textContent = "Äldsta först";
      } else {
        sorted = "true";
        updateList();

        document.querySelector(ATTR.sortText).textContent = "Senaste först";
      }
    }

    function handleEmptyState(data) {
      if (data.length === 0) {
        totalItemsSpan.textContent = "0";
        util.hideLoadMoreButton();
      }
      if (data.length < loadAmount) {
        util.hideLoadMoreButton();
      } else {
        util.showLoadMoreButton();
      }
    }

    function loadMore() {
      let nodeList = document.querySelectorAll("[node-hidden=true]");

      for (let i = 0; i < loadAmount && i < nodeList.length; i++) {
        nodeList[i].removeAttribute("node-hidden");
        nodeList[i].style.display = "flex";
      }

      if (nodeList.length === loadAmount) {
        util.hideLoadMoreButton();
      }

      if (nodeList.length === 0) {
        util.hideLoadMoreButton();
        return;
      }
    }

    function resetFilter() {
      filtering = "false";
      document.querySelector(ATTR.filterSearch).value = "";
      document.querySelector(ATTR.filterGroup).value = "";
      document.querySelector(ATTR.filterEvent).value = "- Alla -";
      document.querySelector(ATTR.filterDateFrom).value = "";
      document.querySelector(ATTR.filterDateTo).value = "";
      url.searchParams.delete("group");
      url.searchParams.delete("event");
      window.history.pushState({}, "", url);
      activeFilters = {
        group: null,
        event: null,
        dateFrom: null,
        dateTo: null,
        search: null,
      };
      updateList();
    }

    function showLoadMoreButton() {
      document.querySelector(ATTR.loadMore).style.display = "flex";
    }

    function hideLoadMoreButton() {
      document.querySelector(ATTR.loadMore).style.display = "none";
    }

    function clearGrid() {
      let allItems = document.querySelectorAll(ATTR.item);
      allItems.forEach((item) => {
        item.remove();
      });
    }

    return {
      bookmark,
      handleEmptyState,
      loadMore,
      showLoadMoreButton,
      hideLoadMoreButton,
      resetFilter,
      clearGrid,
      sortItems,
    };
  }
}
