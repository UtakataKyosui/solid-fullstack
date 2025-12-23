import type { Component } from 'solid-js';
import type { Item, Location } from '../../../lib/types';
import { Button } from '@/components/ui/button';
import { Box, Stack, Flex } from 'styled-system/jsx';
import { css } from 'styled-system/css';

interface UnassignedItemsProps {
    items: Item[];
    onRefetch?: () => void;
}

export const UnassignedItems: Component<UnassignedItemsProps> = (props) => (
    <Box
        p={{ base: '3', sm: '4' }}
        bg="slate.800"
        rounded="lg"
        borderWidth="1px"
        borderColor="slate.700"
    >
        <h3 class={css({ fontWeight: 'bold', mb: '2' })}>Unassigned Items</h3>
        <Box color="slate.400" fontSize="sm">
            {props.items?.length === 0 ? 'No unassigned items' : `${props.items.length} items`}
        </Box>
    </Box>
);

interface LocationCardProps {
    location: Location;
    items: Item[];
    onRefetch?: () => void;
}

export const LocationCard: Component<LocationCardProps> = (props) => (
    <Box
        p={{ base: '3', sm: '4' }}
        bg="slate.800"
        rounded="lg"
        borderWidth="1px"
        borderColor="slate.700"
        _hover={{ borderColor: 'slate.600' }}
        transition="colors"
    >
        <Stack gap="2">
            <h3 class={css({ fontWeight: 'bold', fontSize: { base: 'base', sm: 'lg' } })}>
                {props.location.name}
            </h3>
            {props.location.description && (
                <p class={css({ fontSize: 'sm', color: 'slate.400' })}>
                    {props.location.description}
                </p>
            )}
            <Box fontSize="sm" color="slate.500">
                {props.items.length} {props.items.length === 1 ? 'item' : 'items'}
            </Box>
        </Stack>
    </Box>
);

export const ManageGenresDialog: Component = () => (
    <Button
        size={{ base: 'sm', sm: 'md' }}
        variant="outline"
        class={css({
            bg: 'purple.600!',
            color: 'white!',
            _hover: { bg: 'purple.700!' }
        })}
    >
        Manage Genres
    </Button>
);
