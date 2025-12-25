import { type Component, type ParentProps } from 'solid-js';
import { Toaster } from '@/components/ui/toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Box, Flex } from 'styled-system/jsx';

const Layout: Component<ParentProps> = (props) => {
    return (
        <Box minH="100vh" bg="bg.canvas" color="fg.default">
            <Toaster />

            {/* Theme Toggle Button */}
            <Flex justify="flex-end" p="4">
                <ThemeToggle />
            </Flex>

            {props.children}
        </Box>
    );
};

export default Layout;
