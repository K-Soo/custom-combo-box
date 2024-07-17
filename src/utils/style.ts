import { useSelectStateTypes } from "../hooks/useSelectState";

export function getDropDownMenuClassName(index: number, state: useSelectStateTypes, code: string): string {
  let classNames = ["menu__item"];

  if (state.highlightedIndex === index && state.usingKeyboard) {
    classNames.push("highlighted");
  }

  if (state.prevSelectedValue.optionValue === code) {
    classNames.push("active-selected");
  }

  if (!state.usingKeyboard) {
    classNames.push("active-hovered");
  }

  return classNames.join(" ");
}
