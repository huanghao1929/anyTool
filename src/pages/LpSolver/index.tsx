import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Space, message } from 'antd';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const parseUpload: React.FC = () => {
  const [data, setData] = useState<any>([]);
  const [messageApi, contextHolder] = message.useMessage();


  const constraintsButtons = () => {
    return (
      <Space>
        <Button>编辑</Button>
        <Button>保存</Button>
      </Space>
    )
  }
  return (
    <PageContainer>
      {contextHolder}
      <ProCard title="约束" extra={constraintsButtons()}>

      </ProCard>
      <ProCard>

      </ProCard>
    </PageContainer>
  );
};

export default parseUpload;
