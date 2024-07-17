import { useRef, useEffect, forwardRef, MutableRefObject } from "react";
import { Options } from "../../types";
import { useSelectStateTypes } from "../../hooks/useSelectState";
import { getDropDownMenuClassName } from "../../utils/style";
import "./dropDownMenu.css";

interface DropDownMenuProps {
  filteredSuggestions: Options;
  handleMouseMove: (index: number) => void;
  handleMouseDown: (label: string, value: string) => void;
  state: useSelectStateTypes;
}

export default forwardRef<HTMLLIElement[] | null[], DropDownMenuProps>(function DropDownMenu(
  { filteredSuggestions, handleMouseMove, state, handleMouseDown },
  ref
) {
  const dropDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePositioning = () => {
      if (!dropDownRef.current) return;
      const selectRect = (dropDownRef.current.parentNode as HTMLElement)?.getBoundingClientRect();
      if (!selectRect) return;
      const menuHeight = dropDownRef.current.clientHeight;

      const spaceAbove = selectRect.top;
      const spaceBelow = window.innerHeight - selectRect.bottom;

      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        // 메뉴를 위로 펼칠 공간이 충분하고 아래로는 충분하지 않을 경우 (메뉴 top 위치)
        dropDownRef.current.style.top = "auto";
        dropDownRef.current.style.bottom = "101%";
      }
      if (spaceBelow > menuHeight && spaceAbove < menuHeight) {
        // 아래로 펼칠 공간이 충분하거나, 둘 다 충분하지 않을 경우
        dropDownRef.current.style.top = "101%";
        dropDownRef.current.style.bottom = "auto";
      }
    };
    if (state.isOpenDropDownMenu) {
      handlePositioning();
      window.addEventListener("scroll", handlePositioning, true);
    } else {
      window.removeEventListener("scroll", handlePositioning, true);
    }
    return () => {
      window.removeEventListener("scroll", handlePositioning, true);
    };
  }, [filteredSuggestions, state.isOpenDropDownMenu]);

  return (
    <div className="drop-down-menu" ref={dropDownRef} style={{ visibility: state.isOpenDropDownMenu ? "visible" : "hidden" }}>
      <ul className="menu">
        {filteredSuggestions.length === 0 && <li className="menu__item">No Options</li>}
        {filteredSuggestions.map((option, index) => (
          <li
            className={getDropDownMenuClassName(index, state, option.code)}
            key={option.code}
            data-option-value={option.code}
            aria-label={option.name}
            ref={(el) => {
              (ref as MutableRefObject<(HTMLLIElement | null)[]>).current![index] = el;
            }}
            onMouseDown={() => handleMouseDown(option.name, option.code)}
            onMouseMove={() => handleMouseMove(index)}
          >
            {option.name}
          </li>
        ))}
      </ul>
    </div>
  );
});
