import { useReducer } from "react";

export interface useSelectStateTypes {
  highlightedIndex: number;
  prevSelectedValue: { name: string; optionValue: string };
  isOpenDropDownMenu: boolean;
  hover: boolean;
  focus: boolean;
  usingKeyboard: boolean;
}

const initialState: useSelectStateTypes = {
  highlightedIndex: -1,
  prevSelectedValue: { name: "", optionValue: "" },
  isOpenDropDownMenu: false,
  hover: false,
  focus: false,
  usingKeyboard: false,
};

export type Action =
  | { type: "SET_HIGHLIGHTED_INDEX"; index: number }
  | { type: "SET_PREV_SELECTED_VALUE"; value: { name: string; optionValue: string } }
  | { type: "SET_IS_OPEN_DROP_DOWN_MENU"; isOpenDropDownMenu: boolean }
  | { type: "SET_HOVER"; hover: boolean }
  | { type: "SET_FOCUS"; focus: boolean }
  | { type: "SET_USING_KEYBOARD"; usingKeyboard: boolean }
  | { type: "SET_LAYOUT_UPDATED"; layoutUpdated: boolean };

function reducer(state: useSelectStateTypes, action: Action): useSelectStateTypes {
  switch (action.type) {
    case "SET_HIGHLIGHTED_INDEX":
      return { ...state, highlightedIndex: action.index };
    case "SET_PREV_SELECTED_VALUE":
      return { ...state, prevSelectedValue: action.value };
    case "SET_IS_OPEN_DROP_DOWN_MENU":
      return { ...state, isOpenDropDownMenu: action.isOpenDropDownMenu };
    case "SET_HOVER":
      return { ...state, hover: action.hover };
    case "SET_FOCUS":
      return { ...state, focus: action.focus };
    case "SET_USING_KEYBOARD":
      return { ...state, usingKeyboard: action.usingKeyboard };
    default:
      return state;
  }
}

export const useSelectState = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return { state, dispatch };
};
