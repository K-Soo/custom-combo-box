import { useState, useEffect } from "react";
import { Options } from "../types";

interface FetchOptionsResult {
  loadState: { isLoading: boolean; isError: boolean };
  filteredSuggestions: Options;
  allSuggestions: Options;
  setFilteredSuggestions: React.Dispatch<React.SetStateAction<Options>>;
  placeholderText: string;
}

function useFetchOptions(options: Options | (() => Promise<Options>), dispatch: React.Dispatch<any>): FetchOptionsResult {
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

  return { loadState, filteredSuggestions, allSuggestions, setFilteredSuggestions, placeholderText };
}

export default useFetchOptions;
