'use strict';
import jTool from '@common/jTool';
import {CACHE_ERROR_KEY, TR_CACHE_ROW, CONSOLE_STYLE, CONSOLE_INFO, CONSOLE_ERROR, MEMORY_KEY, VERSION_KEY, CHECKBOX_WIDTH, ORDER_WIDTH, CHECKBOX_DISABLED_KEY} from '@common/constants';
import cache from '@common/cache';
import store from '@common/Store';
import { version } from '@package.json';
import tableTpl from '@test/table-test.tpl.html';
import getTableData from '@test/table-test.data.js';
import { getColumnMap, getColumnData } from '@test/table-config';
import i18n from '@module/i18n';
import {CHECKBOX_KEY, ORDER_KEY, TR_CACHE_KEY, TR_LEVEL_KEY} from '@common/constants';

// 清除空格
const tableTestTpl = tableTpl;

/**
 * 验证类的属性及方法总量
 */
describe('cache 验证类的属性及方法总量', () => {
    let getPropertyCount = null;
    beforeEach(() => {
        getPropertyCount = o => {
            let count = 0;
            for (let n in o) {
                if (o.hasOwnProperty(n)) {
                    count++;
                }
            }
            return count;
        };
    });
    afterEach(() => {
        getPropertyCount = null;
    });
    it('Function count', () => {
        // es6 中 constructor 也会算做为对象的属性, 所以总量上会增加1
        expect(getPropertyCount(Object.getOwnPropertyNames(Object.getPrototypeOf(cache)))).toBe(22 + 1);
    });
});

describe('cache.getVersion()', () => {
    it('基础验证', () => {
        expect(cache.getVersion).toBeDefined();
        expect(cache.getVersion.length).toBe(0);
    });

    it('验证返回值', () => {
        expect(cache.getVersion()).toBe(version);
    });
});

describe('getScope and setScope', () => {
    let scope = null;
    beforeEach(() => {
        document.body.innerHTML = tableTestTpl;
    });
    afterEach(() => {
        document.body.innerHTML = '';
        scope = null;
        store.scope = {};
    });

    it('基础验证', () => {
        expect(cache.getScope).toBeDefined();
        expect(cache.getScope.length).toBe(1);
        expect(cache.setScope).toBeDefined();
        expect(cache.setScope.length).toBe(2);
    });

    it('验证值', () => {
        expect(cache.getScope('test')).toBeUndefined();
        scope = {
            name: 'ccc'
        };
        cache.setScope('test', scope);
        expect(cache.getScope('test')).toEqual(scope);
    });
});

describe('getRowData', () => {
    let tableData = null;
    let insertData = null;
    beforeEach(() => {
        tableData = getTableData();
        document.body.innerHTML = tableTestTpl;
        insertData = () => {
            jTool.each(jTool('table tbody tr'), (index, item) => {
                item[TR_CACHE_ROW] = tableData.data[index];
            });
        };
        store.settings = {
            test: {
                gridManagerName: 'test',
                columnMap: getColumnMap()
            }
        };
    });
    afterEach(() => {
        tableData = null;
        insertData = null;
        document.body.innerHTML = '';
        store.responseData = {};
        store.settings = {};
    });

    it('基础验证', () => {
        expect(cache.getRowData).toBeDefined();
        expect(cache.getRowData.length).toBe(3);
    });

    it('未存在数据时', () => {
        expect(cache.getRowData('test', document.querySelector('tr[cache-key="9"]'))).toEqual({});
    });

    it('参数为element', () => {
        tableData.data[8].gm_checkbox = true;
        tableData.data[8].gm_checkbox_disabled = true;
        tableData.data[8].gm_order = 9;
        insertData();
        expect(cache.getRowData('test', document.querySelector('tr[cache-key="8"]'))).toEqual(new getTableData().data[8]);
        expect(cache.getRowData('test', document.querySelector('tr[cache-key="8"]'), true)).toEqual(tableData.data[8]);
    });

    it('使用gm自定义的属性', () => {
        insertData();
        expect(cache.getRowData('test', document.querySelector('tr[cache-key="9"]'))).toEqual(tableData.data[9]);
    });

    it('参数为NodeList', () => {
        insertData();
        expect(cache.getRowData('test', document.querySelectorAll('tr[cache-key]')).length).toBe(10);
    });

    it('参数异常', () => {
        insertData();
        expect(cache.getRowData('test', 'aa')).toEqual({});
    });
});

