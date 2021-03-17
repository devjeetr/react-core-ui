import {
  ForwardedRef,
  ChangeEventHandler,
  useRef,
  useCallback,
  ChangeEvent,
  useEffect,
  HTMLProps,
} from "react";
import { isNil } from "ramda";

export interface UseCheckboxProps {
  ref: ForwardedRef<HTMLInputElement>;
  checkedDataAttribute: string;
  focusedDataAttribute: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  name: string;
  value: string;
  checked?: boolean;
}

export const useCheckbox = ({
  ref,
  checkedDataAttribute,
  onChange,
  name,
  value,
  checked,
}: UseCheckboxProps) => {
  const containerRef = useRef<HTMLLabelElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputCallbackRef = useCallback(
    (e: HTMLInputElement | null) => {
      inputRef.current = e;
      // update user supplied ref
      if (ref) {
        if (typeof ref === "function") {
          ref(e);
        } else {
          ref.current = e; // eslint-disable-line no-param-reassign
        }
      }
    },
    [ref]
  );

  const internalOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // update data attribute on container
      if (containerRef.current) {
        if (isNil(checked)) {
          if (e.currentTarget.checked) {
            containerRef.current.setAttribute(checkedDataAttribute, "");
          } else {
            containerRef.current.removeAttribute(checkedDataAttribute);
          }
        }
      }

      if (onChange) {
        onChange(e);
      }
    },
    [checkedDataAttribute, onChange, checked]
  );

  useEffect(() => {
    // every time component renders we need to sync with the checkbox state
    // in case an external source has mutated it (for example, react-hook-form)
    if (containerRef.current && inputRef.current) {
      if (isNil(checked)) {
        if (!inputRef.current.checked) {
          containerRef.current.removeAttribute(checkedDataAttribute);
        }
      } else if (checked) {
        containerRef.current.setAttribute(checkedDataAttribute, "");
      } else {
        containerRef.current.removeAttribute(checkedDataAttribute);
      }
    }
  });

  const getInputProps = useCallback(
    (props?: Record<string, HTMLProps<HTMLInputElement>>) => ({
      ref: inputCallbackRef,
      type: "checkbox",
      name,
      value,
      checked,
      onChange: internalOnChange,
      onFocus: () => {
        containerRef.current?.setAttribute("data-focused", "");
      },
      onBlur: () => {
        containerRef.current?.removeAttribute("data-focused");
      },
      ...props,
    }),
    [name, value, checked, inputCallbackRef, internalOnChange]
  );

  const getLabelProps = useCallback(
    <T extends HTMLElement>(props?: Record<string, HTMLProps<T>>) => ({
      ref: containerRef,
      name,
      ...props,
    }),
    [name]
  );
  return { getInputProps, getLabelProps };
};
