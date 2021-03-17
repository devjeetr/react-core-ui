export type KeyEventHandlerMap<T> = {
  [k: string]: React.KeyboardEventHandler<T>;
};

export const createKeyboardEventHandler = <T>(
  handlerMap: KeyEventHandlerMap<T>
) => (e: React.KeyboardEvent<T>): void => {
  if (handlerMap[e.key]) {
    handlerMap[e.key](e);
  }
};