describe('updateRowData(gridManagerName, key, rowDataList)', () => {
    beforeEach(() => {
        store.responseData['test'] = getTableData().data;
        store.settings = {
            test: {
                gridManagerName: 'test',
                supportTreeData: false,
                treeConfig: {
                    treeKey: 'children'
                }
            }
        };
        document.body.innerHTML = tableTestTpl;
    });
    afterEach(() => {
        document.body.innerHTML = '';
        store.responseData = {};
        store.settings = {};
    });

    it('基础验证', () => {
        expect(cache.updateRowData).toBeDefined();
        expect(cache.updateRowData.length).toBe(3);
    });

    it('执行验证: 常规数据', () => {
        let { tableData, updateCacheList } = cache.updateRowData('test', 'id', [{id: 90, title: 'test updateRowData'}]);
        expect(tableData.length).toBe(10);
        expect(tableData[1].title).toBe('test updateRowData');

        expect(updateCacheList.length).toBe(1);
        expect(updateCacheList[0].id).toBe(90);
        tableData = null;
        updateCacheList = null;
    });

    it('执行验证: 树型数据', () => {
        store.settings.test.supportTreeData = true;
        let { tableData, updateCacheList } = cache.updateRowData('test', 'id', [{id: 92, title: 'test updateRowData'}, {id: 921, title: 'test updateRowData'}]);

        expect(tableData.length).toBe(10);
        expect(tableData[0].title).toBe('test updateRowData');
        expect(tableData[0].children[0].title).toBe('test updateRowData');

        expect(updateCacheList.length).toBe(2);
        expect(updateCacheList[0].id).toBe(92);
        expect(updateCacheList[1].id).toBe(921);
        tableData = null;
        updateCacheList = null;
    });
});

describe('getTableData and setTableData', () => {
    let tableData = null;
    beforeEach(() => {
        tableData = getTableData();
    });
    afterEach(() => {
        tableData = null;
        store.responseData = {};
    });

    it('基础验证', () => {
        expect(cache.getTableData).toBeDefined();
        expect(cache.getTableData.length).toBe(1);
        expect(cache.setTableData).toBeDefined();
        expect(cache.setTableData.length).toBe(2);
    });

    it('执行验证', () => {
        expect(cache.getTableData('test')).toEqual([]);
        cache.setTableData('test', tableData.data);
        expect(cache.getTableData('test')).toEqual(tableData.data);
    });
});

