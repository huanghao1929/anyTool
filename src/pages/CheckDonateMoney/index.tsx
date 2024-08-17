import {
  PageContainer,
  ProCard,
  ProFormUploadDragger,
} from "@ant-design/pro-components";
import { message } from "antd";
import JSZip from "jszip";
import React, { useState } from "react";
import { buildFileTree, checkTreeZip } from "./handle";
import { List } from "antd";

const parseUpload: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [errorList, setErrorList] = useState<any>([]);

  const decodeFileName = (bytes, type) => {
    // 使用 GBK 编码解码文件名
    const decoder = new TextDecoder(type);
    return decoder.decode(bytes);
  };

  const handleZip = (file) => {
    // JSZip 参考手册 http://docs.asprain.cn/jszip/jszip.html#jszip_load_async
    const zip = new JSZip();
    const speaiclReg = /^__MACOSX/;
    zip
      .loadAsync(file, {
        decodeFileName: (bytes) => decodeFileName(bytes, "gbk"),
        createFolders: true,
      })
      .then((zipContent) => {
        // 展示文件列表
        const files = Object.keys(zipContent.files).map((fileName) => {
          const file = zipContent.files[fileName];
          return {
            path: file.name,
            dir: file.dir,
            file,
          };
        });
        const fileTree = buildFileTree(files);

        checkTreeZip(fileTree).then((errorList) => {
          // console.log(errorList);
          setErrorList(errorList);
        });
      });
  };

  const moneyFileProps = {
    action: "#",
    accept: ".zip",
    beforeUpload(file) {
      handleZip(file);
      return false;
    },
  };
  return (
    <PageContainer>
      {contextHolder}
      <ProCard>
        <ProFormUploadDragger
          label="上传数据压缩包"
          fieldProps={moneyFileProps}
        />
      </ProCard>
      <ProCard title="异常信息">
        <List
          bordered
          dataSource={errorList}
          renderItem={(item: any) => (
            <List.Item>
              错误路径：{item.path}<br></br>错误信息：{item.msg}
            </List.Item>
          )}
        />
      </ProCard>
    </PageContainer>
  );
};

export default parseUpload;
