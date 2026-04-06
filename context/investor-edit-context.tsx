"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface InvestorEditContextValue {
  onSave?: () => void;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  setSaveHandler: (fn: () => void) => void;
}

const InvestorEditContext = createContext<InvestorEditContextValue>({
  isSaving: false,
  setIsSaving: () => {},
  setSaveHandler: () => {},
});

export const useInvestorEdit = () => useContext(InvestorEditContext);

export function InvestorEditProvider({ children }: { children: React.ReactNode }) {
  const [saveHandler, setSaveHandlerState] = useState<(() => void) | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const setSaveHandler = useCallback((fn: () => void) => {
    setSaveHandlerState(() => fn);
  }, []);

  return (
    <InvestorEditContext.Provider value={{ onSave: saveHandler, isSaving, setIsSaving, setSaveHandler }}>
      {children}
    </InvestorEditContext.Provider>
  );
}