describe('resetTableData', () => {
    let tableData = null;
    let resetData = null;
    beforeEach(() => {
        tableData = getTableData().data;
    });
    afterEach(() => {
        tableData = null;
        resetData = null;
        store.responseData = {};
        store.settings = {};
        store.checkedData = {};
    });

    it('基础验证', () => {
        expect(cache.resetTableData).toBeDefined();
        expect(cache.resetTableData.length).toBe(2);
    });

    it('执行验证: 无重置项', () => {
        store.settings = {
            test: {
                gridManagerName: 'test',
                columnMap: getColumnMap(),
                rowRenderHandler: row => row,
                pageData: {},
                supportAutoOrder: false,
                supportCheckbox: false,
                pageSizeKey: 'pSize',
                currentPageKey: 'cPage'
            }
        };
        resetData = cache.resetTableData('test', tableData);
        expect(resetData).toEqual(tableData);
    });

    it('执行验证: supportAutoOrder=true', () => {
        store.settings = {
            test: {
                gridManagerName: 'test',
                columnMap: getColumnMap(),
                rowRenderHandler: row => row,
                pageData: {
                    pSize: 30,
                    cPage: 2
                },
                supportAutoOrder: true,
                supportCheckbox: false,
                pageSizeKey: 'pSize',
                currentPageKey: 'cPage'
            }
        };
        resetData = cache.resetTableData('test', tableData);
        expect(resetData[0][ORDER_KEY]).toBe(31);
        expect(resetData[0][TR_CACHE_KEY]).toBe('0');
        expect(resetData[0][TR_LEVEL_KEY]).toBe(0);
    });

    it('执行验证: supportCheckbox=true', () => {
        store.settings = {
            test: {
                gridManagerName: 'test',
                columnMap: getColumnMap(),
                rowRenderHandler: row => row,
                supportAutoOrder: false,
                supportCheckbox: true,
                pageSizeKey: 'pSize',
                currentPageKey: 'cPage'
            }
        };
        store.checkedData = {
            test: [
                tableData[0], tableData[2]
            ]
        };
        resetData = cache.resetTableData('test', tableData);
        expect(resetData[0][CHECKBOX_KEY]).toBe(true);
        expect(resetData[0][CHECKBOX_DISABLED_KEY]).toBe(false);
        expect(resetData[0][TR_CACHE_KEY]).toBe('0');
        expect(resetData[0][TR_LEVEL_KEY]).toBe(0);

        expect(resetData[0].children[0][CHECKBOX_KEY]).toBeUndefined();
        expect(resetData[0].children[0][CHECKBOX_DISABLED_KEY]).toBeUndefined();
        expect(resetData[0].children[0][TR_CACHE_KEY]).toBeUndefined();
        expect(resetData[0].children[0][TR_LEVEL_KEY]).toBeUndefined();

        expect(resetData[1][CHECKBOX_KEY]).toBe(false);
        expect(resetData[1][CHECKBOX_DISABLED_KEY]).toBe(false);
        expect(resetData[1][TR_CACHE_KEY]).toBe('1');
        expect(resetData[1][TR_LEVEL_KEY]).toBe(0);

        expect(resetData[2][CHECKBOX_KEY]).toBe(true);
        expect(resetData[2][CHECKBOX_DISABLED_KEY]).toBe(false);
        expect(resetData[2][TR_CACHE_KEY]).toBe('2');
        expect(resetData[2][TR_LEVEL_KEY]).toBe(0);
    });


    it('执行验证: supportTreeData=true', () => {
        store.settings = {
            test: {
                gridManagerName: 'test',
                columnMap: getColumnMap(),
                rowRenderHandler: row => row,
                supportAutoOrder: false,
                supportCheckbox: false,
                supportTreeData: true,
                treeConfig: {
                    // 树展开操作按键所属容器，此处配置columnData的key值。未配置时，将默认选择columnData的第一项
                    insertTo: null,

                    // 层级关键字段
                    treeKey: 'children',

                    // 初始打开状态
                    openState: false
                }
            }
        };
        store.checkedData = {
            test: [
                tableData[0], tableData[2]
            ]
        };
        resetData = cache.resetTableData('test', tableData);
        expect(resetData[0][ORDER_KEY]).toBeUndefined();
        expect(resetData[0][CHECKBOX_KEY]).toBeUndefined();
        expect(resetData[0][CHECKBOX_DISABLED_KEY]).toBeUndefined();
        expect(resetData[0][TR_CACHE_KEY]).toBe('0');
        expect(resetData[0][TR_LEVEL_KEY]).toBe(0);

        expect(resetData[0].children[0][ORDER_KEY]).toBeUndefined();
        expect(resetData[0].children[0][CHECKBOX_KEY]).toBeUndefined();
        expect(resetData[0].children[0][CHECKBOX_DISABLED_KEY]).toBeUndefined();
        expect(resetData[0].children[0][TR_CACHE_KEY]).toBe('0-0');
        expect(resetData[0].children[0][TR_LEVEL_KEY]).toBe(1);

        expect(resetData[1][ORDER_KEY]).toBeUndefined();
        expect(resetData[1][CHECKBOX_KEY]).toBeUndefined();
        expect(resetData[1][CHECKBOX_DISABLED_KEY]).toBeUndefined();
        expect(resetData[1][TR_CACHE_KEY]).toBe('1');
        expect(resetData[1][TR_LEVEL_KEY]).toBe(0);

        expect(resetData[2][ORDER_KEY]).toBeUndefined();
        expect(resetData[2][CHECKBOX_KEY]).toBeUndefined();
        expect(resetData[2][CHECKBOX_DISABLED_KEY]).toBeUndefined();
        expect(resetData[2][TR_CACHE_KEY]).toBe('2');
        expect(resetData[2][TR_LEVEL_KEY]).toBe(0);
    });
});

