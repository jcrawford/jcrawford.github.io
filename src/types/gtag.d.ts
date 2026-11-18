type GtagEventParams = Record<string, unknown>;

interface Window {
  gtag?: (
    command: 'event' | 'config' | 'set',
    targetId: string | object,
    config?: GtagEventParams
  ) => void;
}
