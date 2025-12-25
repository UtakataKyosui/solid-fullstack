import type { Component } from 'solid-js';
import { Show, For } from 'solid-js';
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
        bg="bg.subtle"
        rounded="xl"
        borderWidth="1px"
        borderColor="border.default"
    >
        <h3 class={css({ fontWeight: 'bold', mb: '2' })}>Unassigned</h3>
        <Box color="fg.muted" fontSize="sm" mb="3">
            Items not assigned to any location
        </Box>
        <Show when={props.items?.length === 0}>
            <Box color="fg.muted" fontSize="sm" fontStyle="italic">
                No items
            </Box>
        </Show>
        <Show when={props.items?.length > 0}>
            <Stack gap="2">
                <For each={props.items}>
                    {(item) => (
                        <Box
                            p="2"
                            bg="bg.default"
                            rounded="md"
                            borderWidth="1px"
                            borderColor="border.default"
                        >
                            <Flex justify="space-between" align="center">
                                <Box>
                                    <div class={css({ fontWeight: 'medium', fontSize: 'sm' })}>
                                        {item.name}
                                    </div>
                                    <Show when={item.description}>
                                        <div class={css({ fontSize: 'xs', color: 'fg.muted' })}>
                                            {item.description}
                                        </div>
                                    </Show>
                                </Box>
                            </Flex>
                        </Box>
                    )}
                </For>
            </Stack>
        </Show>
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
        bg="bg.subtle"
        rounded="xl"
        borderWidth="1px"
        borderColor="border.default"
        _hover={{ borderColor: 'border.muted' }}
        transition="colors"
    >
        <Stack gap="3">
            <Box>
                <h3 class={css({ fontWeight: 'bold', fontSize: { base: 'base', sm: 'lg' } })}>
                    {props.location.name}
                </h3>
                {props.location.description && (
                    <p class={css({ fontSize: 'sm', color: 'fg.muted', mt: '1' })}>
                        {props.location.description}
                    </p>
                )}
            </Box>

            <Show when={props.items.length === 0}>
                <Box color="fg.muted" fontSize="sm" fontStyle="italic">
                    No items in this location
                </Box>
            </Show>

            <Show when={props.items.length > 0}>
                <Stack gap="2">
                    <For each={props.items}>
                        {(item) => (
                            <Box
                                p="2"
                                bg="bg.default"
                                rounded="md"
                                borderWidth="1px"
                                borderColor="border.default"
                            >
                                <Flex justify="space-between" align="center">
                                    <Box>
                                        <div class={css({ fontWeight: 'medium', fontSize: 'sm' })}>
                                            {item.name}
                                        </div>
                                        <Show when={item.description}>
                                            <div class={css({ fontSize: 'xs', color: 'fg.muted' })}>
                                                {item.description}
                                            </div>
                                        </Show>
                                    </Box>
                                </Flex>
                            </Box>
                        )}
                    </For>
                </Stack>
            </Show>
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
