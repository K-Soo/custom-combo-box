import { useEffect, KeyboardEvent, useRef, ChangeEvent, useCallback, useState } from "react";
import ArrowIcon from "../../icons/ArrowIcon";
import CloseIcon from "../../icons/CloseIcon";
import DropDownMenu from "../dropDownMenu";
import { useSelectState } from "../../hooks/useSelectState";
import { Options } from "../../types";
import "./select.css";

interface SelectProps {
  value: string;
  options: Options | (() => Promise<Options>);
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedValue: React.Dispatch<React.SetStateAction<string>>;
}

const INIT_PREV_STATE_VALUE = { name: "", optionValue: "" };

export default function Select({ options, onChange, value, setSelectedValue }: SelectProps) {
  const { state, dispatch } = useSelectState();
  const [filteredSuggestions, setFilteredSuggestions] = useState<Options>([]);
  const [allSuggestions, setAllSuggestions] = useState<Options>([]);
  const [loadState, setLoadState] = useState({ isLoading: false, isError: false });

  const placeholderText = loadState.isError ? "잠시 후 다시 시도해주세요" : loadState.isLoading ? "로딩 중..." : "선택";

  const updateSuggestions = (data: Options) => {
    setAllSuggestions(data);
    setFilteredSuggestions(data);
    dispatch({ type: "SET_LAYOUT_UPDATED", layoutUpdated: false });
  };

  const fetchData = async () => {
    setLoadState((prev) => ({ ...prev, isLoading: true }));
    try {
      const data = await (options as () => Promise<Options>)();
      if (!data) throw new Error();
      updateSuggestions(data);
    } catch (error) {
      setLoadState((prev) => ({ ...prev, isError: true }));
    } finally {
      setLoadState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    if (typeof options === "function") {
      fetchData();
      return;
    }
    updateSuggestions(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownItemRefs = useRef<HTMLLIElement[] | null[]>([]);

  // 강조 표시된 드롭다운 항목을 뷰로 스크롤합니다.
  useEffect(() => {
    if (state.isOpenDropDownMenu && dropdownItemRefs.current[state.highlightedIndex] && state.usingKeyboard) {
      dropdownItemRefs.current[state.highlightedIndex]?.scrollIntoView({ behavior: "auto", block: "nearest" });
    }
  }, [state.highlightedIndex, state.isOpenDropDownMenu, state.usingKeyboard]);

  // 값이 변경될 때 강조된 인덱스를 재설정하거나 설정하고 입력필드가 초기화될경우 최상단으로 스크롤합니다.
  useEffect(() => {
    if (value.trim() === "") {
      dispatch({ type: "SET_HIGHLIGHTED_INDEX", index: -1 });
      dispatch({ type: "SET_PREV_SELECTED_VALUE", value: INIT_PREV_STATE_VALUE });
      if (dropdownItemRefs.current[0] && typeof dropdownItemRefs.current[0].scrollIntoView === "function") {
        dropdownItemRefs.current[0].scrollIntoView({ behavior: "auto", block: "nearest" });
      }
      return;
    }
    const existSelectedValue = filteredSuggestions.findIndex((option) => option.code === state.prevSelectedValue.optionValue);
    dispatch({ type: "SET_HIGHLIGHTED_INDEX", index: existSelectedValue });
  }, [dispatch, filteredSuggestions, state.prevSelectedValue.optionValue, value]);

  // 드롭다운 항목에 대한 키보드 탐색
  const handleKeyDown = (event: KeyboardEvent) => {
    dispatch({ type: "SET_USING_KEYBOARD", usingKeyboard: true });
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        dispatch({ type: "SET_HIGHLIGHTED_INDEX", index: (state.highlightedIndex + 1) % filteredSuggestions.length });
        break;
      case "ArrowUp":
        event.preventDefault();
        dispatch({
          type: "SET_HIGHLIGHTED_INDEX",
          index: state.highlightedIndex - 1 < 0 ? filteredSuggestions.length - 1 : state.highlightedIndex - 1,
        });
        break;
      case "Enter":
        if (dropdownItemRefs.current[state.highlightedIndex]) {
          const { innerText } = dropdownItemRefs.current[state.highlightedIndex]!;
          const dataset = dropdownItemRefs.current[state.highlightedIndex]?.dataset;
          const optionValue = dataset?.optionValue ?? "";
          setSelectedValue(innerText);
          dispatch({ type: "SET_PREV_SELECTED_VALUE", value: { name: innerText, optionValue } });
          dispatch({ type: "SET_IS_OPEN_DROP_DOWN_MENU", isOpenDropDownMenu: false });
        }
        break;
    }
  };

  // 입력 변경에 따라 제안 목록을 필터링합니다.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!state.isOpenDropDownMenu) {
      // dispatch({ type: "SET_IS_OPEN_DROP_DOWN_MENU", isOpenDropDownMenu: true });
    }
    const query = event.target.value.toLowerCase();
    const data = allSuggestions.filter((option) => option.name.toLowerCase().includes(query));
    console.log("data: ", data);
    setFilteredSuggestions(data);
    onChange && onChange(event);
  };

  // 입력 필드에 포커스가 갔을 때 처리합니다.
  const onFocus = () => {
    if (!state.isOpenDropDownMenu) {
      dispatch({ type: "SET_IS_OPEN_DROP_DOWN_MENU", isOpenDropDownMenu: true });
    }
    if (!state.focus) {
      dispatch({ type: "SET_FOCUS", focus: true });
    }
    if (value.trim() === "") {
      setFilteredSuggestions(allSuggestions);
      return;
    }
    // Ensure the input is selected when focused
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  // 입력이 포커스를 잃었을 때 상태를 재설정합니다.
  const onBlur = () => {
    if (value.trim() !== "") {
      setSelectedValue(state.prevSelectedValue.name);
    }
    if (state.focus) {
      dispatch({ type: "SET_FOCUS", focus: false });
    }
    if (state.isOpenDropDownMenu) {
      dispatch({ type: "SET_IS_OPEN_DROP_DOWN_MENU", isOpenDropDownMenu: false });
    }
  };

  // 취소 아이콘 클릭으로 입력 필드를 지웁니다.
  const handleRemoveInputValue = useCallback(() => {
    dispatch({ type: "SET_HIGHLIGHTED_INDEX", index: -1 });
    setSelectedValue("");
    dispatch({ type: "SET_PREV_SELECTED_VALUE", value: INIT_PREV_STATE_VALUE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 화살표 아이콘 클릭으로 드롭다운 메뉴를 토글합니다.
  const handleClickArrowIcon = useCallback(() => {
    if (loadState.isError) return;
    if (loadState.isLoading) return;
    dispatch({ type: "SET_IS_OPEN_DROP_DOWN_MENU", isOpenDropDownMenu: !state.isOpenDropDownMenu });
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadState.isError, loadState.isLoading, state.isOpenDropDownMenu]);

  // 드롭다운 항목 위에서 마우스를 움직일 때 강조 표시된 인덱스를 업데이트합니다.
  const handleMouseMove = useCallback(
    (index: number) => {
      if (state.usingKeyboard) {
        dispatch({ type: "SET_USING_KEYBOARD", usingKeyboard: false });
      }
      dispatch({ type: "SET_HIGHLIGHTED_INDEX", index });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.usingKeyboard]
  );

  // 마우스 클릭으로 항목을 선택합니다.
  const handleMouseDown = useCallback((name: string, value: string) => {
    setSelectedValue(name);
    dispatch({ type: "SET_PREV_SELECTED_VALUE", value: { name, optionValue: value } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="select-container">
      <div
        className={`input-box ${state.focus ? "active-focus" : ""}`}
        onMouseEnter={() => dispatch({ type: "SET_HOVER", hover: true })}
        onMouseLeave={() => dispatch({ type: "SET_HOVER", hover: false })}
        onBlur={onBlur}
        onFocus={onFocus}
        style={{ border: state.hover ? "1px solid #333" : "1px solid #e8eaee" }}
      >
        <input
          className="input-field"
          type="text"
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          placeholder={placeholderText}
          disabled={loadState.isError || loadState.isLoading}
          style={{ padding: state.prevSelectedValue.name ? "10px 70px 10px 10px" : "10px" }}
        />

        <div className="button-box">
          {state.hover && state.prevSelectedValue.name && <CloseIcon onClick={handleRemoveInputValue} />}
          <ArrowIcon isOpenDropDownMenu={state.isOpenDropDownMenu} onClick={handleClickArrowIcon} />
        </div>
      </div>
      <DropDownMenu
        filteredSuggestions={filteredSuggestions}
        state={state}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        ref={dropdownItemRefs}
      />
    </div>
  );
}