describe('getCheckedData and setCheckedData', () => {
    let dataList = null;
    let tableData = null;
    beforeEach(() => {
        tableData = getTableData();
        dataList = [];
        store.checkedData = {};
        store.settings = {
            test: {
                gridManagerName: 'test',
                columnMap: getColumnMap()
            }
        };
    });
    afterEach(() => {
        tableData = null;
        delete store.checkedData.test;
        delete store.settings.test;
        dataList = null;
    });

    it('基础验证', () => {
        expect(cache.getCheckedData).toBeDefined();
        expect(cache.getCheckedData.length).toBe(1);
        expect(cache.setCheckedData).toBeDefined();
        expect(cache.setCheckedData.length).toBe(3);
    });

    it('设置一组全部未选中的数据', () => {
        expect(cache.getCheckedData('test').length).toBe(0);

        cache.setCheckedData('test', tableData.data);
        expect(cache.getCheckedData('test').length).toBe(0);
    });

    it('设置一组全部选中的数据', () => {
        dataList = [tableData.data[0], tableData.data[2]];
        cache.setCheckedData('test', dataList, true);  // 第三个参数为true时， checkedList默认为全部选中的数据
        expect(cache.getCheckedData('test').length).toBe(2);
        expect(cache.getCheckedData('test')[0].id).toBe(92);
        expect(cache.getCheckedData('test')[1].id).toBe(89);
    });

    it('设置一组存在两种状态的数据', () => {
        dataList = [];
        dataList.push(jTool.extend(tableData.data[0], {gm_checkbox: true}));
        dataList.push(jTool.extend(tableData.data[1], {gm_checkbox: false}));
        dataList.push(jTool.extend(tableData.data[2], {gm_checkbox: true}));
        dataList.push(jTool.extend(tableData.data[3], {gm_checkbox: false}));
        cache.setCheckedData('test', dataList);

        expect(cache.getCheckedData('test').length).toBe(2);
        expect(cache.getCheckedData('test')[0].id).toBe(92);
        expect(cache.getCheckedData('test')[1].id).toBe(89);

        // 将已存储的值修改为未选中状态
        dataList[2].gm_checkbox = false;
        cache.setCheckedData('test', dataList);
        expect(cache.getCheckedData('test').length).toBe(1);
        expect(cache.getCheckedData('test')[0].id).toBe(92);

        // 清空
        cache.setCheckedData('test', [], true);
        expect(cache.getCheckedData('test').length).toBe(0);
    });
});

describe('updateCheckedData', () => {
    let tableData = null;
    let columnMap = null;
    beforeEach(() => {
        columnMap = getColumnMap();
        tableData = getTableData().data;
    });
    afterEach(() => {
        tableData = null;
        columnMap = null;
        delete store.checkedData.test;
    });

    it('基础验证', () => {
        expect(cache.updateCheckedData).toBeDefined();
        expect(cache.updateCheckedData.length).toBe(4);
    });

    it('未存在选中数据时', () => {
        expect(store.checkedData['test']).toBeUndefined();
        cache.updateCheckedData('test', columnMap, 'id', [{id: 92, title: 'this is new title'}]);
        expect(store.checkedData['test']).toBeUndefined();
    });

    it('存在选中数据时', () => {
        store.checkedData = {
            test: [tableData[0], tableData[5]]
        };

        expect(store.checkedData['test'].length).toBe(2);
        expect(store.checkedData['test'][0].title).toBe('Content-Type 对照表');
        expect(store.checkedData['test'][1].title).toBe('js捕获错误信息');

        cache.updateCheckedData('test', columnMap, 'id', [{id: 92, title: 'this is new title'}]);
        expect(store.checkedData['test'].length).toBe(2);
        expect(store.checkedData['test'][0].title).toBe('this is new title');
        expect(store.checkedData['test'][1].title).toBe('js捕获错误信息');
    });
});

describe('getMemoryKey', () => {
    beforeEach(() => {
        // 在测试中不能对pathname进行修改，该值默认为/context.html， 如果修改的话将会报出如下错误: Some of your tests did a full page reload!
        // window.location.pathname = '/context.html';
        window.location.hash = '#userList';
    });
    afterEach(() => {
        // window.location.pathname = null;
        window.location.hash = null;
    });

    it('基础验证', () => {
        expect(cache.getMemoryKey).toBeDefined();
        expect(cache.getMemoryKey.length).toBe(1);
    });

    it('执行验证', () => {
        expect(cache.getMemoryKey('test')).toBe('/context.html#userList-test');
    });
});

