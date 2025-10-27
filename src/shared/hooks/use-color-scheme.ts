import { useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

import type { ThemeName } from '@/core/store/slices/themeSlice';
import { useThemeStore } from '@/core/store/slices/themeSlice';

export function useColorScheme(): ThemeName {
	const deviceColorScheme = useDeviceColorScheme();
	const themePreference = useThemeStore((state) => state.themePreference);
	const systemColorScheme = useThemeStore((state) => state.systemColorScheme);
	const setSystemColorScheme = useThemeStore((state) => state.setSystemColorScheme);

	useEffect(() => {
		if (deviceColorScheme) {
			setSystemColorScheme(deviceColorScheme);
		}
	}, [deviceColorScheme, setSystemColorScheme]);

		if (themePreference === 'system') {
			return systemColorScheme;
		}

		return themePreference;
}
