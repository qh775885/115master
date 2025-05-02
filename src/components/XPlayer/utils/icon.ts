import VolumeDown from "@material-symbols/svg-400/rounded/volume_down.svg?component";
import VolumeMute from "@material-symbols/svg-400/rounded/volume_mute.svg?component";
import VolumeOff from "@material-symbols/svg-400/rounded/volume_off.svg?component";
import VolumeUp from "@material-symbols/svg-400/rounded/volume_up.svg?component";

/**
 * 获取音量图标
 * @param volume 音量
 * @param muted 是否静音
 * @returns 音量图标
 */
export const getVolumeIcon = (volume = 0, muted = false) => {
	if (muted) {
		return VolumeOff;
	}

	if (volume === 0) {
		return VolumeMute;
	}

	if (volume < 50) {
		return VolumeDown;
	}

	if (volume >= 50) {
		return VolumeUp;
	}

	return VolumeUp;
};
