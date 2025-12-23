import type { Component } from 'solid-js';
import { For } from 'solid-js';
import type { Genre, Location } from '../../../lib/types';
import { Input } from '../../ui/Input';

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    genreFilter: string;
    setGenreFilter: (genreId: string) => void;
    locationFilter: string;
    setLocationFilter: (locationId: string) => void;
    genres: Genre[];
    locations: Location[];
}

export const SearchBar: Component<SearchBarProps> = (props) => {
    return (
        <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
                <Input
                    placeholder="Search items..."
                    value={props.searchQuery}
                    onInput={(e) => props.setSearchQuery(e.currentTarget.value)}
                />
            </div>
            <div class="flex gap-4">
                <select
                    class="h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    value={props.genreFilter}
                    onChange={(e) => props.setGenreFilter(e.currentTarget.value)}
                >
                    <option value="">All Genres</option>
                    <For each={props.genres}>
                        {(genre) => <option value={genre.id.toString()}>{genre.name}</option>}
                    </For>
                </select>

                <select
                    class="h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    value={props.locationFilter}
                    onChange={(e) => props.setLocationFilter(e.currentTarget.value)}
                >
                    <option value="">All Locations</option>
                    <option value="unassigned">Unassigned</option>
                    <For each={props.locations}>
                        {(location) => <option value={location.id.toString()}>{location.name}</option>}
                    </For>
                </select>
            </div>
        </div>
    );
};
