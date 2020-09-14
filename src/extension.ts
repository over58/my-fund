import { ExtensionContext, commands, window, workspace } from 'vscode';
import Provider from './Provider';

// 激活插件
export function activate(context: ExtensionContext) {
	// 获取 interval 配置
	let interval = workspace.getConfiguration().get('my-fund.interval', 2);
	if (interval < 2) {
		interval = 2;
	}

	// 基金类	
	const provider = new Provider();

	// 数据注册
	window.registerTreeDataProvider('fund-list', provider);

	// 定时更新
	setInterval(() => {
		provider.refresh();
	}, interval * 1000);


	// 注册命令
	context.subscriptions.push(
		commands.registerCommand('fund.add', () => {
			provider.addFund();
		}),
		commands.registerCommand('fund.refresh', () => {
			provider.refresh();
		}),
		commands.registerCommand('fund.item.remove', (fund) => {
			const { code } = fund;
			provider.removeConfig(code);
			provider.refresh();
		})
	);
	
}

// this method is called when your extension is deactivated
export function deactivate() {}
