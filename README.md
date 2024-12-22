# Event Page Filter System

A JavaScript module that provides filtering, sorting, and pagination functionality for event listings.

## Features

- **Filter Events** by:
  - Group
  - Event type
  - Date range (start & end dates)
  - Search by title

- **Sort Events**
  - Toggle between newest and oldest first
  - Default sorting shows newest events first

- **Load More**
  - Pagination system that loads 5 items at a time (configurable)
  - Automatically hides when all items are displayed

- **Bookmark Events**
  - Basic bookmark functionality (partially implemented)

## Usage

### Installation

Add the script to your page. It will automatically initialize on the following URLs:
- https://www.porsche.nu/events
- https://porscheclubsverige.webflow.io/events

### Configuration

The script uses attribute selectors to target DOM elements. Customize these by modifying the `ATTR` object:

```javascript
const ATTR = {
itemList: ".activities-list_layout",
item: "[wized=events-event_list-item]",
// ... other selectors
};
```

### Load Amount

Adjust the number of items loaded per page by modifying:

```javascript
let loadAmount = 5;
```

### URL Parameters

The script supports the following URL parameters:
- `group` - Filter by group
- `event` - Filter by event type

Example: `https://example.com/events?group=Group1&event=Type1`

## Features Details

### Filtering
- All filters are applied in real-time
- Multiple filters can be combined
- URL parameters are preserved for sharing filtered views
- Reset button clears all active filters

### Sorting
- Toggle between "Senaste först" (Newest first) and "Äldsta först" (Oldest first)
- Sort state is maintained while filtering

### Load More
- Automatically shows/hides based on available items
- Respects current filter settings

### Bookmarking
- Basic toggle functionality
- Visual indicator for bookmarked items
- Note: Full bookmark persistence not implemented

## Dependencies

- Wized framework
- Modern browser with support for URL API and ES6 features
