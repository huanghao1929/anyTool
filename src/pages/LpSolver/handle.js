import { cloneDeep } from 'lodash';

// 处理数据。得到结果。


export const getLp = (optimize, opType, constraintsData, variablesData ) => {
  console.log(constraints)
  const lp = {
    optimize,
    opType,
  }

  // 处理约束
  const constraints = {};
  for (let index = 0; index < constraintsData.length; index++) {
    const constraint = constraintsData[index];
    const { constraintName, max, min } = constraint;
    constraints[constraintName] = {
      max,
      min,
    }
  }
  lp.constraints = constraints;

  // 处理变量
  const variables = {};
  const ints = {};

  for (let index = 0; index < variablesData.length; index++) {
    const variable = variablesData[index];
    const { variableName, isInt } = variable;
    const variableInner = cloneDeep(variable);
    delete variableInner.variableName;
    delete variableInner.ints;
    delete variableInner.id;
    delete variableInner.index;
    variables[variableName] = variableInner
    if (isInt === 'true') {
      ints[variableName] = 1;
    }
  }

  lp.variables = variables;
  lp.ints = ints;

  return lp;

}