// 全局共享数据示例
import { parseRegionXlsx, parseTypesXlsx } from '@/utils/parseMapXlsx.js';
import { useEffect, useState } from 'react';

const useUser = () => {
  const [regionMap, setRegionMap] = useState(new Map());
  const [typesMap, setTypesMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([parseRegionXlsx(), parseTypesXlsx()]).then((res) => {
      setRegionMap(res[0]);
      setTypesMap(res[1]);
      setLoading(false);
    });
  }, []);

  return {
    regionMap,
    typesMap,
    loading,
  };
};

export default useUser;
