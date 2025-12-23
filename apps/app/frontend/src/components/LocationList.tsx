import type { Component } from 'solid-js';
import { createResource, createSignal, Show, For } from 'solid-js';
import { useAuth } from '../lib/auth';
import type { Location, Genre } from '../lib/types';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Trash2, Edit2, Plus } from 'lucide-solid';
import { addToast } from './ui/Toast';

const LocationList: Component = () => {
    const { fetchWithAuth } = useAuth();
    const [dialogOpen, setDialogOpen] = createSignal(false);
    const [editingLocation, setEditingLocation] = createSignal<Location | null>(null);
    const [formData, setFormData] = createSignal({ name: '', description: '', genre_id: 0 });

    const [locations, { refetch: refetchLocations }] = createResource<Location[]>(async () => {
        const res = await fetchWithAuth('/api/locations/');
        if (!res.ok) return [];
        return res.json();
    });

    const [genres] = createResource<Genre[]>(async () => {
        const res = await fetchWithAuth('/api/genres/');
        if (!res.ok) return [];
        return res.json();
    });

    const openAddDialog = () => {
        setEditingLocation(null);
        setFormData({ name: '', description: '', genre_id: genres()?.[0]?.id || 0 });
        setDialogOpen(true);
    };

    const openEditDialog = (location: Location) => {
        setEditingLocation(location);
        setFormData({
            name: location.name,
            description: location.description || '',
            genre_id: location.genre_id
        });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const data = formData();

        if (!data.name.trim()) {
            addToast('error', '場所名を入力してください');
            return;
        }

        if (!data.genre_id) {
            addToast('error', 'ジャンルを選択してください');
            return;
        }

        try {
            if (editingLocation()) {
                const res = await fetchWithAuth(`/api/locations/${editingLocation()!.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    addToast('error', '場所の更新に失敗しました');
                    return;
                }

                addToast('success', '場所を更新しました');
            } else {
                const res = await fetchWithAuth('/api/locations/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!res.ok) {
                    addToast('error', '場所の作成に失敗しました');
                    return;
                }

                addToast('success', '場所を作成しました');
            }

            setDialogOpen(false);
            refetchLocations();
        } catch (error) {
            addToast('error', '通信エラーが発生しました');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('この場所を削除しますか？')) return;

        try {
            const res = await fetchWithAuth(`/api/locations/${id}`, { method: 'DELETE' });

            if (!res.ok) {
                addToast('error', '場所の削除に失敗しました');
                return;
            }

            addToast('success', '場所を削除しました');
            refetchLocations();
        } catch (error) {
            addToast('error', '通信エラーが発生しました');
        }
    };

    const getGenreName = (genre_id: number) => {
        return genres()?.find(g => g.id === genre_id)?.name || 'Unknown';
    };

    const getGenreColor = (genre_id: number) => {
        return genres()?.find(g => g.id === genre_id)?.color || '#666666';
    };

    return (
        <div class="space-y-4 sm:space-y-6">
            <div class="flex justify-between items-center gap-2">
                <h2 class="text-xl sm:text-2xl font-bold">場所管理</h2>
                <Button onClick={openAddDialog} class="flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2">
                    <Plus size={18} class="sm:w-5 sm:h-5" />
                    <span class="hidden xs:inline">新規</span>
                </Button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <For each={locations()} fallback={<div class="text-slate-400">場所がありません</div>}>
                    {(location) => (
                        <div class="p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                            <div class="flex items-center justify-between mb-2 gap-2">
                                <h3 class="font-semibold text-base sm:text-lg truncate flex-1">{location.name}</h3>
                                <div class="flex gap-1 sm:gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => openEditDialog(location)}
                                        class="p-1.5 sm:p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"
                                        title="編集"
                                    >
                                        <Edit2 size={14} class="sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(location.id)}
                                        class="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                        title="削除"
                                    >
                                        <Trash2 size={14} class="sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                            <Show when={location.description}>
                                <p class="text-sm text-slate-400 mb-2">{location.description}</p>
                            </Show>
                            <div class="flex items-center gap-2 mb-2">
                                <div
                                    class="w-4 h-4 rounded"
                                    style={{ 'background-color': getGenreColor(location.genre_id) }}
                                />
                                <span class="text-xs text-slate-500">{getGenreName(location.genre_id)}</span>
                            </div>
                            <div class="text-xs text-slate-500">
                                作成日: {new Date(location.created_at).toLocaleDateString('ja-JP')}
                            </div>
                        </div>
                    )}
                </For>
            </div>

            <Show when={dialogOpen()}>
                <Dialog isOpen={true} title={editingLocation() ? '場所編集' : '新規場所'} onClose={() => setDialogOpen(false)}>
                    <form onSubmit={handleSubmit} class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">名前</label>
                            <Input
                                type="text"
                                value={formData().name}
                                onInput={(e) => setFormData({ ...formData(), name: e.currentTarget.value })}
                                required
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">説明</label>
                            <Input
                                type="text"
                                value={formData().description}
                                onInput={(e) => setFormData({ ...formData(), description: e.currentTarget.value })}
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">ジャンル</label>
                            <select
                                value={formData().genre_id}
                                onInput={(e) => setFormData({ ...formData(), genre_id: parseInt(e.currentTarget.value) })}
                                class="w-full px-3 py-2 rounded border border-slate-600 bg-slate-700 text-white"
                                required
                            >
                                <For each={genres()}>
                                    {(genre) => (
                                        <option value={genre.id}>{genre.name}</option>
                                    )}
                                </For>
                            </select>
                        </div>
                        <div class="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                キャンセル
                            </Button>
                            <Button type="submit">
                                {editingLocation() ? '更新' : '作成'}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </Show>
        </div>
    );
};

export default LocationList;
