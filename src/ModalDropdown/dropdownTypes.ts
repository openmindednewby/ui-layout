/** Shared option shape for the ModalDropdown family (kept separate to avoid import cycles). */
export interface DropdownOption<T> {
  readonly label: string;
  readonly value: T;
}
