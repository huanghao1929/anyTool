import { PageContainer, ProCard } from "@ant-design/pro-components";
import { Button, Upload, message } from "antd";
import JSZip from "jszip";
import React, { useState } from "react";
import * as XLSX from "xlsx";

const parseUpload: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  // ------------------------- Xlsx相关下载 -------------------------

  const [data, setData] = useState<any>([]);

  const handleXLSX = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e?.target?.result) {
        return;
      }
      const data = new Uint8Array(e.target.result as any);
      const workbook = XLSX.read(data, { type: "array" });
      // 重点关注 workbook.SheetNames 是所有的sheets的名称数组
      console.log("[ workbook ] >", workbook);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // worksheet 数据 几乎没有可读性
      // console.log('[ worksheet ] >', worksheet)
      // { header: 1 } 生成数组类型的数组 ("二维数组")
      // https://github.com/rockboom/SheetJS-docs-zh-CN?tab=readme-ov-file#json
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log("[ jsonData ] >", jsonData);
      setData(jsonData);
      messageApi.success("文件解析成功");
    };
    reader.onerror = () => {
      messageApi.error("文件解析失败");
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadXlsx = () => {
    if (data.length === 0) {
      messageApi.warning("请先上传文件");
      return;
    }
    // 创建新的工作薄，但是注意，没有工作表
    const newWorkbook = XLSX.utils.book_new();
    // aoa_to_sheet 是将二维数组改成sheets，所以没有样式及合并单元格的内容
    const newWorkSheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(newWorkbook, newWorkSheet, "新创建的工作表");
    XLSX.writeFile(newWorkbook, "out.xlsx");
  };
  const props = {
    name: "file",
    action: "#",
    beforeUpload(file) {
      handleXLSX(file);
      return false;
    },
  };

  // ------------------------- Zip相关下载 -------------------------
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
        zipContent.forEach(async (relativePath, file) => {
          if (!speaiclReg.test(relativePath)) {
            console.log(relativePath, file);
            // const fileData = await file.async('blob');
            // handleXLSX(fileData);
          }
        });
        console.log("zipConteng", zipContent);
      });
  };

  // 按照文件夹导出文件。
  const exportZip = (fileGroups) => {
    const zip = new JSZip();
  };

  const uploadZipProps = {
    name: "file",
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
        <Upload {...props}>
          <Button>点击上传文件xlsx</Button>
        </Upload>
      </ProCard>
      <ProCard>
        <Button onClick={downloadXlsx}>点击下载XLSX文件</Button>
      </ProCard>

      <ProCard>
        <Upload {...uploadZipProps}>
          <Button>点击上传文件zip</Button>
        </Upload>
      </ProCard>
    </PageContainer>
  );
};

export default parseUpload;
