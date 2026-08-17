import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface DrawerValue {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
}

const DrawerContext = createContext<DrawerValue | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

	const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);

	return <DrawerContext value={value}>{children}</DrawerContext>;
}

export function useDrawer(): DrawerValue {
	const value = useContext(DrawerContext);
	if (!value) {
		throw new Error('useDrawer는 DrawerProvider 안에서만 쓸 수 있어요.');
	}
	return value;
}
