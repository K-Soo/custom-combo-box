interface CloseIconProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function CloseIcon({ onClick }: CloseIconProps) {
  return (
    <button
      className="icon"
      data-testid="close"
      onClick={onClick}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <svg viewBox="0 0 24 24">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
      </svg>
    </button>
  );
}
