import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data-fetching hook.
 * Automatically fires on mount (or when `url` changes) unless `manual` is true.
 *
 * @param {string}  url
 * @param {Object}  [options]         - fetch() init options
 * @param {boolean} [options.manual]  - skip automatic fetch; call `refetch()` manually
 */
const useFetch = (url, options = {}) => {
  const { manual = false, ...fetchOptions } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState(null);

  const execute = useCallback(async (overrideUrl, overrideOptions) => {
    const target = overrideUrl || url;
    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(target, { ...fetchOptions, ...overrideOptions });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
      return json;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!manual) execute();
  }, [manual, execute]);

  return { data, loading, error, refetch: execute };
};

export default useFetch;
