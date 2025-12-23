import type { Component } from 'solid-js';
import { createResource, createSignal, Show, For } from 'solid-js';
import { useAuth } from '../lib/auth';
import type { Genre } from '../lib/types';
import { Button } from './ui/Button';
import { Dialog } from './ui/Dialog';
import { Input } from './ui/Input';
import { Trash2, Edit2, Plus } from 'lucide-solid';

const GenreList: Component = () => {
    const { fetchWithAuth } = useAuth();
    const [dialogOpen, setDialogOpen] = createSignal(false);
    const [editingGenre, setEditingGenre] = createSignal<Genre | null>(null);
    const [formData, setFormData] = createSignal({ name: '', color: '#000000' });

    const [genres, { refetch }] = createResource<Genre[]>(async () => {
        const res = await fetchWithAuth('/api/genres/');
        if (!res.ok) return [];
        return res.json();
    });

    const openAddDialog = () => {
        setEditingGenre(null);
        setFormData({ name: '', color: '#000000' });
        setDialogOpen(true);
    };

    const openEditDialog = (genre: Genre) => {
        setEditingGenre(genre);
        setFormData({ name: genre.name, color: genre.color });
        setDialogOpen(true);
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const data = formData();

        if (editingGenre()) {
            await fetchWithAuth(`/api/genres/${editingGenre()!.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            await fetchWithAuth('/api/genres/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        setDialogOpen(false);
        refetch();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('このジャンルを削除しますか？')) return;

        await fetchWithAuth(`/api/genres/${id}`, { method: 'DELETE' });
        refetch();
    };

    return (
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">ジャンル管理</h2>
                <Button onClick={openAddDialog} class="flex items-center gap-2">
                    <Plus size={20} />
                    新規ジャンル
                </Button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <For each={genres()} fallback={<div class="text-slate-400">ジャンルがありません</div>}>
                    {(genre) => (
                        <div class="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-6 h-6 rounded"
                                        style={{ 'background-color': genre.color }}
                                    />
                                    <h3 class="font-semibold text-lg">{genre.name}</h3>
                                </div>
                                <div class="flex gap-2">
                                    <button
                                        onClick={() => openEditDialog(genre)}
                                        class="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors"
                                        title="編集"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(genre.id)}
                                        class="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                        title="削除"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div class="text-xs text-slate-500">
                                作成日: {new Date(genre.created_at).toLocaleDateString('ja-JP')}
                            </div>
                        </div>
                    )}
                </For>
            </div>

            <Show when={dialogOpen()}>
                <Dialog isOpen={true} title={editingGenre() ? 'ジャンル編集' : '新規ジャンル'} onClose={() => setDialogOpen(false)}>
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
                            <label class="block text-sm font-medium mb-1">カラー</label>
                            <input
                                type="color"
                                value={formData().color}
                                onInput={(e) => setFormData({ ...formData(), color: e.currentTarget.value })}
                                class="w-full h-10 rounded border border-slate-600 bg-slate-700"
                            />
                        </div>
                        <div class="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                キャンセル
                            </Button>
                            <Button type="submit">
                                {editingGenre() ? '更新' : '作成'}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </Show>
        </div>
    );
};

export default GenreList;
