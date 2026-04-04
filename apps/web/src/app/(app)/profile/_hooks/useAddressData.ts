import { useState, useEffect } from 'react';

export function useAddressData(province: string) {
  const [provincesData, setProvincesData] = useState<any[]>([]);
  const [districtsData, setDistrictsData] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://esgoo.net/api-tinhthanh-new/1/0.htm')
      .then((res) => res.json())
      .then((data) => {
        if (data.error === 0) setProvincesData(data.data);
      })
      .catch((err) => console.error('Failed to load provinces DB', err));
  }, []);

  useEffect(() => {
    if (province && provincesData.length > 0) {
      const p = provincesData.find((x: any) => x.full_name === province || x.name === province);
      if (p) {
        fetch(`https://esgoo.net/api-tinhthanh-new/2/${p.id}.htm`)
          .then((res) => res.json())
          .then((data) => {
            if (data.error === 0) setDistrictsData(data.data);
          });
      } else {
        setDistrictsData([]);
      }
    } else {
      setDistrictsData([]);
    }
  }, [province, provincesData]);

  return { provincesData, districtsData };
}
