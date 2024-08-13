import { cloneDeep } from 'lodash';
import * as XLSX from 'xlsx';

// 一级妇联的固定排序
const levelOneSort = [
  '济南',
  '济宁',
  '泰安',
  '临沂',
  '菏泽',
  '淄博',
  '聊城',
  '德州',
  '枣庄',
  '滨州',
  '日照',
  '潍坊',
  '烟台',
  '青岛',
  '威海',
];

// 带着捐赠金额的一级妇联的排序
const levelOneWithMoney = [
  '济南市妇联\t2012678.45',
  '济宁市妇联\t1644867.91',
  '泰安市妇联\t1352336.4',
  '临沂市妇联\t1166814.87',
  '菏泽市妇联\t1023021.6',
  '淄博市妇联\t872514.29',
  '聊城市妇联\t776739.81',
  '德州市妇联\t514437.04',
  '枣庄市妇联\t473762.5',
  '滨州市妇联\t307462.79',
  '日照市妇联\t197854.91',
  '潍坊市妇联\t172274.14',
  '烟台市妇联\t160697.15',
  '青岛市妇联\t147310.03',
  '威海市妇联\t78778.97',
].map((i) => i.split('\t'));

// 非妇联结尾，但是要放入区县级妇联的名称
const specialNames = ['泰安市泰山景区妇委会'];

// 从6000元中筛选出 区县 及 其他，
// 注意要根据map去重，同时将新进入表格的数据也设置进入map。便于处理优秀组织表格时使用
const getLevelByMoneyData = (moneyFileData, allNameMap) => {
  // 深拷贝个Map，用来处理数据
  const currentUseMap = cloneDeep(allNameMap);
  // 区县级妇联
  const countyLevelResult = [];
  // 社会组织
  const otherLevelResult = [];

  for (let index = 0; index < moneyFileData.length; index++) {
    const element = moneyFileData[index];
    const isHas = currentUseMap.get(element[1]);
    if (isHas) {
      console.log('当前在处理6000元的表格时，数据重复了', element[1]);
    } else {
      currentUseMap.set(element[1], element);
      if (/妇联$/.test(element[1]) || specialNames.includes(element[1])) {
        countyLevelResult.push([
          element[1],
          element[2],
          `${'附件1'}-id:${element[0]}`,
        ]);
      } else {
        otherLevelResult.push([
          element[1],
          element[2],
          `${'附件1'}-id:${element[0]}`,
        ]);
      }
    }
  }
  return {
    allNameMap: currentUseMap,
    countyLevelResult,
    otherLevelResult,
  };
};

// 优秀组织中，处理每一个城市，分sheet搞
const handleOneCity = (data, sheetsName, allNameMap) => {
  // 深拷贝个Map，用来处理数据
  const currentUseMap = cloneDeep(allNameMap);
  // 区县级妇联
  const countyLevelResult = [];
  // 社会组织
  const otherLevelResult = [];
  let isUseCurrentData = false;
  if (!data) {
    console.log('当前在处理优秀组织的表格时，这个表无法支持', sheetsName);
    return;
  }
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    if(isUseCurrentData) {
      const name = element[3];
      const isHas = currentUseMap.get(name);
      if(!name) {
        continue;
      }
      if (isHas) {
        console.log('当前在处理优秀组织的表格时，数据重复了', name);
      } else {
        currentUseMap.set(name);
        if (/妇联$/.test(name) || specialNames.includes(name)) {
          countyLevelResult.push([name, '', `${'优秀组织'}-${sheetsName}`]);
        } else {
          otherLevelResult.push([name, '', `${'优秀组织'}-${sheetsName}`]);
        }
      }
    }
    if(element.includes('名称')) {
      isUseCurrentData = true
    }
    if(data[index + 1] && data[index + 1].join('').includes('填表人')) {
      isUseCurrentData = false
    }
  }
  return {
    allNameMap: currentUseMap,
    countyLevelResult,
    otherLevelResult,
  };

}
// 从优秀组织中筛选出 区县 及 其他， 注意要根据map去重
// 注意要根据map去重，同时将新进入表格的数据也设置进入map。最终需要查看长度。来看数据总量
const getLevelByOrgData = (orgSheetsMap, allNameMap) => {
  // 深拷贝个Map，用来处理数据
  let currentUseMap = cloneDeep(allNameMap);
  // 区县级妇联
  const countyLevelResult = [];
  // 社会组织
  const otherLevelResult = [];

  // 表格中有个省级，所以在处理的时候，要加进去。
  const addProv = ['省级', ...levelOneSort];
  for (let index = 0; index < addProv.length; index++) {
    const element = addProv[index];
    const currentCity = orgSheetsMap.get(element);
    handleOneCity(currentCity, element, currentUseMap);
    const oneOrgDataResult = handleOneCity(currentCity, element, currentUseMap);
    currentUseMap = new Map([...currentUseMap, ...oneOrgDataResult.allNameMap]);
    countyLevelResult.push(...oneOrgDataResult.countyLevelResult);
    otherLevelResult.push(...oneOrgDataResult.otherLevelResult);
  }

  return {
    allNameMap: currentUseMap,
    countyLevelResult,
    otherLevelResult,
  };
};

