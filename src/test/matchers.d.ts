// Augments vitest's Assertion type with @testing-library/jest-dom matchers.
// Required because jest-dom@7.0.1 ships with types/vitest.d.ts missing on disk.
declare module 'vitest' {
  interface Assertion<R = any> {
    toBeInTheDocument(): R;
    toBeVisible(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeRequired(): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toBeEmptyDOMElement(): R;
    toBeInvalid(): R;
    toBeValid(): R;
    toHaveValue(value?: string | string[] | number): R;
    toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
    toHaveClass(...classNames: string[]): R;
    toHaveAttribute(attr: string, value?: string | RegExp): R;
    toHaveStyle(css: string | Record<string, unknown>): R;
    toHaveFocus(): R;
    toHaveFormValues(expectedValues: Record<string, unknown>): R;
    toContainElement(element: HTMLElement | null): R;
    toContainHTML(html: string): R;
    toHaveDescription(text?: string | RegExp): R;
    toHaveErrorMessage(text?: string | RegExp): R;
    toHaveAccessibleDescription(text?: string | RegExp): R;
    toHaveAccessibleName(text?: string | RegExp): R;
  }
}
