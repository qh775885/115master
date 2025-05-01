import { GM_openInTab } from "$";
import {
	APS_URL_115,
	NORMAL_URL_115,
	PRO_API_URL_115,
	VOD_URL_115,
	WEB_API_URL_115,
} from "../../constants/115";
import { qualityCodeMap } from "../../constants/quality";
import type { M3u8Item } from "../../types/player";
import { AppLogger } from "../logger";
import { is115Browser } from "../platform";
import { fetchRequest } from "../request/fetchRequest";
import { GMRequest } from "../request/gmRequst";
import { getXUrl } from "../url";
import type { NormalApi, ProApi, WebApi } from "./api";
import { Crypto115 } from "./crypto";

export interface DownloadResult {
	url: {
		auth_cookie?: {
			expire: string;
			name: string;
			path: string;
			value: string;
		};
		url: string;
	};
}

// TODO: 超时登录错误 errNo 990001
// TODO: 验证账号弹窗被拦截 911
export class Drive115Core {
	private BASE_URL = NORMAL_URL_115;
	private WEB_API_URL = WEB_API_URL_115;
	private PRO_API_URL = PRO_API_URL_115;
	private VOD_URL_115 = VOD_URL_115;
	private APS_URL_115 = APS_URL_115;
	// 加密
	protected crypto115 = new Crypto115();
	// 日志
	private logger = new AppLogger("Drive115Core");
	// 是否正在验证
	private verifying = false;

	// 跳转验证
	private jumpVerify(pickcode: string) {
		if (this.verifying) {
			return;
		}
		this.verifying = true;
		alert("你已经高频操作了!\n先去通过一下人机验证再回来刷新页面哦~");
		GM_openInTab(new URL(`?pickcode=${pickcode}`, this.VOD_URL_115).href, {
			active: true,
		});
	}

	// 获取原文件地址 (普通下载，有限制下载大小)
	public async webApiFilesDownload(pickcode: string): Promise<DownloadResult> {
		const response = await fetchRequest.get(
			new URL(`/files/download?pickcode=${pickcode}`, this.WEB_API_URL).href,
		);

		const res = (await response.json()) as WebApi.Res.FilesDownload;

		if (res.errNo === 990001) {
			alert("登录已过期，请重新登录");
		}

		if (!res.state || !res.file_url) {
			throw new Error(`服务器返回数据格式错误: ${JSON.stringify(res)}`);
		}

		return {
			url: {
				url: res.file_url,
			},
		};
	}

	// 获取原文件地址 (Pro 下载，无限制下载大小)
	public async ProPostAppChromeDownurl(
		pickcode: string,
	): Promise<DownloadResult> {
		const tm = Math.floor(Date.now() / 1000).toString();
		const src = JSON.stringify({ pickcode });
		const encoded = this.crypto115.m115_encode(src, tm);

		const data = `data=${encodeURIComponent(encoded.data)}`;
		this.logger.log("发送加密数据:", data);

		// 115Browser 需要使用 GMRequest，因为 115 会检查 ua 是否是 115Browser，请求这个接口返回重定向到 dl.115cdn.net，导致跨域无法获取到返回结果
		const request = is115Browser ? new GMRequest() : fetchRequest;
		const response = await request.post(
			new URL(`/app/chrome/downurl?t=${tm}`, this.PRO_API_URL).href,
			{
				body: data,
			},
		);

		const res = (await response.json()) as ProApi.Res.FilesAppChromeDownurl;
		this.logger.log("Pro方式响应:", res);

		if (!res.state) {
			throw new Error(`获取下载地址失败: ${JSON.stringify(res)}`);
		}

		const result = JSON.parse(
			this.crypto115.m115_decode(res.data, encoded.key),
		);
		const downloadInfo = Object.values(result)[0] as DownloadResult;

		return downloadInfo;
	}

