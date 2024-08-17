import { getArrayByXlsxFile } from "@/utils/xlsxUtil";

// 将扁平化的数组按照文件夹转换成树状结构
export const buildFileTree = (flatFiles) => {
  // 初始化根节点，表示文件系统的根目录
  const root = [];

  // 遍历所有的扁平化文件对象
  flatFiles.forEach((file) => {
    // 将路径按斜杠分割为各个部分，同时移除空值（避免路径中多余的斜杠导致空路径）
    const pathParts = file.path.split("/").filter(Boolean);

    // 开始遍历路径部分，初始从根节点开始
    let currentLevel = root;

    // 遍历路径的每个部分，构建树状结构
    pathParts.forEach((part, index) => {
      // 检查当前层级中是否已存在当前路径部分的节点
      let existingNode = currentLevel.find((node) => node.name === part);

      // 如果节点不存在，创建一个新的节点并添加到当前层级
      if (!existingNode) {
        existingNode = {
          name: part, // 当前路径部分的名称
          children: [], // 初始化子节点数组
          file: file.file,
          dir: file.dir,
        };
        currentLevel.push(existingNode);
      }

      // 如果是路径的最后一部分，并且不是文件夹，则更新文件信息
      if (index === pathParts.length - 1 && !file.dir) {
        Object.assign(existingNode, file.fileInfo);
      }

      // 更新当前层级为当前节点的子节点，用于处理下一个路径部分
      currentLevel = existingNode.children;
    });
  });

  return root; // 返回构建好的树状结构
};

const getSummaryInfoByXlsx = async (xlsxFile) => {
  const fileData = await xlsxFile.async("blob");
  const fileArray = await getArrayByXlsxFile(fileData);
  // 二维数组中，移除首行的信息，
  const removeFitst = fileArray.toSpliced(0, 1);

  //  并且从后往前，移除空的信息
  for (let index = removeFitst.length - 1; index >= 0; index--) {
    const element = removeFitst[index];
    if (element.length === 0) {
      removeFitst.pop();
    } else {
      break;
    }
  }
  return removeFitst;
};
/**
检查原则
1. 有汇总表结尾的xlsx，那么一定有文件夹。 没有认为异常。
2. 没有汇总表，那么一定没有文件夹。 有认为异常
3. 汇总表的信息发起人 字数 > 30 认为异常。
4. 汇总表信息条数严格等于文件夹的个数。 不相同认为异常。
5. 汇总表的信息发起人严格等于文件夹的名称。 有不相同，认为异常。

以上检查通过，则认为正常。
 */

export const checkTreeZip = async (tree) => {
  const errorList = [];

  // 递归的函数 参数除了树本身，加入 path 来方便排查问题
  const checkOneTree = async (tree, path = "根文件") => {
    // console.log("开始检查当前path", path, tree);
    // 1. 检查当前数组中，是否有汇总表结尾的 xlsx 文件
    const summaryXlsx = tree.find((item) => /汇总表.xlsx$/.test(item.name));
    // 2. 当前文件夹的数组，方便后面访问
    const dirArray = tree.filter((item) => item.dir);
    // 3. 如果没有汇总表，那么一定没有文件夹。
    if (!summaryXlsx) {
      if (dirArray.length !== 0) {
        const errInfo = {
          path,
          msg: "当前没有汇总表但是有文件夹",
        };
        errorList.push(errInfo);
      } else {
        // 没有汇总表，也没有文件夹，直接结束当前递归。
        return;
      }
    }

    // 下面几个检查，都是有汇总表才行
    if (summaryXlsx) {
      // 4. 获取到当前汇总表的信息
      const summaryInfo = await getSummaryInfoByXlsx(summaryXlsx.file);
      // 5. 检查汇总表信息之前，需要保证汇总表每条信息的准确性
      for (let index = 0; index < summaryInfo.length; index++) {
        const element = summaryInfo[index];
        const [promoter] = element;
        if (!promoter) {
          const errInfo = {
            path,
            msg: `当前路径下的汇总表这一条信息没有发起人-${element}`,
          };
          errorList.push(errInfo);
          // return;
        }
        if (promoter.length > 30) {
          const errInfo = {
            path,
            msg: `当前路径下的汇总表这一条信息发起人长度大于30-${element}`,
          };
          errorList.push(errInfo);
          // return;
        }
      }

      // 6. 汇总表信息条数需要严格等于文件夹的个数
      if (summaryInfo.length !== dirArray.length) {
        const errInfo = {
          path,
          msg: "当前路径下汇总表信息数和文件夹的个数不一致",
        };
        errorList.push(errInfo);
        // return;
      }

      // 7. 检查两个汇总表与文件夹的名称是否完全相同，此时这俩长度相同。那么for循环一个就可以了。
      // 以汇总表为准。
      for (let index = 0; index < summaryInfo.length; index++) {
        const element = summaryInfo[index];
        const [promoter] = element;
        const isHasDir = dirArray.some((item) => item.name === promoter);
        if (!isHasDir) {
          const errInfo = {
            path,
            msg: `当前路径下${promoter}在汇总表，但是没有对应的文件夹`,
          };
          errorList.push(errInfo);
          // return;
        }
      }
    }

    console.log(path, "准备遍历当前文件夹", dirArray);
    // 上述检查之后，可以进入到下一级的文件夹
    for (let index = 0; index < dirArray.length; index++) {
      const element = dirArray[index];
      // console.log("开始检查", `${path}/${element.name}`, index);
      await checkOneTree(element.children, `${path}/${element.name}`);
      // console.log("结束检查", `${path}/${element.name}`);
    }
  };

  await checkOneTree(tree);
  return errorList;
};
