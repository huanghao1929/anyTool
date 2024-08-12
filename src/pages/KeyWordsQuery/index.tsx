import { PageContainer, ProCard, ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Image, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import { getValueByApi } from './handleData';

const columns = [
  {
    title: '查询Key',
    dataIndex: 'key',
    hideInTable: true,
  },
  {
    title: '分类ID',
    dataIndex: 'types',
    hideInTable: true,
  },
  {
    title: '区域ID',
    dataIndex: 'region',
    hideInTable: true,
  },
  {
    title: 'ID',
    dataIndex: 'id',
    width: 100,
    hideInSearch: true,
  },
  {
    title: '名称',
    dataIndex: 'name',
    copyable: true,
    ellipsis: true,
    hideInSearch: true,
  },
  {
    title: '地址',
    dataIndex: 'address',
    hideInSearch: true,
    render: (_, record) => (
      <span>{`${record.cityname}${record.adname}${record.address}`}</span>
    ),
  },
  {
    title: '店铺标签',
    dataIndex: 'type',
    hideInSearch: true,
  },
  {
    title: '店铺图片 点开可查看全部',
    dataIndex: 'photos',
    hideInSearch: true,
    render: (_, record) => {
      if(record.photos.length <= 0) {
        return '暂无图片'
      } else {
        return (
          <Image.PreviewGroup items={record.photos.map((i) => i.url)}>
            <Image height={100} src={record.photos[0].url}>
              查看
            </Image>
          </Image.PreviewGroup>
        )
      }
    },
  },
  {
    title: '联系电话',
    dataIndex: 'tel',
    hideInSearch: true,
    render: (_, record) => (
      <div>
        {(record?.business?.tel?.split(';') ?? []).map((tel) => {
          return <div>{tel}</div>;
        })}
      </div>
    ),
  },
];

const KeyWordsQuery: React.FC = () => {
  const actionRef = useRef();
  const [tableData, setTableData] = useState<any>([]);

  const { regionMap, typesMap } = useModel('global');

  // 通过region和types获取弹窗的展示内容
  // 检查当前的查询区域和查询类型
  const getConfirmContent = (region, types) => {
    const regionInfo = regionMap.get(region);
    const typesInfo = typesMap.get(types);
    if (!regionInfo) {
      return `无法确认当前查询的区域, 请检查区域ID是否正确`;
    }
    if (!typesInfo) {
      return `无法确认当前查询的类型, 请检查类型ID是否正确`;
    }

    return (
      <div>
        请再次当前查询的内容
        <div>区域是:{regionInfo['中文名']}</div>
        <div>
          类型是:{typesInfo['大类']}/{typesInfo['中类']}/{typesInfo['小类']}{' '}
        </div>
      </div>
    );
  };

  const getConfirmOKFn = (params) => {
    const { region, types } = params;
    const regionInfo = regionMap.get(region);
    const typesInfo = typesMap.get(types);
    if (!regionInfo || !typesInfo) {
      return () => {
        message.warning('请检查输入后再查询');
      };
    }
    return () => {
      getValueByApi(params)
        .then((data) => {
          setTableData(data);
        })
        .catch((error) => {
          console.error(error);
        });
    };
  };

  const handleDownload = (fileName) => {
    const link = document.createElement('a');
    link.href = `/assets/${fileName}.xlsx`; // 文件路径
    link.download = `${fileName}.xlsx`; // 下载的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 导出CSV
  const exportResult = () => {
    if (tableData.length === 0) {
      message.error('当前没有数据可以导出')
      return;
    }
    const tableRows = [
      ['店铺id', '店铺名称', '店铺地址', '店铺标签', '店铺手机号'], // 第一行就是表格表头
    ];

    // 遍历商店信息列表，将每个商店信息转换为表格行
    tableData.forEach((item) => {
      const rowData = [
        item.name,
        `${item.pname}${item.cityname}${item.adname}${item.address}`,
        item.type,
        item.business.tel,
      ]
      tableRows.push(rowData);
    });

    // 构造数据字符，换行需要用\r\n
    let CsvString = tableRows.map((data) => data.join(',')).join('\r\n');
    // 加上 CSV 文件头标识
    CsvString =
      'data:application/vnd.ms-excel;charset=utf-8,\uFEFF' +
      encodeURIComponent(CsvString);
    // 通过创建a标签下载
    const link = document.createElement('a');
    link.href = CsvString;
    // 对下载的文件命名
    link.download = `搜索结果.csv`;
    // 模拟点击下载
    link.click();
    // 移除a标签
    link.remove();
  };

  const renderDownloadButton = () => {
    return [
      <Button type="primary" onClick={() => handleDownload('高德POI')}>
        下载分类表格
      </Button>,
      <Button type="primary" onClick={() => handleDownload('高德地址')}>
        下载区域表格
      </Button>,
      <Button type="primary" onClick={exportResult}>
        导出搜索内容
      </Button>,
    ];
  };

  return (
    <PageContainer>
      <ProCard>
        <ProTable
          columns={columns}
          actionRef={actionRef}
          dataSource={tableData}
          search={{
            collapsed: false,
            collapseRender: false,
          }}
          rowKey="id"
          pagination={{
            pageSize: 25,
            onChange: (page) => console.log(page),
            showSizeChanger: false,
          }}
          beforeSearchSubmit={(params) => {
            console.log(params);
            const { key = '', region = '', types = '' } = params;
            if (key === '' || region === '' || types === '') {
              return;
            } else {
              Modal.confirm({
                content: getConfirmContent(region, types),
                onOk: getConfirmOKFn(params),
              });
            }
          }}
          headerTitle="查询结果"
          options={{
            fullScreen: false,
            reload: false,
            density: false,
            setting: false,
          }}
          toolBarRender={renderDownloadButton}
        />
      </ProCard>
    </PageContainer>
  );
};

export default KeyWordsQuery;
