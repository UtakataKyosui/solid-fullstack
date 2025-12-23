import type { Component } from 'solid-js';

export const UnassignedItems: Component<{ items: any[] }> = (props) => (
    <div class="p-4 bg-slate-800 rounded mb-4">
        <h3 class="font-bold mb-2">Unassigned Items</h3>
        {props.items?.length === 0 ? "No items" : "Items list"}
    </div>
);

export const LocationCard: Component<{ location: any, items: any[] }> = (props) => (
    <div class="p-4 bg-slate-800 rounded mb-4">
        <h3 class="font-bold">{props.location.name}</h3>
        <p>{props.location.description}</p>
        <div class="mt-2 text-sm text-slate-400">{props.items.length} items</div>
    </div>
);

export const ManageGenresDialog: Component = () => <button class="px-2 py-1 bg-purple-600 rounded">Manage Genres</button>;
