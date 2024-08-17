import * as XLSX from "xlsx";

// 将file格式化成二维数组返回
export const getArrayByXlsxFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e?.target?.result) {
        reject("文件解析失败");

        return;
      }
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      // 重点关注 workbook.SheetNames 是所有的sheets的名称数组
      console.log("[ workbook ] >", workbook);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // worksheet 数据 几乎没有可读性
      // { header: 1 } 生成数组类型的数组 ("二维数组")
      // https://github.com/rockboom/SheetJS-docs-zh-CN?tab=readme-ov-file#json
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      resolve(jsonData);
    };
    reader.onerror = () => {
      reject("文件解析失败");
    };
    reader.readAsArrayBuffer(file);
  });
};
