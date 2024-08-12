
import { uniqBy } from 'lodash';

/**
 *
 * @param {Object} params 请求的参数一个对象 包含 types 和 region 这两个code来源于两个excel 默认值为 050000 和 411400
 * @returns {Promise<Array>} 返回包含所有查询结果的 Promise
 */
export const getValueByApi = (params) => {
  const baseUrl = "https://restapi.amap.com/v5/place/text";
  const { types, region, key } = params ?? {};
  const result = [];

  const baseRequestParams = {
    key,
    types,
    region,
    city_limit: 'true',
    show_fields: "business,children,photos",
    page_size: '25',
    page_num: 1,
  };

  const getValue = (page_num = 1) => {
    return new Promise((resolve, reject) => {
      baseRequestParams.page_num = page_num;
      const params = new URLSearchParams(baseRequestParams);
      const url = `${baseUrl}?${params.toString()}`;

      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
          }
          return response.json();
        })
        .then((data) => {
          result.push(...data.pois);
          if (data.pois.length === 25) {
            resolve(getValue(page_num + 1));
          } else {
            const allValue = uniqBy(result, 'id').filter((i) => i?.business?.tel > 0)
            resolve(allValue);
          }
        })
        .catch((error) => {
          reject("There has been a problem with your fetch operation: " + error);
        });
    });
  };

  return getValue();
};
// // 示例调用
// getValueByApi()
  // .then((data) => {
  //   console.log("All data:", data);
  // })
  // .catch((error) => {
  //   console.error(error);
  // });
