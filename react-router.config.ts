import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/config';

export default {
	appDirectory: './src/app',
	ssr: true,
	presets: [vercelPreset()],
} satisfies Config;
