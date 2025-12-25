import type { Component } from 'solid-js';
import { For } from 'solid-js';
import type { Genre, Location } from '../../../lib/types';
import { Input } from '@/components/ui/input';
import { css } from 'styled-system/css';
import { Flex, Box } from 'styled-system/jsx';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    genres: Genre[];
    locations: Location[];
    selectedGenre: string;
    selectedLocation: string;
    onGenreChange: (genreId: string) => void;
    onLocationChange: (locationId: string) => void;
}

export const SearchBar: Component<SearchBarProps> = (props) => {
    return (
        <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: '2', sm: '3', md: '4' }}
        >
            <Box flex="1">
                <Input
                    placeholder="Search items..."
                    value={props.searchQuery}
                    onInput={(e) => props.onSearchChange(e.currentTarget.value)}
                />
            </Box>
            <Flex gap={{ base: '2', sm: '3', md: '4' }}>
                <select
                    class={css({
                        h: '10',
                        px: '3',
                        rounded: 'md',
                        bg: 'bg.default',
                        borderWidth: '1px',
                        borderColor: 'border.default',
                        color: 'fg.default',
                        fontSize: 'sm',
                        _focus: {
                            outlineWidth: '2px',
                            outlineOffset: '2px',
                            outlineColor: 'blue.500'
                        }
                    })}
                    value={props.selectedGenre}
                    onChange={(e) => props.onGenreChange(e.currentTarget.value)}
                >
                    <option value="">All Genres</option>
                    <For each={props.genres}>
                        {(genre) => <option value={genre.id.toString()}>{genre.name}</option>}
                    </For>
                </select>

                <select
                    class={css({
                        h: '10',
                        px: '3',
                        rounded: 'md',
                        bg: 'bg.default',
                        borderWidth: '1px',
                        borderColor: 'border.default',
                        color: 'fg.default',
                        fontSize: 'sm',
                        _focus: {
                            outlineWidth: '2px',
                            outlineOffset: '2px',
                            outlineColor: 'blue.500'
                        }
                    })}
                    value={props.selectedLocation}
                    onChange={(e) => props.onLocationChange(e.currentTarget.value)}
                >
                    <option value="">All Locations</option>
                    <For each={props.locations}>
                        {(location) => <option value={location.id.toString()}>{location.name}</option>}
                    </For>
                </select>
            </Flex>
        </Flex>
    );
};
