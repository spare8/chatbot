// lib/configStatusContext.js
import React from 'react';
import PropTypes from 'prop-types';

export const ConfigStatusContext = React.createContext({
  ok: true,
  missing: [],
  refresh: () => {},
});

export function ConfigStatusProvider({children}) {
  const [state, setState] = React.useState({ok: true, missing: []});

  const refresh = React.useCallback(async () => {
    try {
      const r = await fetch('/api/admin/config/status');
      const json = await r.json();
      setState({ok: !!json.ok, missing: json.missing || []});
    } catch {
      setState({ok: false, missing: []});
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ConfigStatusContext.Provider value={{...state, refresh}}>
      {children}
    </ConfigStatusContext.Provider>
  );
}

ConfigStatusProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
