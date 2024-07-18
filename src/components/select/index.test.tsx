import { act } from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Select from "./index";
import countries from "../../constants/countries.json";

const mockedDispatch = jest.fn();

let mockedState = {
  isOpenDropDownMenu: false,
  usingKeyboard: false,
  highlightedIndex: -1,
  hover: false,
  focus: false,
  layoutUpdated: false,
  prevSelectedValue: { name: "", optionValue: "" },
};

jest.mock("../../hooks/useSelectState", () => ({
  useSelectState: () => ({
    state: mockedState,
    dispatch: mockedDispatch,
  }),
}));

const mockOptions = countries;
const setSelectedValue = jest.fn();
const onChange = jest.fn();

describe("Select 컴포넌트 테스트", () => {
  beforeEach(() => {
    mockedDispatch.mockClear();
  });

  describe("기본 동작 테스트", () => {
    it("초기에는 플레이스홀더 텍스트로 렌더링 됩니다", () => {
      render(<Select options={mockOptions} value="" onChange={onChange} setSelectedValue={setSelectedValue} />);
      expect(screen.getByPlaceholderText("선택")).toBeInTheDocument();
    });

    it("입력 필드를 클릭하면 드롭다운 컴포넌트가 렌더링됩니다", async () => {
      render(<Select options={mockOptions} value="" onChange={onChange} setSelectedValue={jest.fn()} />);
      const input = screen.getByPlaceholderText("선택");
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText("Afghanistan")).toBeInTheDocument();
      });
    });

    it("클릭으로 옵션을 선택합니다", async () => {
      render(<Select options={mockOptions} value="" setSelectedValue={setSelectedValue} onChange={onChange} />);
      const input = screen.getByPlaceholderText("선택");
      fireEvent.click(input);

      const option1 = await screen.findByText("Afghanistan");
      fireEvent.mouseDown(option1);

      expect(setSelectedValue).toHaveBeenCalledWith("Afghanistan");
    });

    it("클릭 될 때 전체 텍스트가 선택되고 Backspace 키를 눌렀을 때 selectedValue 값이 빈 문자열로 변경됩니다.", async () => {
      const setSelectedValue = jest.fn();
      let selectedValue = "Afghanistan";
      const { rerender } = render(<Select options={mockOptions} onChange={onChange} value={selectedValue} setSelectedValue={setSelectedValue} />);
      const input = screen.getByPlaceholderText("선택");

      fireEvent.click(input);
      mockedState.isOpenDropDownMenu = true;

      await waitFor(() => {
        expect((input as HTMLInputElement).selectionEnd).toBe(selectedValue.length);
      });

      await waitFor(() => {
        expect(mockedState.isOpenDropDownMenu).toBe(true);
      });

      fireEvent.keyDown(input, { key: "Backspace" });
      act(() => {
        selectedValue = "";
      });

      rerender(<Select options={mockOptions} value={selectedValue} setSelectedValue={setSelectedValue} onChange={onChange} />);

      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe("");
      });
    });
  });

  describe("키보드 네비게이션 테스트", () => {
    const simulateKeyDown = (element: HTMLElement, key: string, highlightedIndex: number) => {
      fireEvent.keyDown(element, { key });
      act(() => {
        mockedState.highlightedIndex = highlightedIndex;
      });
    };

    it("키보드 Down 및 Enter선택", async () => {
      const setSelectedValue = jest.fn();
      let selectedValue = "";
      const { rerender } = render(<Select options={mockOptions} value={selectedValue} setSelectedValue={setSelectedValue} onChange={onChange} />);
      const input = screen.getByPlaceholderText("선택");

      fireEvent.click(input); // 드롭다운 열기
      act(() => {
        mockedState.isOpenDropDownMenu = true;
      });

      simulateKeyDown(input, "ArrowDown", 0);

      fireEvent.keyDown(input, { key: "Enter" });

      act(() => {
        selectedValue = mockOptions[mockedState.highlightedIndex].name;
        setSelectedValue(selectedValue);
        mockedState.isOpenDropDownMenu = false; // 드롭다운 메뉴를 닫음
      });

      rerender(<Select options={mockOptions} value={selectedValue} setSelectedValue={setSelectedValue} onChange={onChange} />);

      await waitFor(() => {
        expect(setSelectedValue).toHaveBeenCalledWith("Afghanistan");
      });

      await waitFor(() => {
        expect(mockedState.isOpenDropDownMenu).toBe(false); // 드롭다운 메뉴가 닫혔는지 확인
      });

      rerender(<Select options={mockOptions} value={selectedValue} setSelectedValue={setSelectedValue} onChange={onChange} />);

      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe("Afghanistan"); // input에 선택된 값이 표시되는지 확인
      });
    });

    it("키보드 Up 키를 누르면 마지막 옵션이 하이라이트 됩니다", async () => {
      render(<Select options={mockOptions} value="" setSelectedValue={setSelectedValue} onChange={onChange} />);
      const input = screen.getByPlaceholderText("선택");

      fireEvent.click(input);
      act(() => {
        mockedState.isOpenDropDownMenu = true;
      });

      // 키보드 Up 키를 누릅니다.
      simulateKeyDown(input, "ArrowUp", mockOptions.length - 1);

      await waitFor(() => {
        expect(mockedState.highlightedIndex).toBe(mockOptions.length - 1);
      });
    });
  });

  describe("icon 테스트", () => {
    it("에로우 아이콘 클릭 시 드롭다운 메뉴가 렌더링됩니다", async () => {
      render(<Select options={mockOptions} value="" setSelectedValue={jest.fn()} onChange={onChange} />);

      const arrowIcon = screen.getByTestId("arrow");
      expect(arrowIcon).toBeInTheDocument();

      fireEvent.click(arrowIcon);

      await waitFor(() => {
        expect(screen.getByText("Afghanistan")).toBeInTheDocument();
      });
    });

    it("초기상태 CloseIcon이 렌더링되지 않습니다", () => {
      render(<Select options={mockOptions} value="" setSelectedValue={setSelectedValue} onChange={onChange} />);
      expect(screen.queryByTestId("close")).toBeNull();
    });

    it("이전 선택값이 존재하고 hover 상태일 때 CloseIcon이 렌더링됩니다", async () => {
      const setSelectedValue = jest.fn();

      const { rerender } = render(<Select options={mockOptions} value="Afghanistan" setSelectedValue={setSelectedValue} onChange={onChange} />);

      const input = screen.getByPlaceholderText("선택");
      fireEvent.mouseEnter(input);

      act(() => {
        mockedState.hover = true;
        mockedState.prevSelectedValue.name = "Afghanistan";
        mockedState.prevSelectedValue.optionValue = "1";
      });

      expect(mockedState.hover).toBe(true);

      rerender(<Select options={mockOptions} value="Afghanistan" setSelectedValue={setSelectedValue} onChange={onChange} />);

      const closeIcon = screen.getByTestId("close");
      expect(closeIcon).toBeInTheDocument();
    });

    it("이전 선택값이 존재하지 않으면 CloseIcon이 렌더링되지 않습니다", () => {
      const setSelectedValue = jest.fn();
      const { rerender } = render(<Select options={mockOptions} value="Afghanistan" setSelectedValue={setSelectedValue} onChange={onChange} />);
      act(() => {
        mockedState.hover = true;
        mockedState.prevSelectedValue.name = "";
      });
      rerender(<Select options={mockOptions} value="Afghanistan" setSelectedValue={setSelectedValue} onChange={onChange} />);

      expect(mockedState.prevSelectedValue.name).toBe("");

      expect(screen.queryByTestId("close")).toBeNull();
    });

    it("hover 상태가 아니면 CloseIcon이 렌더링되지 않습니다", () => {
      const setSelectedValue = jest.fn();
      const { rerender } = render(<Select options={mockOptions} value="Afghanistan" setSelectedValue={setSelectedValue} onChange={onChange} />);
      act(() => {
        mockedState.hover = false;
        mockedState.prevSelectedValue.name = "Afghanistan";
      });
      rerender(<Select options={mockOptions} value="Afghanistan" setSelectedValue={setSelectedValue} onChange={onChange} />);

      expect(mockedState.prevSelectedValue.name).toBe("Afghanistan");

      expect(screen.queryByTestId("close")).toBeNull();
    });

    it("CloseIcon을 클릭하면 handleRemoveInputValue 함수가 호출됩니다", async () => {
      const setSelectedValue = jest.fn();

      const { rerender } = render(<Select options={mockOptions} value="Afghanistan" setSelectedValue={setSelectedValue} onChange={onChange} />);

      const input = screen.getByPlaceholderText("선택");
      fireEvent.mouseEnter(input); // hover 상태로 설정

      act(() => {
        mockedState.hover = true;
        mockedState.prevSelectedValue = { name: "Afghanistan", optionValue: "1" };
      });

      fireEvent.mouseLeave(input);

      await waitFor(() => {
        expect(screen.queryByTestId("close")).toBeNull();
      });

      fireEvent.mouseEnter(input);

      rerender(<Select options={mockOptions} value="Afghanistan" setSelectedValue={setSelectedValue} onChange={onChange} />);

      await waitFor(() => {
        expect(screen.getByTestId("close")).toBeInTheDocument();
      });

      const closeIcon = screen.getByTestId("close");
      fireEvent.click(closeIcon);

      expect(setSelectedValue).toHaveBeenCalledWith("");
    });
  });
});

