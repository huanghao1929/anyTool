import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Upload, message } from 'antd';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const parseUpload: React.FC = () => {
  const [data, setData] = useState<any>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const props = {
    name: 'file',
    action: '#',
    // onChange(info) {
    //   if (info.file.status !== 'uploading') {
    //     console.log(info.file, info.fileList);
    //   }
    //   if (info.file.status === 'done') {
    //     messageApi.success(`${info.file.name} file uploaded successfully`);
    //   } else if (info.file.status === 'error') {
    //     messageApi.error(`${info.file.name} file upload failed.`);
    //   }
    // },
    beforeUpload(file) {
      console.log(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e?.target?.result) {
          return;
        }
        const data = new Uint8Array(e.target.result as any);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log(jsonData);
        setData(jsonData);
        messageApi.success('文件解析成功');
      };
      reader.onerror = () => {
        messageApi.error('文件解析失败');
      };
      reader.readAsArrayBuffer(file);
    },
  };

  return (
    <PageContainer>
      {contextHolder}
      <ProCard>
        <Upload {...props}>
          <Button>Click to Upload</Button>
        </Upload>
      </ProCard>
    </PageContainer>
  );
};

export default parseUpload;
