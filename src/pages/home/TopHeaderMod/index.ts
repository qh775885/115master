// 顶部导航栏修改器
export class TopHeaderMod {
	constructor() {
		this.init();
	}

	get topHeaderNode() {
		return document.querySelector("#js_top_panel_box")
			?.firstElementChild as HTMLElement;
	}

	private init() {
		const offlineTaskButton = this.createOfflineTaskButton();
		this.topHeaderNode?.prepend(offlineTaskButton);
	}

	// 创建离线任务按钮
	private createOfflineTaskButton() {
		const button = document.createElement("a");
		button.classList.add("button");
		button.href = "javascript:void(0)";
		button.innerHTML = `
            <i class="icon-operate ifo-linktask"></i>
            <span>云下载</span>
        `;
		button.style.background = "#3a4783";
		button.style.borderColor = "#3a4783";
		button.onclick = () => {
			// @ts-ignore
			window.top.Core.FileMenu.DoEvent([], "offline_task", null);
		};
		return button;
	}

	public destroy() {}
}