describe("DropDownMenu 컴포넌트 테스트", () => {
  it("마우스 호버 시 배경이 변경됩니다", async () => {
    render(<Select options={mockOptions} value="" setSelectedValue={setSelectedValue} onChange={onChange} />);
    const input = screen.getByPlaceholderText("선택");

    fireEvent.click(input);
    act(() => {
      mockedState.isOpenDropDownMenu = true;
    });

    const option1 = await screen.findByText("Afghanistan");

    fireEvent.mouseOver(option1);

    await waitFor(() => {
      expect(option1).toHaveClass("active-hovered");
    });
  });

  it("이전에 선택된 옵션은 파란색으로 표시됩니다", async () => {
    const setSelectedValue = jest.fn();
    let selectedValue = "Afghanistan";

    render(<Select options={mockOptions} value={selectedValue} setSelectedValue={setSelectedValue} onChange={onChange} />);
    const input = screen.getByPlaceholderText("선택");

    fireEvent.click(input);
    mockedState.isOpenDropDownMenu = true;

    const option1 = await screen.findByText("Afghanistan");
    fireEvent.mouseDown(option1);

    mockedState.prevSelectedValue.name = "Afghanistan";
    mockedState.prevSelectedValue.optionValue = "AF";
    mockedState.isOpenDropDownMenu = false;

    render(<Select options={mockOptions} value={selectedValue} setSelectedValue={setSelectedValue} onChange={onChange} />);

    fireEvent.click(input);
    mockedState.isOpenDropDownMenu = true;

    const optionElement = screen.getByRole("listitem", { name: "Afghanistan" });
    const optionClassName = optionElement.className;

    expect(optionClassName.includes("active-hovered")).toBe(true);
  });

  it("입력 필드에서 the를 입력하면 대소문자를 구분하지않고 THE를 포함한 옵션이 드롭다운에서 보이는지 확인합니다", async () => {
    const setSelectedValue = jest.fn();
    let selectedValue = "";

    render(<Select options={mockOptions} value={selectedValue} setSelectedValue={setSelectedValue} onChange={onChange} />);
    const input = screen.getByPlaceholderText("선택");

    fireEvent.click(input);
    mockedState.isOpenDropDownMenu = true;

    fireEvent.change(input, { target: { value: "the" } });

    const regex = new RegExp("the", "i");
    const options = screen.getAllByRole("listitem");

    options.forEach((option) => {
      const optionText = option.textContent || "";
      expect(regex.test(optionText)).toBe(true);
    });
  });
});
