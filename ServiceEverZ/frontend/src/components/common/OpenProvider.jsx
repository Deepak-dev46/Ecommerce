  import React, { createContext, useState } from "react";

export const OpenContext = createContext();

export const OpenProvider = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <OpenContext.Provider value={{ open, setOpen }}>
      {children}
    </OpenContext.Provider>
  );
};