	// 获取 m3u8 根 url
	public getM3u8Url(pickcode: string): string {
		return new URL(`/api/video/m3u8/${pickcode}.m3u8`, this.BASE_URL).href;
	}

	// 解析 m3u8 列表
	public async getM3u8Info(url: string, pickcode: string): Promise<M3u8Item[]> {
		const response = await fetchRequest.get(url, {
			headers: {
				"Content-Type": "application/json",
			},
		});

		const htmlText = await response.text();
		if (!/^#/.test(htmlText)) {
			const res = JSON.parse(htmlText) as NormalApi.Res.VideoM3u8;
			if (res.state === false) {
				if (res.code === 911) {
					this.jumpVerify(pickcode);
				}
				throw new Error(`获取m3u8文件失败: ${res.error}`);
			}
		}
		const lines = htmlText.split("\n");
		const m3u8List: M3u8Item[] = [];

		htmlText.split("\n").forEach((line, index) => {
			if (line.includes('NAME="')) {
				const extXStreamInf = line.match(/#EXT-X-STREAM-INF/);
				if (extXStreamInf) {
					const name = line.match(/NAME="([^"]*)"/)?.[1] ?? "";
					const url = lines[index + 1]?.trim();
					m3u8List.push({
						name,
						quality:
							qualityCodeMap[name as unknown as keyof typeof qualityCodeMap],
						url: getXUrl(url),
					});
				}
			}
		});

		// 按照 UD HD BD 排序
		m3u8List.sort((a, b) => b.quality - a.quality);
		this.logger.log("m3u8List result", m3u8List);
		return m3u8List;
	}

	// 获取文件列表 (以前老旧的文件夹需要使用它来获取)
	public async ApsGetNatsortFiles(params: WebApi.Req.GetFiles) {
		const response = await fetchRequest.get(
			new URL("/natsort/files.php", this.APS_URL_115).href,
			{
				params,
			},
		);
		return (await response.json()) as WebApi.Res.Files;
	}

	// 获取文件列表
	public async webApiGetFiles(params: WebApi.Req.GetFiles) {
		const response = await fetchRequest.get(
			new URL("/files", this.WEB_API_URL).href,
			{
				params,
			},
		);

		return (await response.json()) as WebApi.Res.Files;
	}

	// 获取视频文件信息
	public async webApiGetFilesVideo(params: WebApi.Req.GetFilesVideo) {
		const response = await fetchRequest.get(
			new URL("/files/video", this.WEB_API_URL).href,
			{
				params,
			},
		);

		return (await response.json()) as WebApi.Res.FilesVideo;
	}

	// 获取播放历史
	public async webApiGetWebApiFilesHistory(params: WebApi.Req.GetFilesHistory) {
		const response = await fetchRequest.get(
			new URL("/files/history", this.WEB_API_URL).href,
			{
				params,
			},
		);

		return (await response.json()) as WebApi.Res.FilesHistory;
	}

	// 更新播放历史
	public async webApiPostWebApiFilesHistory(data: WebApi.Req.PostFilesHistory) {
		const response = await fetchRequest.post(
			new URL("/files/history", this.WEB_API_URL).href,
			{
				data,
			},
		);

		return (await response.json()) as WebApi.Res.FilesHistory;
	}

	// 文件收藏
	public async webApiPostFilesStar(
		params: WebApi.Req.FilesStar,
	): Promise<WebApi.Res.FilesStar> {
		const response = await fetchRequest.post(
			new URL("/files/star", this.WEB_API_URL).href,
			{
				data: params,
			},
		);

		return (await response.json()) as WebApi.Res.FilesStar;
	}

	// 获取电影字幕
	public async webApiGetMoviesSubtitle(params: WebApi.Req.GetMoviesSubtitle) {
		const response = await fetchRequest.get(
			new URL("/movies/subtitle", this.WEB_API_URL).href,
			{
				params,
			},
		);

		return (await response.json()) as WebApi.Res.MoviesSubtitle;
	}
}
