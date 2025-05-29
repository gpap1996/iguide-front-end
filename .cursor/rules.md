# Cursor Rules and Documentation References

## Core Libraries Documentation

### Vue I18n

- Official Documentation: [Vue I18n](https://vue-i18n.intlify.dev/)
- Key Features:
  - Easy internationalization with simple API
  - Support for pluralization, number formatting, and datetime localization
  - Component-oriented locale message management
  - MIT License

### Vuetify

- Official Documentation: [Vuetify](https://vuetifyjs.com/en/getting-started/installation/)
- Key Features:
  - Material Design component framework
  - Built-in dark mode support
  - Responsive grid system
  - Comprehensive component library
  - Customizable theming

### TanStack Query (Vue Query)

- Official Documentation: [TanStack Query](https://tanstack.com/query/v5/docs/framework/vue/overview)
- Key Features:
  - Server state management
  - Automatic background refetching
  - Cache management
  - Optimistic updates
  - Infinite queries support
  - Parallel queries
  - Query invalidation

### VueFire

- Official Documentation: [VueFire](https://vuefire.vuejs.org/)
- Key Features:
  - Official Firebase bindings for Vue
  - Real-time data synchronization
  - Automatic handling of nested collections
  - Document references management
  - Tree-shakable APIs

### Vue ECharts

- Official Documentation: [Vue ECharts](https://vue-echarts.dev/)
- Key Features:
  - Vue wrapper for Apache ECharts
  - Responsive charts
  - Automatic resizing
  - Theme support
  - Component-based chart creation

## Project Structure Guidelines

- Vue components should be in `src/components/`
- Store files should be in `src/stores/`
- Dialog components should be in `src/components/dialogs/`

## Code Style Guidelines

- Use Vue 3 Composition API with `<script setup>`
- Follow Vuetify component patterns
- Use SCSS for styling
- Maintain consistent error handling patterns
- Use TanStack Query for server state management
- Implement VueFire for Firebase integration
- Use Vue ECharts for data visualization

## Validation Rules

- Form validation should be handled at the component level
- Use Vuetify's built-in form validation where possible
- Custom validation should be exposed via `defineExpose`

## State Management

- Use Pinia for client state management
- Use TanStack Query for server state management
- Use VueFire for Firebase state management
- Store references should be created using `storeToRefs`
- Actions should be destructured from store instances

## API Integration

- Use TanStack Query for REST API calls
- Use VueFire for Firebase operations
- Handle loading states appropriately
- Implement proper error handling with snackbar notifications
- Use Vuetify's loading components for better UX

## Component Communication

- Use props and emits for parent-child communication
- Use store for cross-component state sharing
- Follow Vue's one-way data flow principles

## Performance Guidelines

- Use computed properties for derived state
- Implement proper loading states
- Optimize component re-renders
- Use TanStack Query's caching capabilities
- Implement VueFire's real-time updates efficiently
- Optimize ECharts rendering for large datasets

## Accessibility

- Use semantic HTML elements
- Include proper ARIA attributes
- Maintain keyboard navigation support

## Testing Guidelines

- Write unit tests for components
- Test store actions and mutations
- Implement integration tests for critical flows

## Documentation

- Keep component documentation up to date
- Document complex business logic
- Maintain clear prop and emit definitions

## Error Handling

- Use consistent error message format
- Implement proper error boundaries
- Show user-friendly error messages

## Security

- Sanitize user inputs
- Implement proper authentication checks
- Follow Vue security best practices

## Data Visualization

- Use Vue ECharts for complex data visualization
- Implement responsive charts
- Use appropriate chart types for different data
- Optimize chart performance
- Implement proper loading states for charts

## Firebase Integration

- Use VueFire for Firebase operations
- Implement proper security rules
- Handle real-time updates efficiently
- Use Firebase Authentication
- Implement proper error handling for Firebase operations
