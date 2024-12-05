declare module "baeunjs" {
    /**
     * Create a DOM element with attributes, events, and children.
     *
     * @param tagName - The name of the element tag (e.g., "div", "span").
     * @param options - Attributes and event listeners for the element.
     * @param children - The children elements or text to append.
     * @returns The created DOM element.
     */
    export function elem(
      tagName: string,
      options?: Record<string, any>,
      children?: string | number | HTMLElement | Array<string | number | HTMLElement>
    ): HTMLElement;
  
    /**
     * A lightweight hash-based router for SPAs.
     *
     * @param routes - An object where keys are routes and values are components.
     * @param appId - The ID of the DOM element where components will be rendered.
     * @returns A function to manually trigger the router.
     */
    export function hashRouter(
      routes: Record<string, () => HTMLElement>,
      appId?: string
    ): () => void;
  
    /**
     * A state management utility based on localStorage.
     */
    export const stateManager: {
      /**
       * Set a state value.
       *
       * @param key - The key for the state.
       * @param value - The value to store (string, number, object, or null).
       */
      set(key: string, value: string | number | object | null): void;
  
      /**
       * Get a state value.
       *
       * @param key - The key for the state.
       * @returns The stored value, or `null` if not found.
       */
      get<T = any>(key: string): T | null;
  
      /**
       * Update a state value.
       *
       * @param key - The key for the state.
       * @param updater - A function that takes the current value and returns the new value.
       * @returns The updated value.
       */
      update<T = any>(key: string, updater: (currentValue: T | null) => T): T;
  
      /**
       * Remove a state value.
       *
       * @param key - The key for the state to remove.
       */
      remove(key: string): void;
  
      /**
       * Clear all state values.
       */
      clear(): void;
  
      /**
       * Register a callback for state changes.
       *
       * @param key - The key to watch for changes.
       * @param callback - A function that will be called with the new value.
       */
      onChange<T = any>(key: string, callback: (value: T | null) => void): void;
    };
  }
  