export const handleWorkBooks = (moneyWk, orgWk) => {
  // 处理捐款超过6000元的，变成二维数组
  const moneyFileSheet = moneyWk.Sheets[moneyWk.SheetNames[0]];
  const moneyFileData = XLSX.utils
    .sheet_to_json(moneyFileSheet, { header: 1 })
    .splice(2)
    .filter((x) => x.length !== 0)
    .sort((a, b) => b[2] - a[2]);
  console.log(moneyFileData);

  // 处理优秀组织，多个表，分批处理
  // key 为sheetName， Value 为 对应的二维数组
  const orgSheetsMap = new Map();
  for (let index = 0; index < orgWk.SheetNames.length; index++) {
    const sheetName = orgWk.SheetNames[index];
    const orgFileSheet = orgWk.Sheets[sheetName];
    const moneyFileData = XLSX.utils.sheet_to_json(orgFileSheet, { header: 1 });
    orgSheetsMap.set(sheetName, moneyFileData);
  }

  // 以name为单位，将市妇联及捐款超过6000元的名称 存到map里面
  // 后续处理优秀组织的时候，便于去重
  let allNameMap = new Map();

  // 市级妇联信息 放入一级表格
  const cityLevelResult = levelOneWithMoney;

  // 市级别的使用后，放入map中，后续处理区县和组织的时候用
  for (let index = 0; index < levelOneSort.length; index++) {
    const element = levelOneSort[index];
    allNameMap.set(`${element}市妇联`, `${element}市妇联`);
  }

  // 区县级妇联
  const countyLevelResult = [];

  // 社会组织
  const otherLevelResult = [];

  const moneyDataResult = getLevelByMoneyData(moneyFileData, allNameMap);

  allNameMap = new Map([...allNameMap, ...moneyDataResult.allNameMap]);
  countyLevelResult.push(...moneyDataResult.countyLevelResult);
  otherLevelResult.push(...moneyDataResult.otherLevelResult);

  console.log(
    `处理完6000元的表格后, 市的数量:${cityLevelResult.length}, 区县级的数量:${countyLevelResult.length}, 优秀组织的数量:${otherLevelResult.length}`
  );

  const orgDataResult = getLevelByOrgData(orgSheetsMap, allNameMap);

  allNameMap = new Map([...allNameMap, ...orgDataResult.allNameMap]);
  countyLevelResult.push(...orgDataResult.countyLevelResult);
  otherLevelResult.push(...orgDataResult.otherLevelResult);

  console.log(
    `处理完优秀组织的表格后, 市的数量:${cityLevelResult.length}, 区县级的数量:${countyLevelResult.length}, 优秀组织的数量:${otherLevelResult.length}, 总数量:${allNameMap.size}`
  );
  return {
    cityLevelResult,
    countyLevelResult,
    otherLevelResult
  }
};

// 分组 比如传入2，那么就会变成两列
export const groupData = (data, groupSize) => {
  // 创建一个新的数组来存放分组后的数据
  const groupedData = [];

  // 遍历原始数据
  for (let i = 0; i < data.length; i += groupSize) {
    // 使用slice方法将数据按groupSize分组，并只取每个子数组的第一个元素
    const group = data.slice(i, i + groupSize).map(item => item[0]);
    // 将分组后的数据添加到新的数组中
    groupedData.push(group);
  }

  return groupedData;
}

export const groupDataAddMoney = (data, groupSize) => {
  // 创建一个新的数组来存放分组后的数据
  const groupedData = [];

  for (let i = 0; i < data.length; i += groupSize) {
    const group = [];
    for (let j = 0; j < groupSize; j++) {
      if (data[i + j]) {
        group.push(data[i + j][0]);  // 添加第一个元素（名称）
        group.push(data[i + j][1]);  // 添加第二个元素（金额）
      }
    }
    groupedData.push(group);
  }

  return groupedData;
}