describe('getUserMemory', () => {
    beforeEach(() => {
        // 在测试中不能对pathname进行修改，该值默认为/context.html， 如果修改的话将会报出如下错误: Some of your tests did a full page reload!
        // window.location.pathname = '/context.html';
        window.location.hash = '#userList';
        window.localStorage.removeItem(MEMORY_KEY);
        document.body.innerHTML = tableTestTpl;
    });
    afterEach(() => {
        // window.location.pathname = null;
        window.location.hash = null;
        window.localStorage.removeItem(MEMORY_KEY);
        document.body.innerHTML = null;
    });

    it('基础验证', () => {
        expect(cache.getUserMemory).toBeDefined();
        expect(cache.getUserMemory.length).toBe(1);
    });

    it('当前key值无效', () => {
        expect(cache.getUserMemory('undefined')).toEqual({});
    });

    it('当前无存储字段', () => {
        expect(cache.getUserMemory('test')).toEqual({});
        expect(document.querySelector('table').getAttribute(CACHE_ERROR_KEY)).toBe('error');
    });

    it('当前有存储字段，但当前表无存储', () => {
        window.localStorage.setItem(MEMORY_KEY, JSON.stringify({
            otherTable: JSON.stringify({column: getColumnMap(), page: {pSize: 20}})
        }));
        expect(cache.getUserMemory('test')).toEqual({});
    });
});

describe('saveUserMemory', () => {
    let settings = null;
    beforeEach(() => {
        // 在测试中不能对pathname进行修改，该值默认为/context.html， 如果修改的话将会报出如下错误: Some of your tests did a full page reload!
        // window.location.pathname = '/context.html';
        window.location.hash = '#userList';
        window.localStorage.removeItem(MEMORY_KEY);
        document.body.innerHTML = tableTestTpl;
        settings = {
            disableCache: false,
            gridManagerName: 'test',
            columnMap: getColumnMap(),
            supportAjaxPage: true,
            pageData: {
                cPage: 1,
                pSize: 20,
                tPage: 3,
                tSize: 54
            },
            pageSizeKey: 'pSize'
        };
    });
    afterEach(() => {
        // window.location.pathname = null;
        window.location.hash = null;
        window.localStorage.removeItem(MEMORY_KEY);
        document.body.innerHTML = null;
        settings = null;
        store.settings = {};
    });

    it('基础验证', () => {
        expect(cache.saveUserMemory).toBeDefined();
        expect(cache.saveUserMemory.length).toBe(1);
    });

    it('缓存被禁用', () => {
        settings.disableCache = true;
        expect(cache.saveUserMemory(settings)).toBeUndefined();
        expect(cache.getUserMemory('test')).toEqual({});
    });

    it('当前未存在其它存储', () => {
        cache.saveUserMemory(settings);
        expect(cache.getUserMemory('test')).toEqual({column: getColumnMap(), page: {pSize: 20}});
    });

    it('当前已存在其它存储', () => {
        window.localStorage.setItem(MEMORY_KEY, JSON.stringify({
            '/context.html#userList-otherTable': JSON.stringify({column: getColumnMap(), page: {pSize: 20}})
        }));
        cache.saveUserMemory(settings);
        expect(cache.getUserMemory('test')).toEqual({column: getColumnMap(), page: {pSize: 20}});
    });

    it('type === undefined', () => {
        settings.columnMap.title.remind = undefined;
        cache.saveUserMemory(settings);
        expect(cache.getUserMemory('test').column.title.remind).toBeUndefined();
    });

    it('type === function', () => {
        settings.columnMap.title.template = () => {};
        cache.saveUserMemory(settings);
        expect(cache.getUserMemory('test').column.title.template).toBeUndefined();
    });

    it('type === object', () => {
        settings.columnMap.title.template = {};
        cache.saveUserMemory(settings);
        expect(cache.getUserMemory('test').column.title.template).toBeUndefined();
    });
});

