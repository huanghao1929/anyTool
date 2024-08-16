import {
  PageContainer,
  ProCard,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { groupData, groupDataAddMoney, handleCitySliceMap, handleWorkBooks } from './handle';

const parseUpload: React.FC = () => {
  // 捐赠金额大于6000的表
  const [moneyFileStatus, setMoneyFileStatus] = useState(false);
  const [moneyFileData, setMoneyFileData] = useState<any>();
  // 优秀组织的表
  const [orgFileStatus, setOrgFileStatus] = useState(false);
  const [orgFileData, setOrgFileData] = useState<any>();

  // 处理后的数据表, 分为三个数组
  const [exportData, setExportData] = useState<any>();

  const [messageApi, contextHolder] = message.useMessage();

  const downloadXlsx = () => {
    if (!exportData) {
      messageApi.warning('请先上传文件');
      return;
    }
    const { cityLevelResult, countyLevelResult, otherLevelResult } = exportData;
    // 创建新的工作薄，但是注意，没有工作表
    const newWorkbook = XLSX.utils.book_new();
    // aoa_to_sheet 是将二维数组改成sheets，所以没有样式及合并单元格的内容
    const cityLevelWorkSheet = XLSX.utils.aoa_to_sheet(cityLevelResult);
    XLSX.utils.book_append_sheet(newWorkbook, cityLevelWorkSheet, '市级排行');
    const countyLevelWorkSheet = XLSX.utils.aoa_to_sheet(countyLevelResult);
    XLSX.utils.book_append_sheet(newWorkbook, countyLevelWorkSheet, '区县级排行');
    const otherLevelWorkSheet = XLSX.utils.aoa_to_sheet(otherLevelResult);
    XLSX.utils.book_append_sheet(newWorkbook, otherLevelWorkSheet, '其他级排行');

    const groupCityLevelWorkSheet = XLSX.utils.aoa_to_sheet(groupData(cityLevelResult, 2));
    XLSX.utils.book_append_sheet(newWorkbook, groupCityLevelWorkSheet, '市级格式化排行');
    const groupCountyLevelWorkSheet = XLSX.utils.aoa_to_sheet(groupData(countyLevelResult, 2));
    XLSX.utils.book_append_sheet(newWorkbook, groupCountyLevelWorkSheet, '区县级格式化排行');
    const groupCOtherLevelWorkSheet = XLSX.utils.aoa_to_sheet(groupData(otherLevelResult, 2));
    XLSX.utils.book_append_sheet(newWorkbook, groupCOtherLevelWorkSheet, '其他级格式化排行');

    const groupAddMoneyCityLevelWorkSheet = XLSX.utils.aoa_to_sheet(groupDataAddMoney(cityLevelResult, 2));
    XLSX.utils.book_append_sheet(newWorkbook, groupAddMoneyCityLevelWorkSheet, '市级格式化排行依据');
    const groupAddMoneyCountyLevelWorkSheet = XLSX.utils.aoa_to_sheet(groupDataAddMoney(countyLevelResult, 2));
    XLSX.utils.book_append_sheet(newWorkbook, groupAddMoneyCountyLevelWorkSheet, '区县级格式化排行依据');
    const groupAddMoneyCOtherLevelWorkSheet = XLSX.utils.aoa_to_sheet(groupDataAddMoney(otherLevelResult, 2));
    XLSX.utils.book_append_sheet(newWorkbook, groupAddMoneyCOtherLevelWorkSheet, '其他级格式化排行依据');

    XLSX.writeFile(newWorkbook, 'out.xlsx');
  };

  useEffect(() => {
    if (moneyFileData && orgFileStatus) {
      // handleFileGetResult();
      const dataResult = handleWorkBooks(moneyFileData, orgFileData);
      setExportData(dataResult);
    }
  }, [moneyFileData, orgFileStatus]);

  const moneyFileProps = {
    action: '#',
    accept: '.xlsx',
    beforeUpload(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e?.target?.result) {
          return;
        }
        const data = new Uint8Array(e.target.result as any);
        const workbook = XLSX.read(data, { type: 'array' });
        setMoneyFileData(workbook);
        setMoneyFileStatus(true);
        console.log(moneyFileStatus);
        messageApi.success('文件解析成功');
      };
      reader.onerror = () => {
        messageApi.error('文件解析失败');
      };
      reader.readAsArrayBuffer(file);
      return false;
    },
  };

  const orgFileProps = {
    action: '#',
    accept: '.xlsx',
    beforeUpload(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e?.target?.result) {
          return;
        }
        const data = new Uint8Array(e.target.result as any);
        const workbook = XLSX.read(data, { type: 'array' });
        setOrgFileData(workbook);
        setOrgFileStatus(true);
        messageApi.success('文件解析成功');
      };
      reader.onerror = () => {
        messageApi.error('文件解析失败');
      };
      reader.readAsArrayBuffer(file);
      return false;
    },
  };

  // ----------------------------- 按照市区导出一个表 -----------------------------------
  const downloadCitySliceXlsx = () => {
    if (!exportData) {
      messageApi.warning('请先上传数据');
      return;
    }
    const { cityLevelResult, countyLevelResult, otherLevelResult } = exportData;

    const citySliceMap = handleCitySliceMap(cityLevelResult, countyLevelResult, otherLevelResult)

    // 创建新的工作薄，但是注意，没有工作表
    const citySliceWorkbook = XLSX.utils.book_new();

    
    for (const element of citySliceMap) {
      console.log(element);
      const [key, value] = element;
      // aoa_to_sheet 是将二维数组改成sheets，所以没有样式及合并单元格的内容
      const oneSheet = XLSX.utils.aoa_to_sheet(value);
      XLSX.utils.book_append_sheet(citySliceWorkbook, oneSheet, key);
    }
    XLSX.writeFile(citySliceWorkbook, '按照市拆分表.xlsx');

    
  }
  return (
    <PageContainer>
      {contextHolder}
      <ProCard>
        <ProFormUploadDragger
          label="捐赠金额大于6000元的表"
          fieldProps={moneyFileProps}
        ></ProFormUploadDragger>
        <ProFormUploadDragger
          label="优秀社会组织汇总表"
          fieldProps={orgFileProps}
        ></ProFormUploadDragger>
      </ProCard>
      <ProCard>
        <Button onClick={downloadXlsx}>点击下载导出的结果文件</Button>
      </ProCard>
      <ProCard>
        <Button onClick={downloadCitySliceXlsx}>点击下载导出市级区分文件</Button>
      </ProCard>
    </PageContainer>
  );
};

export default parseUpload;
