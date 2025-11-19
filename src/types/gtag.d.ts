interface Window {
  gtag?: (
    command: 'event' | 'config' | 'set',
    targetId: string | object,
    config?: object
  ) => void;
}

