import { workspace, TreeDataProvider, Event, EventEmitter, TreeItem, window } from 'vscode';
import FundItem from './TreeItem';
import fundApi from './api';

export default class DataProvider implements TreeDataProvider<FundInfo> {
    private refreshEvent: EventEmitter<FundInfo | null> = new EventEmitter<FundInfo | null>();
    readonly onDidChangeTreeData: Event<FundInfo | null> = this.refreshEvent.event;

    // 更新配置
    updateConfig(funds: string[]) {
        const config = workspace.getConfiguration();
        const favorites = Array.from(
            new Set([
                ...config.get('my-fund.favorites', []),
                ...funds,
            ])
        );
        config.update('my-fund.favorites', favorites, true);
    }

    // 删除配置
    removeConfig(code: string) {
        const config = workspace.getConfiguration();
        const favorites: string[] = [...config.get('my-fund.favorites', [])];
        const index = favorites.indexOf(code);
        if (index === -1) {
            return;
        }
        favorites.splice(index, 1);
        config.update('my-fund.favorites', favorites, true);
    }

    async addFund() {
        // 弹出输入框
        const res = await window.showInputBox({
            value: '',
            valueSelection: [5, -1],
            prompt: '添加基金到自选',
            placeHolder: 'Add Fund To Favorite',
            validateInput: (inputCode: string) => {
                const codeArray = inputCode.split(/[\W]/);
                const hasError = codeArray.some((code) => {
                    return code !== '' && !/^\d+$/.test(code);
                });
                return hasError ? '基金代码输入有误' : null;
            },
        });
        if (!!res) {
            
            const codeArray = res.split(/[\W]/) || [];
            console.log(res, codeArray);
            const result = await fundApi([...codeArray]);
            if (result && result.length > 0) {
                // 只更新能正常请求的代码
                const codes = result.map(i => i.code);
                this.updateConfig(codes);
                this.refresh();
            } else {
                window.showWarningMessage('stocks not found');
            }
        }
    }


    refresh() {
        setTimeout(() => {
            // 触发onDidChangeTreeData
            this.refreshEvent.fire(null);
        }, 200);
    }

    getTreeItem(info: FundInfo): TreeItem {
        return new FundItem(info);
    }

    getChildren(): Promise<FundInfo[]> {
        const favorites: string[] = workspace
            .getConfiguration()
            .get('my-fund.favorites', []);

        // 获取基金数据
        return fundApi([...favorites]).then(
            (results: FundInfo[]) => results.sort(
                (prev, next) => (prev.changeRate >= next.changeRate ? 1 : -1)
            )
        );
    }
}
