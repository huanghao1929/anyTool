import type { ProColumns } from '@ant-design/pro-components';
import {
  EditableProTable,
  PageContainer,
  ProCard,
  ProFormField,
} from '@ant-design/pro-components';
import { Input, Select, message, Button } from 'antd';
import solver from 'javascript-lp-solver';
import { useEffect, useState } from 'react';
import { getLp } from './handle';

export default () => {
  const [messageApi, contextHolder] = message.useMessage();

  // ----------------------- 约束条件(constraints)获取数据相关 -----------------------
  const [constraintsData, setConstraintsData] = useState<readonly any[]>([]);

  const constraintsColumns: ProColumns<any>[] = [
    {
      title: '名称',
      dataIndex: 'constraintName',
      width: '30%',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '最大值',
      key: 'max',
      dataIndex: 'max',
      valueType: 'digit',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [
            {
              message: '仅支持数字',
              type: 'number',
            },
          ],
        };
      },
    },
    {
      title: '最小值',
      key: 'min',
      dataIndex: 'min',
      valueType: 'digit',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [
            {
              message: '仅支持数字',
              type: 'number',
            },
          ],
        };
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            setConstraintsData(
              constraintsData.filter((item) => item.id !== record.id)
            );
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  const judgeOneconstraint = (key, row) => {
    return new Promise((resolve, reject) => {
      // 1. 检查 当前数据的 constraintName 是否 已经存在。
      // 2. 检查 如果有最大值且有最小值，那么最大值需要大于等于最小值，最大值和最小值二选一
      const currentName = row.constraintName;

      const isHas = constraintsData.find(
        (c) => c.constraintName === currentName
      );
      if (isHas) {
        messageApi.warning('名称重复了, 请修改');
        reject('名称重复了, 请修改');
      }
      const { max, min } = row;
      if (max === undefined && min === undefined) {
        messageApi.warning('请输入最大值或者最小值');
        reject('请输入最大值或者最小值');
      }
      if (max !== undefined && min !== undefined && min > max) {
        messageApi.warning('最大值需大于等于最小值');
        reject('最大值需大于等于最小值');
      }
      resolve(true);
    });
  };
  // ----------------------- 目标(target)获取数据相关 -----------------------
  const [target, setTarget] = useState('积分');
  const [opType, setOpType] = useState('max');
  // ----------------------- 变量(variables)获取数据相关 -----------------------
  const defaultVariablesColumns: ProColumns<any>[] = [
    {
      title: '名称',
      dataIndex: 'variableName',
      width: '30%',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
    },
    {
      title: '是否仅支持整数',
      dataIndex: 'isInt',
      valueType: 'select',
      valueEnum: {
        true: {
          text: '是',
        },
        false: {
          text: '否',
        },
      }
    },
    // toAddColumn
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            setVariablesData(
              variablesData.filter((item) => item.id !== record.id)
            );
          }}
        >
          删除
        </a>,
      ],
    },
  ];
  const [variablesColumns, setVariablesColumns] = useState<any>(
    defaultVariablesColumns
  );
  const [variablesData, setVariablesData] = useState<readonly any[]>([]);
  // 根据约束的名称得到再变量列中的配置
  const getVariableColumn = (name) => {
    return {
      title: name,
      key: name,
      dataIndex: name,
      valueType: 'digit',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [
            {
              message: '仅支持数字',
              type: 'number',
            },
          ],
        };
      },
    };
  };

  // 当约束条件改变时，增加/减少 那么需要重新修改变量数据的列配置
  useEffect(() => {
    const columns: any = [];
    for (let index = 0; index < constraintsData.length; index++) {
      const element = constraintsData[index];
      const name = element.constraintName;
      columns.push(getVariableColumn(name));
    }
    const addConstVarCol = defaultVariablesColumns.toSpliced(2, 0, ...columns);
    const addTargetCol = addConstVarCol.toSpliced(-1, 0, getVariableColumn(target) as any);
    setVariablesColumns(addTargetCol);
  }, [constraintsData, target]);

  // ----------------------- 处理数据，得到结果 -----------------------
  const [lpResult, setLpResult] = useState<any>();
  const getResult = () => {
    const tempLpResult = {};
    const lp = getLp(target, opType, constraintsData, variablesData)
    const results = solver.Solve(lp);
    tempLpResult[target] = results.result;
    for (let index = 0; index < variablesData.length; index++) {
      const variable = variablesData[index];
      tempLpResult[variable.variableName] = results[variable.variableName];
    }
    setLpResult(tempLpResult);
  }


  // ----------------------- 目标(target)DOM相关 -----------------------
  const selectAfter = (
    <Select defaultValue={opType} onChange={val => setOpType(val)}>
      <Select.Option value="max">最大</Select.Option>
      <Select.Option value="min">最小</Select.Option>
    </Select>
  );

  return (
    <PageContainer>
      {contextHolder}
      <ProCard title="约束条件">
        <EditableProTable<any>
          rowKey="id"
          headerTitle=""
          maxLength={10}
          recordCreatorProps={{
            position: 'bottom',
            record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
          }}
          columns={constraintsColumns}
          value={constraintsData}
          onChange={setConstraintsData}
          editable={{
            type: 'single',
            onSave: judgeOneconstraint,
            onlyAddOneLineAlertMessage: '需编辑并保存当前数据, 方可继续新增',
          }}
        />
      </ProCard>
      <ProCard title="目标">
        <Input
          value={target}
          onChange={e => setTarget(e.target.value)}
          placeholder="请输入目标名称, 例如: 积分"
          addonAfter={selectAfter}
        />
      </ProCard>
      <ProCard title="变量条件">
        <EditableProTable<any>
          rowKey="id"
          headerTitle=""
          maxLength={20}
          recordCreatorProps={{
            position: 'bottom',
            record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
          }}
          columns={variablesColumns}
          value={variablesData}
          onChange={setVariablesData}
          editable={{
            type: 'single',
            onlyAddOneLineAlertMessage: '需编辑并保存当前数据, 方可继续新增',
          }}
        />
      </ProCard>

      <ProCard title="结果展示">
        <Button onClick={getResult}>
          已确认填写完毕，点击获取最优结果
        </Button>
      </ProCard>

      <ProCard
        title="结果"
        headerBordered
        collapsible
        // defaultCollapsed
      >
        <ProFormField
          ignoreFormItem
          fieldProps={{
            style: {
              width: '100%',
            },
          }}
          mode="read"
          valueType="jsonCode"
          text={JSON.stringify(lpResult)}
        />
      </ProCard>
    </PageContainer>
  );
};
