import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui';
import { useTheme } from 'next-themes';

type ThemeProps = {
    className?: string;
    onClick?: () => void;
}
export function ThemeToggle(props: ThemeProps) {
    const { theme, setTheme } = useTheme()

    const toggleDarkMode = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
        props.onClick?.();
    };

    return (
        <Button
            onClick={toggleDarkMode}
            className={props.className}
        >
            {theme !== 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            <span className='pt-1'>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
        </Button>
    );
}
