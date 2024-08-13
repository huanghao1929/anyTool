import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Upload, message } from 'antd';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const parseUpload: React.FC = () => {
  const [data, setData] = useState<any>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const handleXLSX = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e?.target?.result) {
        return;
      }
      const data = new Uint8Array(e.target.result as any);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // { header: 1 } 生成数组类型的数组 ("二维数组")
      // https://github.com/rockboom/SheetJS-docs-zh-CN?tab=readme-ov-file#json
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('[ jsonData ] >', jsonData)
      setData(jsonData);
      messageApi.success('文件解析成功');
    };
    reader.onerror = () => {
      messageApi.error('文件解析失败');
    };
    reader.readAsArrayBuffer(file);
  }

  const props = {
    name: 'file',
    action: '#',
    beforeUpload(file) {
      handleXLSX(file);
      return false;
    },
  };

  return (
    <PageContainer>
      {contextHolder}
      <ProCard>
        <Upload {...props}>
          <Button>点击上传文件</Button>
        </Upload>
      </ProCard>

    </PageContainer>
  );
};

export default parseUpload;
