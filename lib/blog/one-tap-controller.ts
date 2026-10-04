export type GoogleOneTapIdentity = {
  initialize(options: {
    client_id: string; auto_select: boolean; use_fedcm_for_prompt: boolean;
    cancel_on_tap_outside: boolean; context: string;
    callback: (response: { credential: string }) => Promise<void>;
  }): void;
  prompt(): void;
  cancel(): void;
};

/** The credential handler belongs to the SDK lifetime, not a session refresh. */
export function createOneTapController(google: GoogleOneTapIdentity, clientId: string, actions: {
  exchange: (credential: string) => Promise<unknown>;
  start: () => (() => void) | null;
  success: () => void;
  error: (error: unknown) => void;
}) {
  let disposed = false, busy = false, attempted = false, enabled = false, prompted = false;
  google.initialize({
    client_id: clientId, auto_select: false, use_fedcm_for_prompt: true,
    cancel_on_tap_outside: true, context: "signin",
    callback: async ({ credential }) => {
      if (disposed || busy) return;
      const finish = actions.start();
      if (!finish) return;
      busy = true;
      try {
        await actions.exchange(credential);
        if (!disposed) { google.cancel(); prompted = false; actions.success(); }
      } catch (error) {
        if (!disposed) actions.error(error);
      } finally { busy = false; finish(); }
    },
  });
  function update(nextEnabled: boolean) {
    enabled = nextEnabled;
    if (disposed || busy) return;
    if (!enabled) {
      if (prompted) { google.cancel(); prompted = false; }
      return;
    }
    if (!attempted) { attempted = true; prompted = true; google.prompt(); }
  }
  return {
    update,
    retry() { if (disposed || busy) return; attempted = false; update(enabled); },
    dispose() { disposed = true; google.cancel(); },
  };
}
