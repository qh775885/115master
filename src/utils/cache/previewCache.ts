import type { Preview } from "../../hooks/usePreview";
import { CacheCore } from "./core/index";

type PreviewCacheValue = Preview;

const PREVIEW_CACHE_KEY = "preview_cache_v2";
class PreviewCache extends CacheCore<PreviewCacheValue> {
	constructor() {
		super({
			storeName: PREVIEW_CACHE_KEY,
		});
	}
}

export const previewCache = new PreviewCache();
