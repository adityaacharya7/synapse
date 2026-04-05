import React, { createContext, useContext } from 'react';

export const ThemeContext = createContext({ 
  isDark: false, 
  toggleTheme: () => { } 
});

export const useTheme = () => useContext(ThemeContext);
