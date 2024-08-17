import * as XLSX from 'xlsx';
// 将数组切换成map, map的key是传入的对象keyd的value值
// 即 [{a: 'ab'}] => {'ab': {a: 'ab'}} 
const arrayToMap = (array, mapKey) => {
  if(array.length <= 0) {
    return new Map();
  }
  const resultMap = new Map();
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if(typeof element !== 'object') {
      console.error(`处理第${index + 1}条数据异常, 当前值为${element}`)
      continue;
    }
    if(!Object.keys(element).includes(mapKey)) {
      console.error(`处理第${index + 1}条数据异常, 当前对象没有指定的key 他有的key为${Object.keys(element).join('、')}`)
      continue;
    }
    resultMap.set(element[mapKey], element);
  }
  return resultMap;
}

export const parseRegionXlsx = async () => {
  const response = await fetch('/assets/高德地址.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
    type: 'array',
  });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return arrayToMap(jsonData, 'adcode');
};

export const parseTypesXlsx = async () => {
  const response = await fetch('/assets/高德POI.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
    type: 'array',
  });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return arrayToMap(jsonData, 'NEW_TYPE');
};
