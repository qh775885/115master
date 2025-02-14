import { GM_info, GM_openInTab } from "$";

export const checkUserAgent = () => {
    const userAgent = navigator.userAgent;
    const is115Browser = userAgent.includes('115Browser/27');
    if(!is115Browser) {

        const msg = `115Master脚本启动失败\n脚本不支持【115浏览器v27+】 以外版本的浏览器！\n您需要【更换浏览器】或者修改【User-Agent】\n请查看【安装说明】 ${GM_info.script.homepage}\n\n你的浏览器版本：${userAgent}`
        alert(msg);

        GM_openInTab('https://github.com/cbingb666/115master?tab=readme-ov-file#%E5%AE%89%E8%A3%85', {
            active: true,
        })

        throw new Error(msg);
    }
}