describe('delUserMemory', () => {
    let settings = null;
    beforeEach(() => {
        // 在测试中不能对pathname进行修改，该值默认为/context.html， 如果修改的话将会报出如下错误: Some of your tests did a full page reload!
        // window.location.pathname = '/context.html';
        window.location.hash = '#userList';
        window.localStorage.removeItem(MEMORY_KEY);
        document.body.innerHTML = tableTestTpl;
        settings = {
            disableCache: false,
            gridManagerName: 'test',
            columnMap: getColumnMap(),
            supportAjaxPage: true,
            pageData: {
                cPage: 1,
                pSize: 20,
                tPage: 3,
                tSize: 54
            },
            pageSizeKey: 'pSize'
        };
        console._log = console.log;
        console.log = jasmine.createSpy('log');
    });
    afterEach(() => {
        // window.location.pathname = null;
        window.location.hash = null;
        window.localStorage.removeItem(MEMORY_KEY);
        document.body.innerHTML = null;
        store.settings = {};
        // 还原console
        console.log = console._log;
        settings = null;
    });

    it('基础验证', () => {
        expect(cache.delUserMemory).toBeDefined();
        expect(cache.delUserMemory.length).toBe(1);
    });

    it('当前无用户记忆', () => {
        expect(cache.delUserMemory('test')).toBe(false);
    });

    it('定点清除', () => {
        window.localStorage.setItem(MEMORY_KEY, JSON.stringify({
            '/context.html#userList-otherTable': JSON.stringify({column: getColumnMap(), page: {pSize: 20}}),
            '/context.html#userList-test': JSON.stringify({column: getColumnMap(), page: {pSize: 20}})
        }));
        cache.saveUserMemory(settings);
        expect(cache.delUserMemory('test')).toBe(true);
        expect(JSON.parse(window.localStorage.getItem(MEMORY_KEY))['/context.html#userList-otherTable']).toBe(JSON.stringify({column: getColumnMap(), page: {pSize: 20}}));
        expect(JSON.parse(window.localStorage.getItem(MEMORY_KEY))['/context.html#userList-test']).toBeUndefined();

        expect(console.log).toHaveBeenCalledWith('%c GridManager Info %c delete user memory of test ', ...CONSOLE_STYLE[CONSOLE_INFO]);
    });

    it('清除所有', () => {
        window.localStorage.setItem(MEMORY_KEY, JSON.stringify({
            '/context.html#userList-otherTable': JSON.stringify({column: getColumnMap(), page: {pSize: 20}}),
            '/context.html#userList-test': JSON.stringify({column: getColumnMap(), page: {pSize: 20}})
        }));
        cache.saveUserMemory(settings);
        expect(cache.delUserMemory()).toBe(true);
        expect(window.localStorage.getItem(MEMORY_KEY)).toBe(null);

        expect(console.log).toHaveBeenCalledWith('%c GridManager Info %c delete user memory of all ', ...CONSOLE_STYLE[CONSOLE_INFO]);
    });
});

describe('updateTemplate', () => {
    let arg = null;
    beforeEach(() => {
        arg = {
            disableCache: false,
            emptyTemplate: 'test',
            columnData: [
                {
                    key: 'one',
                    text: 'one'
                },
                {
                    key: 'two',
                    text: 'two',
                    template: 'two'
                },
                {
                    key: 'three',
                    text: 'three',
                    template: () => {
                        return 'three';
                    }
                },
                {
                    key: 'four',
                    text: () => {
                        return 'four';
                    },
                    template: 'four'
                }
            ]
        };
    });
    afterEach(() => {
        arg = null;
    });

    it('基础验证', () => {
        expect(cache.updateTemplate).toBeDefined();
        expect(cache.updateTemplate.length).toBe(1);
    });

    it('执行验证', () => {
        arg =  cache.updateTemplate(arg);
        expect(arg.disableCache).toBe(false);
        expect(arg.emptyTemplate()).toEqual('test');

        expect(arg.columnData[0].text()).toEqual('one');
        expect(arg.columnData[0].template).toBeUndefined();

        expect(arg.columnData[1].text()).toEqual('two');
        expect(arg.columnData[1].template()).toEqual('two');

        expect(arg.columnData[2].text()).toEqual('three');
        expect(arg.columnData[2].template()).toEqual('three');

        expect(arg.columnData[3].text()).toEqual('four');
        expect(arg.columnData[3].template()).toEqual('four');
    });

});

