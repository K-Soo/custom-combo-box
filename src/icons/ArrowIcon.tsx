import "./icon.css";

interface ArrowIconProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isOpenDropDownMenu: boolean;
}

export default function ArrowIcon({ onClick, isOpenDropDownMenu }: ArrowIconProps) {
  return (
    <button
      className={`icon ${isOpenDropDownMenu ? "active" : ""}`}
      onClick={onClick}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      data-testid="arrow"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7 10l5 5 5-5z"></path>
      </svg>
    </button>
  );
}
