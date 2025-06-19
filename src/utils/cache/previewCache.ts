import type { PreviewRaw } from "../../hooks/usePreview";
import { CacheCore } from "./core/index";

type PreviewCacheValue = PreviewRaw;

const PREVIEW_CACHE_KEY = "preview_cache_v3";
class PreviewCache extends CacheCore<PreviewCacheValue> {
	constructor() {
		super({
			storeName: PREVIEW_CACHE_KEY,
		});
	}
}

export const previewCache = new PreviewCache();