describe('initSettings', () => {
    let arg = null;
    let settings = null;
    let columnData = null;
    let columnMap = null;
    let checkboxColumnFn = null;
    let orderColumnFn = null;
    beforeEach(() => {
        // 在测试中不能对pathname进行修改，该值默认为/context.html， 如果修改的话将会报出如下错误: Some of your tests did a full page reload!
        // window.location.pathname = '/context.html';
        window.location.hash = '#userList';
        window.localStorage.removeItem(MEMORY_KEY);
        document.body.innerHTML = tableTestTpl;
        columnData = getColumnData();
        columnMap = getColumnMap();
        arg = {
            gridManagerName: 'test',
            ajaxData: 'https://www.lovejavascript.com/blogManager/getBlogList',
            ajaxType: 'POST',
            columnData: columnData
        };
        console._log = console.log;
        console.log = jasmine.createSpy('log');

        checkboxColumnFn = settings => {
            return {
                key: 'gm_checkbox',
                text: '',
                isAutoCreate: true,
                isShow: true,
                disableCustomize: true,
                width: CHECKBOX_WIDTH,
                align: 'center',
                template: checked => {
                    return this.getColumnTemplate({checked, useRadio: settings.useRadio});
                }
            };
        };
        orderColumnFn = settings => {
            return {
                key: 'gm_order',
                text: i18n.getText(settings, 'order-text'),
                isAutoCreate: true,
                isShow: true,
                disableCustomize: true,
                width: ORDER_WIDTH,
                align: 'center',
                template: nodeData => {
                    return `<td gm-order="true" gm-create="true">${nodeData}</td>`;
                }
            };
        };
    });
    afterEach(() => {
        window.location.hash = null;
        window.localStorage.removeItem(MEMORY_KEY);
        document.body.innerHTML = null;
        arg = null;
        settings = null;
        store.settings = {};
        columnData = null;
        columnMap = null;
        // 还原console
        console.log = console._log;
        checkboxColumnFn = null;
        orderColumnFn = null;
    });

    it('基础验证', () => {
        expect(cache.initSettings).toBeDefined();
        expect(cache.initSettings.length).toBe(3);
    });

    it('默认配置', () => {
        // settings 中对默认值都已经测试过了，这里只挑部分项进行测试
        settings = cache.initSettings(arg, checkboxColumnFn, orderColumnFn);
        expect(settings.gridManagerName).toBe('test');
        expect(settings.supportAdjust).toBe(true);
        expect(settings.supportAjaxPage).toBe(false);

        expect(settings.columnData).toEqual(columnData);

        // columnMap中存在template，该项未在这里进行测试
        expect(Object.keys(settings.columnMap)).toEqual(Object.keys(columnMap));
    });

    it('异常配置: 丢失key', () => {
        arg.supportAutoOrder = false;
        arg.supportCheckbox = false;
        delete arg.columnData[0].key;
        settings = cache.initSettings(arg, checkboxColumnFn, orderColumnFn);
        expect(settings).toBe(false);
        expect(console.log).toHaveBeenCalledWith('%c GridManager Error %c columnData[0].key undefined ', ...CONSOLE_STYLE[CONSOLE_ERROR]);
    });

    it('异常配置: 存在disableCustomize但无width', () => {
        // 第8行数据存在disableCustomize配置
        delete arg.columnData[7].width;
        expect(cache.initSettings(arg, checkboxColumnFn, orderColumnFn)).toBe(false);
        expect(console.log).toHaveBeenCalledWith('%c GridManager Error %c column action: when disableCustomize exists, width must be set ', ...CONSOLE_STYLE[CONSOLE_ERROR]);
    });

    it('开启缓存:当前无用户记忆', () => {
        // 当前无用户记忆
        arg.disableCache = false;
        settings = cache.initSettings(arg, checkboxColumnFn, orderColumnFn);
        expect(settings.columnMap.pic.width).toBe('110px');
    });

    it('开启缓存: 当前有用户记忆', () => {
        columnMap.pic.width = '120px';
        window.localStorage.setItem(MEMORY_KEY, JSON.stringify({
            '/context.html#userList-test': JSON.stringify({column: columnMap, page: {pSize: 20}})
        }));

        arg.disableCache = false;
        settings = cache.initSettings(arg, checkboxColumnFn, orderColumnFn);
        expect(settings.columnMap.pic.width).toBe('120px');
    });

    it('开启缓存: 与用户记忆数量不匹配', () => {
        delete columnMap.pic;
        window.localStorage.setItem(MEMORY_KEY, JSON.stringify({
            '/context.html#userList-test': JSON.stringify({column: columnMap, page: {pSize: 20}})
        }));

        arg.disableCache = false;
        settings = cache.initSettings(arg, checkboxColumnFn, orderColumnFn);
        expect(console.log).toHaveBeenCalledWith('%c GridManager Info %c delete user memory of test ', ...CONSOLE_STYLE[CONSOLE_INFO]);
    });

    it('开启缓存: 与用户记忆项不匹配', () => {
        columnMap.pic.__width = '120px';
        window.localStorage.setItem(MEMORY_KEY, JSON.stringify({
            '/context.html#userList-test': JSON.stringify({column: columnMap, page: {pSize: 20}})
        }));

        arg.disableCache = false;
        settings = cache.initSettings(arg, checkboxColumnFn, orderColumnFn);
        expect(console.log).toHaveBeenCalledWith('%c GridManager Info %c delete user memory of test ', ...CONSOLE_STYLE[CONSOLE_INFO]);
    });
});

