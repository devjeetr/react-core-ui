import * as R from "ramda";
import { Reducer } from "react";
import { ofType, unionize, UnionOf } from "unionize";

export interface SelectState {
  highlighted: number;
  currentInput: string;
  isOpen: boolean;
  filtered_indices: number[];
}

export const SelectActions = unionize({
  update_filtered_indices: ofType<{ indices: number[] }>(),
  update_input: ofType<{ text: string }>(),
  highlight_item: ofType<{ index: number }>(),
  close: {},
  open: {},
  toggle: {},
  reset_on_select: ofType<{ nItems: number }>(),
});

export type SelectAction = UnionOf<typeof SelectActions>;

export const defaultSelectReducer: Reducer<SelectState, SelectAction> = (
  state,
  a
): SelectState =>
  SelectActions.match(a, {
    update_filtered_indices: ({ indices }) => ({
      ...state,
      filtered_indices: indices,
    }),
    highlight_item: ({ index }) => ({ ...state, highlighted: index }),
    update_input: ({ text }) => ({ ...state, currentInput: text }),
    close: ({}) => ({ ...state, isOpen: false }), // eslint-disable-line no-empty-pattern
    open: ({}) => ({ ...state, isOpen: true }), // eslint-disable-line no-empty-pattern
    toggle: () => ({ ...state, isOpen: !state.isOpen }),
    reset_on_select: ({ nItems }) => ({
      ...state,
      isOpen: false,
      currentInput: "",
      filtered_indices: R.range(0, nItems),
    }),
  });
