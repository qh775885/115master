import dayjs from "dayjs";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import { JAV_SOURCE, type JavInfo } from "../../../utils/jav/jav";
import icoJavBus from "../../ico/icoJavBus.ico";
import icoJavDB from "../../ico/icoJavdb.ico";
import { iconSeparator } from "../../icons/icons";
import "photoswipe/style.css";
import type DPlayer from "dplayer";

const JAV_ICONS = {
	[JAV_SOURCE.JAVBUS]: icoJavBus,
	[JAV_SOURCE.JAVDB]: icoJavDB,
};

/**
 * 番号信息渲染器
 */
export class JavInfoRenderer {
	constructor(private dplayer: DPlayer) {}

	registerPreviewImages() {
		const lightbox = new PhotoSwipeLightbox({
			appendToEl: this.dplayer.container,
			gallery: ".dplayer-panel-preview",
			children: ".dplayer-panel-preview-item",
			mouseMovePan: true,
			initialZoomLevel: "fit",
			wheelToZoom: true,
			pswpModule: () => import("photoswipe"),
		});
		lightbox.init();
		lightbox.addFilter("domItemData", (itemData, element) => {
			itemData.width = element.querySelector("img")?.naturalWidth;
			itemData.height = element.querySelector("img")?.naturalHeight;
			return itemData;
		});
	}

	render(javInfos: JavInfo[]): string {
		const sources = [...new Set(javInfos.map((info) => info.source))];

		if (sources.length === 0) {
			return "";
		}

		return `
            <div class="dplayer-panel-tabs">
                <div class="dplayer-panel-tab-headers">
                    ${sources.map((source, index) => this.renderTabHeader(source, index)).join("")}
                </div>
                ${sources.map((source, index) => this.renderTabContent(source, index, javInfos)).join("")}
            </div>
        `;
	}

	private renderTabHeader(source: string, index: number): string {
		return `
            <div class="dplayer-panel-tab-header ${index === 0 ? "active" : ""}" 
                 data-tab="${source}">
                <img src="${JAV_ICONS[source as JAV_SOURCE]}" alt="${source}" />
                ${source}
            </div>
        `;
	}

	private renderTabContent(
		source: string,
		index: number,
		javInfos: JavInfo[],
	): string {
		return `
            <div class="dplayer-panel-tab-content ${index === 0 ? "active" : ""}"
                 data-tab="${source}">
                <div class="dplayer-panel-tab-content-left">
                    ${javInfos
											.filter((info) => info.source === source)
											.map((info) => this.renderInfoItems(info))
											.join("")}
                </div>
                <div class="dplayer-panel-tab-content-right">
                    ${this.renderPreviewImages(javInfos.filter((info) => info.source === source))}
                </div>
            </div>
        `;
	}

	private renderInfoItems(info: JavInfo): string {
		const items = [
			{
				condition: info.title && info.url,
				render: () =>
					this.renderContentItem(
						"",
						`<a href="${info.url}" target="_blank" rel="noopener noreferrer">${info.title}</a>`,
					),
			},
			{
				condition: info.avNumber,
				render: () => this.renderContentItem("番号：", info.avNumber),
			},
			{
				condition: info.actors?.length,
				render: () =>
					this.renderContentItem(
						"演员：",
						info.actors
							?.map(
								(i) =>
									`<a href="${i.url}" target="_blank" rel="noopener noreferrer">${i.name}</a>`,
							)
							.join(","),
					),
			},
			{
				condition: info.director?.length,
				render: () =>
					this.renderContentItem(
						"导演：",
						info.director
							?.map(
								(i) =>
									`<a href="${i.url}" target="_blank" rel="noopener noreferrer">${i.name}</a>`,
							)
							.join(","),
					),
			},
			{
				condition: info.date,
				render: () =>
					this.renderContentItem(
						"日期：",
						dayjs(info.date).format("YYYY-MM-DD"),
					),
			},
			{
				condition: info.duration,
				render: () => this.renderContentItem("时长：", `${info.duration} 分钟`),
			},
			{
				condition: info.studio?.length,
				render: () =>
					this.renderContentItem(
						"片商：",
						info.studio
							?.map(
								(i) =>
									`<a href="${i.url}" target="_blank" rel="noopener noreferrer">${i.name}</a>`,
							)
							.join(iconSeparator),
					),
			},
			{
				condition: info.publisher?.length,
				render: () =>
					this.renderContentItem(
						"发行商：",
						info.publisher
							?.map(
								(i) =>
									`<a href="${i.url}" target="_blank" rel="noopener noreferrer">${i.name}</a>`,
							)
							.join(iconSeparator),
					),
			},
			{
				condition: info.series?.length,
				render: () =>
					this.renderContentItem(
						"系列：",
						info.series
							?.map(
								(i) =>
									`<a href="${i.url}" target="_blank" rel="noopener noreferrer">${i.name}</a>`,
							)
							.join(iconSeparator),
					),
			},
			{
				condition: info.category?.length,
				render: () =>
					this.renderContentItem(
						"类别：",
						info.category
							?.map(
								(i) =>
									`<a href="${i.url}" target="_blank" rel="noopener noreferrer">${i.name}</a>`,
							)
							.join(iconSeparator),
					),
			},
			{
				condition: info.score,
				render: () => this.renderContentItem("评分：", info.score),
			},
			{
				condition: info.scoreCount,
				render: () => this.renderContentItem("评价人数：", info.scoreCount),
			},
			{
				condition: info.viewCount,
				render: () => this.renderContentItem("观看人数：", info.viewCount),
			},
			{
				condition: info.downloadCount,
				render: () => this.renderContentItem("下载人数：", info.downloadCount),
			},
		];

		return items
			.filter((item) => item.condition)
			.map((item) => item.render())
			.join("");
	}

	private renderContentItem(
		label: string,
		value: string | number | undefined,
	): string {
		return `
            <div class="dplayer-panel-content-item">
                ${label ? `<span class="dplayer-panel-content-label">${label}</span>` : ""}
                <span class="dplayer-panel-content-value">${value}</span>
            </div>
        `;
	}

	private renderPreviewImages(infos: JavInfo[]): string {
		return infos
			.map(
				(info) => `
            <div class="dplayer-panel-preview">
                ${[{ raw: info.cover }, ...(info.preview ?? [])]
									.map(
										(img, index) => `
                    <a href="${img.raw}" class="dplayer-panel-preview-item" onclick="event.preventDefault();"
                        data-cropped="true'
                        target="_blank">
                        <img src="${img.raw}" 
                                alt="preview" 
                                loading="lazy" />
                    </a>
                `,
									)
									.join("")}
            </div>
        `,
			)
			.join("");
	}
}