describe('getSettings or setSettings', () => {
    let settings = null;
    beforeEach(() => {
        document.body.innerHTML = tableTestTpl;
        settings = {
            disableCache: false,
            gridManagerName: 'test',
            columnMap: getColumnMap(),
            supportAjaxPage: true,
            pageData: {
                cPage: 1,
                pSize: 20,
                tPage: 3,
                tSize: 54
            },
            pageSizeKey: 'pSize'
        };
    });
    afterEach(() => {
        store.settings = {};
        settings = null;
        document.body.innerHTML = null;
    });

    it('基础验证', () => {
        expect(cache.getSettings).toBeDefined();
        expect(cache.getSettings.length).toBe(1);

        expect(cache.setSettings).toBeDefined();
        expect(cache.setSettings.length).toBe(1);
    });

    it('settings 无值的情况', () => {
        expect(cache.getSettings('test')).toEqual({});
    });

    it('设置 settings，后再获取', () => {
        expect(cache.setSettings(settings)).toBeUndefined();

        expect(cache.getSettings('test')).toEqual(settings);
    });
});

describe('update', () => {
    let settings = null;
    let _settings = null;
    beforeEach(() => {
        document.body.innerHTML = tableTestTpl;
        settings = {
            disableCache: false,
            gridManagerName: 'test',
            columnMap: getColumnMap(),
            supportAjaxPage: true,
            pageData: {
                cPage: 1,
                pSize: 20,
                tPage: 3,
                tSize: 54
            },
            pageSizeKey: 'pSize'
        };
        store.settings['test'] = settings;
    });
    afterEach(() => {
        store.settings = {};
        settings = null;
        _settings = null;
        document.body.innerHTML = null;
    });

    it('基础验证', () => {
        expect(cache.update).toBeDefined();
        expect(cache.update.length).toBe(1);
    });

    it('执行验证', () => {
        _settings = cache.update('test');
        expect(_settings.gridManagerName).toBe(settings.gridManagerName);
        expect(_settings.supportAjaxPage).toBe(settings.supportAjaxPage);
        expect(_settings.pageSizeKey).toBe(settings.pageSizeKey);
        expect(_settings.pageData).toEqual(settings.pageData);

        // todo 单元测试中，对dom的验证存在问题
        // expect(_settings.columnMap).toEqual(settings.columnMap);
    });
});


describe('verifyVersion', () => {
    beforeEach(() => {
        console._log = console.log;
        console.log = jasmine.createSpy('log');
    });
    afterEach(() => {
        console.log = console._log;
        console._log = null;
    });

    it('基础验证', () => {
        expect(cache.verifyVersion).toBeDefined();
        expect(cache.verifyVersion.length).toBe(0);
    });

    it('当前为第一次渲染', () => {
        // 当前为第一次渲染
        window.localStorage.removeItem(VERSION_KEY);
        expect(window.localStorage.getItem(VERSION_KEY)).toBeNull();
        cache.verifyVersion();
        expect(window.localStorage.getItem(VERSION_KEY)).toBe(store.version);

        // 版本变更
        localStorage.setItem(VERSION_KEY, -1);
        cache.verifyVersion();
        expect(localStorage.getItem(VERSION_KEY)).toBe(store.version);
        expect(console.log).toHaveBeenCalledWith('%c GridManager Info %c delete user memory of all ', ...CONSOLE_STYLE[CONSOLE_INFO]);

        window.localStorage.removeItem(VERSION_KEY);
    });
});


describe('clear', () => {
    beforeEach(() => {
        store.scope['test'] = {};
        store.responseData['test'] = {};
        store.checkedData['test'] = {};
        store.settings['test'] = {};
    });
    afterEach(() => {
        store.scope = {};
        store.responseData = {};
        store.checkedData = {};
        store.settings = {};
    });

    it('基础验证', () => {
        expect(cache.clear).toBeDefined();
        expect(cache.clear.length).toBe(1);
    });

    it('执行验证', () => {
        expect(store.scope['test']).toEqual({});
        expect(store.responseData['test']).toEqual({});
        expect(store.checkedData['test']).toEqual({});
        expect(store.settings['test']).toEqual({});

        cache.clear('test');
        expect(store.scope['test']).toBeUndefined();
        expect(store.responseData['test']).toBeUndefined();
        expect(store.checkedData['test']).toBeUndefined();
        expect(store.settings['test']).toBeUndefined();
    });
});
