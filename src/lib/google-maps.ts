/**
 * Stable libraries array for @react-google-maps/api useJsApiLoader.
 * Must be a single reference so LoadScript is not reloaded when multiple
 * components (EventMap, BrowseLocationSelector, LocationAutocomplete) use the loader.
 */
export const GOOGLE_MAPS_LIBRARIES: ("maps" | "places")[] = ["maps", "places"];
