import Fuse from "fuse.js";
import { useCallback, useMemo, useReducer } from "react";
import { createKeyboardEventHandler } from "../shared/event-handlers";
import { circularClamp } from "../shared/functional";
import { defaultSelectReducer, SelectAction, SelectActions } from "./reducer";

export const useSearch = <V>(
  items: readonly V[],
  opts?: Fuse.IFuseOptions<V>
): Fuse<V> => useMemo(() => new Fuse(items, opts), [items, opts]);

export type GetItemProps = (
  i: number
) => {
  highlighted: boolean;
  selected?: boolean;
  onMouseEnter: React.MouseEventHandler;
  onClick: React.MouseEventHandler;
};

export type OnSelectHandler<T> = (
  item: T,
  dispatch: React.Dispatch<SelectAction>,
  defaultActions: () => void
) => void;

export interface UseSearchableSelectOpts<T> {
  onSelect?: OnSelectHandler<T>;
  selected?: T;
}

/**
 * The base useSelect hook
 *
 * @param {Array<T>} items list of items to use
 * @param {(item: T) => string} getItemText an accessor that gets the text content of an item.
 *                                          This is the text to be searched.
 * @param {(
 *     item: T,
 *     dispatch: React.Dispatch<SelectAction>,
 *     defaultActions: () => void
 *   ) => void} [onSelect] A callback that is called when an item is selected.
 * @returns {*}
 */
export const useSearchableSelect = <T>(
  items: Array<T>,
  getItemText: (item: T) => string,
  { onSelect, selected }: UseSearchableSelectOpts<T>
) => {
  const [state, dispatch] = useReducer(
    defaultSelectReducer,
    {
      isOpen: false,
      highlighted: 0,
      currentInput: "",
      items,
    },
    (arg) => ({ ...arg, filtered_indices: items.map((_, i) => i) })
  );

  const itemsText = useMemo(() => items.map(getItemText), [items, getItemText]);
  const fuse = useSearch(itemsText, {});
  const currentItems = useMemo(
    () =>
      state.filtered_indices
        ? state.filtered_indices.map((index) => items[index])
        : items,
    [items, state]
  );

  const getInputProps = useCallback(
    () => ({
      autoFocus: true,
      onClick: (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        dispatch(SelectActions.reset_on_select({ nItems: items.length }));
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const filtered =
          e.target.value !== ""
            ? fuse.search(e.target.value).map((r) => r.refIndex)
            : items.map((_, i) => i);

        // check if highlighted contains it or not here;
        if (
          filtered.indexOf(state.filtered_indices[state.highlighted]) === -1
        ) {
          dispatch(SelectActions.highlight_item({ index: 0 }));
        } else {
          dispatch(
            SelectActions.highlight_item({
              index: filtered.indexOf(
                state.filtered_indices[state.highlighted]
              ),
            })
          );
        }

        dispatch(SelectActions.update_filtered_indices({ indices: filtered }));
        dispatch(SelectActions.update_input({ text: e.target.value }));
      },
      value: state.currentInput,
      onKeyDown: createKeyboardEventHandler({
        Enter(e) {
          e.preventDefault();
          const defaultHandler = () =>
            dispatch(SelectActions.reset_on_select({ nItems: items.length }));

          if (onSelect) {
            onSelect(
              items[state.filtered_indices[state.highlighted]],
              dispatch,
              defaultHandler
            );
          } else {
            defaultHandler();
          }
        },
        ArrowUp(e) {
          e.preventDefault();
          dispatch(
            SelectActions.highlight_item({
              index: circularClamp(state.highlighted - 1, [
                0,
                currentItems.length - 1,
              ]),
            })
          );
        },
        ArrowDown(e) {
          e.preventDefault();
          dispatch(
            SelectActions.highlight_item({
              index: circularClamp(state.highlighted + 1, [
                0,
                currentItems.length - 1,
              ]),
            })
          );
        },
        Escape(e) {
          e.preventDefault();
          dispatch(SelectActions.reset_on_select({ nItems: items.length }));
        },
      }),
    }),
    [fuse, currentItems, state, items, onSelect]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      selected: currentItems[index] === selected,
      highlighted: index === state.highlighted,
      onMouseEnter: () => {
        dispatch(SelectActions.highlight_item({ index }));
      },
      onClick: () => {
        const defaultHandler = () => {
          dispatch(SelectActions.reset_on_select({ nItems: items.length }));
        };
        if (onSelect) {
          onSelect(
            items[state.filtered_indices[index]],
            dispatch,
            defaultHandler
          );
        } else {
          defaultHandler();
        }
      },
    }),
    [state, items, onSelect, currentItems, selected]
  );

  const open = useCallback(() => dispatch(SelectActions.open()), []);
  const close = useCallback(() => dispatch(SelectActions.close()), []);
  const toggle = useCallback(() => dispatch(SelectActions.toggle()), []);

  return {
    getItemProps,
    getInputProps,
    currentItems,
    state,
    open,
    close,
    toggle,
  };
};
